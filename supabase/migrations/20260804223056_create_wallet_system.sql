/*
# Wallet, Point, and Payout System

## Overview
Creates a complete wallet system for the language learning platform with three tables:
- `wallets`: Stores point balances for students (purchased points) and tutors (earned points)
- `point_transactions`: Records all point movements (purchases, lesson bookings, lesson earnings, commissions)
- `payout_requests`: Tutor withdrawal requests with status tracking

## Tables

### wallets
- `id` (uuid, PK)
- `owner_type` (text: 'student' or 'tutor')
- `owner_name` (text: display name for the wallet owner)
- `balance` (integer: current point balance, defaults to 0)
- `total_earned` (integer: lifetime earnings, for tutors)
- `total_spent` (integer: lifetime spending, for students)
- `total_commission` (integer: total platform commission deducted, for tutors)
- `created_at`, `updated_at` (timestamps)

### point_transactions
- `id` (uuid, PK)
- `wallet_id` (uuid, FK to wallets)
- `type` (text: 'purchase', 'lesson_booking', 'lesson_earning', 'commission', 'payout', 'refund')
- `amount` (integer: positive for credits, negative for debits)
- `description` (text: human-readable description)
- `reference` (text: optional reference like lesson ID or payment provider)
- `created_at` (timestamp)

### payout_requests
- `id` (uuid, PK)
- `wallet_id` (uuid, FK to wallets)
- `amount` (integer: requested payout amount in points)
- `method` (text: 'paypal' or 'bank')
- `method_detail` (text: PayPal email or bank account info)
- `status` (text: 'pending', 'approved', 'completed', 'rejected'; defaults to 'pending')
- `created_at`, `processed_at` (timestamps)

## Security
- Single-tenant app (no auth screen). All policies use `TO anon, authenticated` with `USING (true)` since data is intentionally shared for the demo.
- RLS enabled on all three tables.
- Full CRUD policies for anon + authenticated on all tables.
*/