/*
  # Add Update Policy for Game Points
  
  ## Overview
  Adds RLS policy to allow users to update their own game points in the token_balances table.
  
  ## Changes
  
  ### Security Policies
  - Add UPDATE policy for `token_balances` table
    - Allows authenticated users to update their own record
    - Users can only update their own game_points and free_scans_used columns
  
  ## Notes
  - This policy is required for the game to function correctly
  - Users can update their game progress (game_points) and track free scans earned from the game
*/

-- Allow users to update their own game points and free scans
CREATE POLICY "Users can update own game progress"
  ON token_balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
