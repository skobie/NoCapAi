/*
  # Add Free Scans Tracking

  ## Overview
  Adds scan count tracking to enable first 3 scans free for all users.

  ## Changes
  
  ### Modified Tables
  
  #### `token_balances`
  - Add `total_scans` column (integer, default 0) - Tracks total number of scans performed
  - Add `free_scans_used` column (integer, default 0) - Tracks how many of the 3 free scans have been used
  
  ## Notes
  - First 3 scans are free for all users
  - After 3 scans, each scan costs 100 tokens
  - Existing users will get their 3 free scans
*/

-- Add scan tracking columns to token_balances
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'token_balances' AND column_name = 'total_scans'
  ) THEN
    ALTER TABLE token_balances ADD COLUMN total_scans integer NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'token_balances' AND column_name = 'free_scans_used'
  ) THEN
    ALTER TABLE token_balances ADD COLUMN free_scans_used integer NOT NULL DEFAULT 0 CHECK (free_scans_used >= 0 AND free_scans_used <= 3);
  END IF;
END $$;