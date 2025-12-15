/*
  # Token System for Content Scanning

  ## Overview
  Creates a comprehensive token-based payment system for content analysis scans.
  Users receive tokens through purchases and spend them on scans.

  ## New Tables

  ### `token_balances`
  Tracks the current token balance for each user.
  - `user_id` (uuid, primary key, references auth.users) - The user who owns the tokens
  - `balance` (integer, default 10) - Current token count (users start with 10 free tokens)
  - `created_at` (timestamptz) - When the account was created
  - `updated_at` (timestamptz) - Last balance update time

  ### `token_transactions`
  Records all token purchases and deductions for audit trail.
  - `id` (uuid, primary key) - Unique transaction identifier
  - `user_id` (uuid, references auth.users) - User who made the transaction
  - `type` (text) - Transaction type: 'purchase', 'deduction', 'bonus'
  - `amount` (integer) - Number of tokens (positive for credits, negative for debits)
  - `balance_after` (integer) - Token balance after this transaction
  - `description` (text) - Human-readable description
  - `stripe_payment_id` (text, nullable) - Stripe payment intent ID for purchases
  - `scan_id` (uuid, nullable, references scans) - Related scan for deductions
  - `metadata` (jsonb) - Additional transaction data
  - `created_at` (timestamptz) - Transaction timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only view their own token data
  - Only service role can modify balances (through edge functions)

  ## Notes
  - Each scan costs 1 token
  - New users automatically get 10 free tokens
  - Token packages: $0.99/500, $4.99/3000, $10.00/7000
*/

-- Create token_balances table
CREATE TABLE IF NOT EXISTS token_balances (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 10 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'deduction', 'bonus', 'refund')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text NOT NULL,
  stripe_payment_id text,
  scan_id uuid REFERENCES scans(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_stripe_payment ON token_transactions(stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;

-- Enable RLS
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for token_balances
CREATE POLICY "Users can view own token balance"
  ON token_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create token balance for new users
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create token balance when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_token_balance_for_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_token_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
DROP TRIGGER IF EXISTS update_token_balances_updated_at ON token_balances;
CREATE TRIGGER update_token_balances_updated_at
  BEFORE UPDATE ON token_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_token_balance_timestamp();