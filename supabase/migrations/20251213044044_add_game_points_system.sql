/*
  # Add Game Points System

  ## Overview
  Adds a points-based game system where users can earn free scans by correctly guessing if content is AI-generated.

  ## Changes
  
  ### Modified Tables
  
  #### `token_balances`
  - Add `game_points` column (integer, default 0) - Tracks points earned from playing the guessing game
  - Points are awarded for correct guesses (1 point per correct guess)
  - Every 10 points automatically converts to 1 free scan
  
  ## Notes
  - Users earn 1 point for each correct guess
  - 10 points = 1 free scan added to account
  - Points reset to 0 when converted to free scan
*/

-- Add game_points column to token_balances
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'token_balances' AND column_name = 'game_points'
  ) THEN
    ALTER TABLE token_balances ADD COLUMN game_points integer NOT NULL DEFAULT 0 CHECK (game_points >= 0);
  END IF;
END $$;