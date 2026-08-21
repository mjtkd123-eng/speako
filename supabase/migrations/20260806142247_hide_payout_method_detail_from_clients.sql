-- F9: PayPal addresses and bank details must not be readable through the Data API.
-- Keep row reads working for the payout history screen, minus the sensitive column.
REVOKE SELECT ON public.payout_requests FROM anon, authenticated;
GRANT SELECT (id, wallet_id, amount, method, status, created_at, processed_at)
  ON public.payout_requests TO anon, authenticated;
