/*
  # Fix Security and Performance Issues

  ## Overview
  Addresses multiple security and performance issues identified in the database audit.

  ## Changes

  ### 1. Index Optimization
  - **Add** covering index for `token_transactions.scan_id` foreign key to improve query performance
  - **Remove** unused indexes that are not being utilized

  ### 2. RLS Policy Performance Optimization
  All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()` to prevent
  re-evaluation for each row, significantly improving query performance at scale.
  
  **Tables affected:**
  - `scans` - 4 policies updated
  - `token_balances` - 2 policies updated
  - `token_transactions` - 1 policy updated

  ### 3. Function Security Hardening
  Fixed search_path mutability in database functions by explicitly setting search_path
  to prevent potential security vulnerabilities.

  **Functions fixed:**
  - `create_token_balance_for_user`
  - `update_token_balance_timestamp`
  - `update_updated_at_column`

  ## Security Notes
  - All changes maintain existing access control logic
  - Performance improvements do not compromise security
  - Functions now have immutable search_path for better security
*/

-- =====================================================
-- 1. INDEX OPTIMIZATION
-- =====================================================

-- Add covering index for scan_id foreign key
CREATE INDEX IF NOT EXISTS idx_token_transactions_scan_id 
  ON token_transactions(scan_id) 
  WHERE scan_id IS NOT NULL;

-- Remove unused indexes
DROP INDEX IF EXISTS idx_token_transactions_user_id;
DROP INDEX IF EXISTS idx_token_transactions_stripe_payment;

-- =====================================================
-- 2. RLS POLICY OPTIMIZATION
-- =====================================================

-- Update scans table policies
DROP POLICY IF EXISTS "Users can view own scans" ON scans;
CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own scans" ON scans;
CREATE POLICY "Users can create own scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own scans" ON scans;
CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own scans" ON scans;
CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Update token_balances table policies
DROP POLICY IF EXISTS "Users can view own token balance" ON token_balances;
CREATE POLICY "Users can view own token balance"
  ON token_balances FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own game progress" ON token_balances;
CREATE POLICY "Users can update own game progress"
  ON token_balances FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Update token_transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON token_transactions;
CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- 3. FUNCTION SECURITY HARDENING
-- =====================================================

-- Fix create_token_balance_for_user with immutable search_path
CREATE OR REPLACE FUNCTION create_token_balance_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO token_balances (user_id, balance)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the initial bonus
  INSERT INTO token_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 10, 10, 'Welcome bonus - 10 free tokens');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public, pg_temp;

-- Fix update_token_balance_timestamp with immutable search_path
CREATE OR REPLACE FUNCTION update_token_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SET search_path = public, pg_temp;

-- Fix update_updated_at_column if it exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SET search_path = public, pg_temp;