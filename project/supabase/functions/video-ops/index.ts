import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY") ?? "";
const LIVEKIT_API_KEY = Deno.env.get("LIVEKIT_API_KEY") ?? "";
const LIVEKIT_API_SECRET = Deno.env.get("LIVEKIT_API_SECRET") ?? "";
const LIVEKIT_URL = Deno.env.get("LIVEKIT_URL") ?? "";

// F15: rooms cost money at the provider, so cap creation per caller and overall.
const RATE_WINDOW_MS = 60_000;
const MAX_ROOMS_PER_WINDOW = 3;
const MAX_ROOMS_PER_HOUR_TOTAL = 60;
const recentByIp = new Map<string, number[]>();
const recentGlobal: number[] = [];

function prune(list: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return list.filter((t) => t > cutoff);
}

function rateLimited(ip: string): boolean {
  const perIp = prune(recentByIp.get(ip) ?? [], RATE_WINDOW_MS);
  const global = prune(recentGlobal, 3_600_000);
  if (perIp.length >= MAX_ROOMS_PER_WINDOW) return true;
  if (global.length >= MAX_ROOMS_PER_HOUR_TOTAL) return true;
  perIp.push(Date.now());
  recentByIp.set(ip, perIp);
  recentGlobal.length = 0;
  recentGlobal.push(...global, Date.now());
  return false;
}

// F14: never trust a client-supplied room name — a stranger could name a room
// that is already in progress and be handed a token for someone else's lesson.
function generateRoomName(): string {
  return `speako-${crypto.randomUUID()}`;
}

function safeParticipantName(value: unknown): string {
  if (typeof value !== "string") return "Participant";
  const cleaned = value.replace(/[^\p{L}\p{N} _.-]/gu, "").trim().slice(0, 40);
  return cleaned || "Participant";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action } = body;

    if (action === "get-provider") {
      const { data, error } = await supabase.rpc("get_active_provider");
      if (error) throw error;
      return json(data);
    }

    if (action === "create-room") {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
      if (rateLimited(ip)) {
        return json({ error: "Too many room requests. Please wait a moment." }, 429);
      }

      const lessonId = typeof body.lessonId === "string" ? body.lessonId : null;
      const roomName = generateRoomName();
      const participantName = safeParticipantName(body.participantName);
      const { data: providerData, error: providerErr } = await supabase.rpc(
        "get_active_provider",
      );
      if (providerErr) throw providerErr;
      const provider: string = providerData.provider;

      const { data: callData, error: callErr } = await supabase.rpc(
        "start_video_call",
        { p_lesson_id: lessonId ?? null, p_room_name: roomName, p_provider: provider },
      );
      if (callErr) throw callErr;
      const callId = callData.call_id;

      if (provider === "daily") {
        const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: roomName,
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              enable_recording: false,
              start_video_off: false,
              start_audio_off: false,
              exp: Math.floor(Date.now() / 1000) + 3600,
            },
          }),
        });

        if (!dailyRes.ok) {
          // Log upstream detail server-side only; never return it to the caller.
          console.error("Daily.co room creation failed", dailyRes.status, await dailyRes.text());
          throw new Error("ROOM_CREATE_FAILED");
        }

        const dailyRoom = await dailyRes.json();
        const roomUrl: string = dailyRoom.url;

        let token: string | null = null;
        const tokenRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              room_name: roomName,
              user_name: participantName ?? "Participant",
              is_owner: false,
              enable_screenshare: true,
            },
          }),
        });
        if (tokenRes.ok) {
          const tokenJson = await tokenRes.json();
          token = tokenJson.token;
        }

        return json({
          provider: "daily",
          roomUrl,
          token,
          callId,
          roomName,
          usage: providerData,
        });
      }

      // LiveKit
      if (provider === "livekit") {
        if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
          throw new Error(
            "LiveKit not configured: set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET",
          );
        }

        const httpUrl = LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://");
        const authToken = await liveKitGrantsToken(
          LIVEKIT_API_KEY,
          LIVEKIT_API_SECRET,
          "",
          "system",
          { roomCreate: true, roomAdmin: true },
        );

        // Create room (ignore if already exists)
        try {
          await fetch(`${httpUrl}/twirp/livekit.RoomService/CreateRoom`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              name: roomName,
              empty_timeout: 3600,
              max_participants: 2,
            }),
          });
        } catch {
          // Room may already exist — non-fatal
        }

        const participantToken = await liveKitGrantsToken(
          LIVEKIT_API_KEY,
          LIVEKIT_API_SECRET,
          roomName,
          participantName,
          { canPublish: true, canSubscribe: true, canPublishData: true },
        );

        return json({
          provider: "livekit",
          roomUrl: LIVEKIT_URL,
          token: participantToken,
          callId,
          roomName,
          usage: providerData,
        });
      }
    }

    if (action === "end-call") {
      const callId = typeof body.callId === "string" ? body.callId : "";
      if (!/^[0-9a-f-]{36}$/i.test(callId)) {
        return json({ error: "Invalid request" }, 400);
      }
      const { data, error } = await supabase.rpc("end_video_call", {
        p_call_id: callId,
      });
      if (error) throw error;
      return json(data);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    // F23: internal and upstream error detail stays in the logs.
    console.error("video-ops failure:", err);
    return json({ error: "Request could not be completed" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── LiveKit JWT (grants token) via Web Crypto (async) ──
async function liveKitGrantsToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  participantName: string,
  grants: Record<string, unknown>,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    iss: apiKey,
    sub: participantName,
    iat: now,
    exp: now + 3600,
    nbf: now,
    ...grants,
  };
  if (roomName) payload.video = { room: roomName, ...grants };

  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(payload));
  const signingInput = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  const signature = b64urlBytes(new Uint8Array(sigBuf));

  return `${encHeader}.${encPayload}.${signature}`;
}

function b64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return b64urlBytes(bytes);
}

function b64urlBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
