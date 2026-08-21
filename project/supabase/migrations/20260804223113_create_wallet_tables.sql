/*
# Create wallet system tables

## Tables
1. `wallets` - point balances for students and tutors
2. `point_transactions` - ledger of all point movements
3. `payout_requests` - tutor withdrawal requests

## Security
- Single-tenant (no auth). All tables allow anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL DEFAULT 'student' CHECK (owner_type IN ('student', 'tutor')),
  owner_name text NOT NULL DEFAULT 'User',
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  total_commission integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_wallets" ON wallets;
CREATE POLICY "anon_select_wallets" ON wallets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wallets" ON wallets;
CREATE POLICY "anon_insert_wallets" ON wallets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_wallets" ON wallets;
CREATE POLICY "anon_update_wallets" ON wallets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_wallets" ON wallets;
CREATE POLICY "anon_delete_wallets" ON wallets FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'lesson_booking', 'lesson_earning', 'commission', 'payout', 'refund')),
  amount integer NOT NULL,
  description text NOT NULL DEFAULT '',
  reference text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON point_transactions;
CREATE POLICY "anon_select_transactions" ON point_transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON point_transactions;
CREATE POLICY "anon_insert_transactions" ON point_transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON point_transactions;
CREATE POLICY "anon_update_transactions" ON point_transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON point_transactions;
CREATE POLICY "anon_delete_transactions" ON point_transactions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  method text NOT NULL CHECK (method IN ('paypal', 'bank')),
  method_detail text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payouts" ON payout_requests;
CREATE POLICY "anon_select_payouts" ON payout_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payouts" ON payout_requests;
CREATE POLICY "anon_insert_payouts" ON payout_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payouts" ON payout_requests;
CREATE POLICY "anon_update_payouts" ON payout_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payouts" ON payout_requests;
CREATE POLICY "anon_delete_payouts" ON payout_requests FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON point_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payouts_wallet_id ON payout_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallets_owner_type ON wallets(owner_type);