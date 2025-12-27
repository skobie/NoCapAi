# How to View Support Form Submissions

All support form submissions are stored securely in your Supabase database in the `support_feedback` table.

## Database Table Structure

The `support_feedback` table contains:
- `id` - Unique identifier for each submission
- `user_id` - User who submitted the feedback
- `email` - Contact email for follow-up
- `feedback_type` - Type: 'review', 'bug', 'feature_request', or 'other'
- `subject` - Brief subject line
- `message` - Detailed feedback message
- `created_at` - Timestamp of submission

## Method 1: View in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "Table Editor" in the left sidebar
4. Select the `support_feedback` table
5. You'll see all submissions with full details

## Method 2: Query Using SQL

In the Supabase SQL Editor, run:

```sql
-- View all feedback submissions (most recent first)
SELECT
  sf.id,
  sf.email,
  sf.feedback_type,
  sf.subject,
  sf.message,
  sf.created_at,
  u.email as user_email
FROM support_feedback sf
LEFT JOIN auth.users u ON sf.user_id = u.id
ORDER BY sf.created_at DESC;
```

## Method 3: Query by Feedback Type

```sql
-- View only bug reports
SELECT * FROM support_feedback
WHERE feedback_type = 'bug'
ORDER BY created_at DESC;

-- View only reviews
SELECT * FROM support_feedback
WHERE feedback_type = 'review'
ORDER BY created_at DESC;

-- View only feature requests
SELECT * FROM support_feedback
WHERE feedback_type = 'feature_request'
ORDER BY created_at DESC;
```

## Method 4: Export Submissions

From the Supabase dashboard:
1. Go to Table Editor → `support_feedback`
2. Click the "Export" button (top right)
3. Download as CSV for analysis in Excel/Sheets

## Setting Up Email Notifications (Optional)

You can set up Supabase Edge Functions or webhooks to send you email notifications when new feedback is submitted. This requires additional configuration with an email service like SendGrid or Resend.

## Privacy Note

Remember that this data contains user feedback and contact information. Handle it responsibly and in accordance with your privacy policy.
