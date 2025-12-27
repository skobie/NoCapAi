/*
  # Create Support Feedback Table

  1. New Tables
    - `support_feedback`
      - `id` (uuid, primary key) - unique identifier for each feedback submission
      - `user_id` (uuid, foreign key) - references auth.users
      - `email` (text) - user's email for follow-up
      - `feedback_type` (text) - type of feedback: 'review', 'bug', 'feature_request', 'other'
      - `subject` (text) - brief subject line
      - `message` (text) - detailed feedback message
      - `created_at` (timestamptz) - when the feedback was submitted

  2. Security
    - Enable RLS on `support_feedback` table
    - Add policy for authenticated users to insert their own feedback
    - Add policy for authenticated users to view their own feedback submissions

  3. Important Notes
    - Users can submit multiple feedback entries
    - All submissions are timestamped for tracking
    - Email is stored for potential follow-up contact
*/

CREATE TABLE IF NOT EXISTS support_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  feedback_type text NOT NULL DEFAULT 'other',
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
  ON support_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON support_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_support_feedback_user_id ON support_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_support_feedback_created_at ON support_feedback(created_at DESC);
