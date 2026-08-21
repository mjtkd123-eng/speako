/*
# Video Call Minute Tracking & Provider Auto-Switch

## Overview
Creates tables to track per-call duration so the platform can automatically
switch from Daily.co to LiveKit when the monthly cumulative free-tier limit
(10,000 minutes) is reached.

## New Table: `video_calls`
- `id` (uuid, PK)
- `lesson_id` (uuid, FK → lessons, nullable)
- `room_name` (text, unique) — Daily.co room name or LiveKit room name
- `provider` (text: 'daily' | 'livekit') — which provider served this call
- `status` (text: 'active' | 'ended')
- `started_at` (timestamptz) — call start
- `ended_at` (timestamptz) — call end
- `duration_seconds` (integer, 0 until ended)
- `participant_count` (integer, default 2)
- `created_at` (timestamptz)

## New Table: `provider_usage`
- `id` (uuid, PK)
- `provider` (text: 'daily' | 'livekit')
- `month_key` (text, e.g. '2026-08') — for monthly aggregation
- `total_seconds` (integer, cumulative seconds used that month)
- `switched` (boolean, default false) — true after auto-switch to LiveKit
- `created_at`, `updated_at` (timestamps)
- Unique constraint on (provider, month_key)

## New Functions
- `get_active_provider()` — returns 'livekit' if Daily.co monthly usage >= 600,000 sec (10,000 min), else 'daily'
- `start_video_call(p_lesson_id, p_room_name, p_provider)` — inserts a call row
- `end_video_call(p_call_id)` — ends call, computes duration, updates monthly aggregate, sets switched flag

## Security
- Single-tenant app. All policies `TO anon, authenticated` with `USING (true)`.
- RLS enabled on both new tables.
- Functions are SECURITY DEFINER for atomic updates to provider_usage.
*/

CREATE TABLE IF NOT EXISTS video_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  room_name text NOT NULL UNIQUE,
  provider text NOT NULL CHECK (provider IN ('daily', 'livekit')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0,
  participant_count integer NOT NULL DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_video_calls" ON video_calls;
CREATE POLICY "anon_select_video_calls" ON video_calls FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_video_calls" ON video_calls;
CREATE POLICY "anon_insert_video_calls" ON video_calls FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_video_calls" ON video_calls;
CREATE POLICY "anon_update_video_calls" ON video_calls FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_video_calls" ON video_calls;
CREATE POLICY "anon_delete_video_calls" ON video_calls FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS provider_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('daily', 'livekit')),
  month_key text NOT NULL,
  total_seconds integer NOT NULL DEFAULT 0,
  switched boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (provider, month_key)
);

ALTER TABLE provider_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_provider_usage" ON provider_usage;
CREATE POLICY "anon_select_provider_usage" ON provider_usage FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_provider_usage" ON provider_usage;
CREATE POLICY "anon_insert_provider_usage" ON provider_usage FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_provider_usage" ON provider_usage;
CREATE POLICY "anon_update_provider_usage" ON provider_usage FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_provider_usage" ON provider_usage;
CREATE POLICY "anon_delete_provider_usage" ON provider_usage FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_video_calls_lesson ON video_calls(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_provider_usage_month ON provider_usage(month_key);

-- get_active_provider: returns which provider should serve new calls
CREATE OR REPLACE FUNCTION get_active_provider()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_key text := to_char(now(), 'YYYY-MM');
  v_daily_seconds integer := 0;
  v_switched boolean := false;
  v_provider text;
BEGIN
  SELECT total_seconds, switched INTO v_daily_seconds, v_switched
  FROM provider_usage
  WHERE provider = 'daily' AND month_key = v_month_key;

  IF v_daily_seconds IS NULL THEN
    v_daily_seconds := 0;
  END IF;

  IF v_switched OR v_daily_seconds >= 600000 THEN
    v_provider := 'livekit';
  ELSE
    v_provider := 'daily';
  END IF;

  RETURN jsonb_build_object(
    'provider', v_provider,
    'daily_seconds', v_daily_seconds,
    'daily_limit_seconds', 600000,
    'remaining_seconds', GREATEST(600000 - v_daily_seconds, 0),
    'switched', v_switched
  );
END;
$$;

-- start_video_call: inserts a new call record
CREATE OR REPLACE FUNCTION start_video_call(
  p_lesson_id uuid,
  p_room_name text,
  p_provider text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_id uuid;
BEGIN
  INSERT INTO video_calls (lesson_id, room_name, provider, status, started_at)
  VALUES (p_lesson_id, p_room_name, p_provider, 'active', now())
  RETURNING id INTO v_call_id;

  RETURN jsonb_build_object('success', true, 'call_id', v_call_id);
END;
$$;

-- end_video_call: ends call, computes duration, updates monthly aggregate
CREATE OR REPLACE FUNCTION end_video_call(p_call_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call video_calls%ROWTYPE;
  v_month_key text;
  v_duration integer;
  v_switched boolean := false;
BEGIN
  SELECT * INTO v_call FROM video_calls WHERE id = p_call_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  IF v_call.status = 'ended' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call already ended');
  END IF;

  v_duration := EXTRACT(EPOCH FROM (now() - v_call.started_at))::integer;
  v_month_key := to_char(v_call.started_at, 'YYYY-MM');

  UPDATE video_calls
  SET status = 'ended',
      ended_at = now(),
      duration_seconds = v_duration
  WHERE id = p_call_id;

  -- Upsert monthly aggregate
  INSERT INTO provider_usage (provider, month_key, total_seconds, switched)
  VALUES (v_call.provider, v_month_key, v_duration, false)
  ON CONFLICT (provider, month_key)
  DO UPDATE SET
    total_seconds = provider_usage.total_seconds + v_duration,
    updated_at = now();

  -- Auto-switch: if daily monthly total crosses limit, mark switched
  IF v_call.provider = 'daily' THEN
    UPDATE provider_usage
    SET switched = true, updated_at = now()
    WHERE provider = 'daily' AND month_key = v_month_key
      AND total_seconds >= 600000;

    SELECT switched INTO v_switched
    FROM provider_usage
    WHERE provider = 'daily' AND month_key = v_month_key;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'duration_seconds', v_duration,
    'provider', v_call.provider,
    'switched', v_switched
  );
END;
$$;