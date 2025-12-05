-- Migration: Trial System Tables
-- Creates tables for pre-test answers, trial email tracking, and extends profiles table

-- Extend profiles table with trial-related fields (if not exists)
DO $$ 
BEGIN
  -- Add subscription_tier if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;

  -- Add trial_started_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_started_at TIMESTAMPTZ;
  END IF;

  -- Add pretest_completed if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'pretest_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pretest_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add pretest_answers if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'pretest_answers'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pretest_answers JSONB;
  END IF;

  -- Add email_connected if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email_connected'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_connected BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add workflows_created if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'workflows_created'
  ) THEN
    ALTER TABLE profiles ADD COLUMN workflows_created BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create pretest_answers table (detailed answers storage)
CREATE TABLE IF NOT EXISTS pretest_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create trial_emails_sent table (track which emails were sent)
CREATE TABLE IF NOT EXISTS trial_emails_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_id TEXT,
  UNIQUE(user_id, day)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pretest_answers_user_id ON pretest_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_emails_sent_user_id ON trial_emails_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_emails_sent_day ON trial_emails_sent(day);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_started_at ON profiles(trial_started_at);

-- RLS Policies
ALTER TABLE pretest_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_emails_sent ENABLE ROW LEVEL SECURITY;

-- Users can read their own pretest answers
CREATE POLICY "Users can read own pretest answers"
  ON pretest_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/update their own pretest answers
CREATE POLICY "Users can manage own pretest answers"
  ON pretest_answers FOR ALL
  USING (auth.uid() = user_id);

-- Service role can read all (for email sending)
CREATE POLICY "Service role can read all pretest answers"
  ON pretest_answers FOR SELECT
  USING (auth.role() = 'service_role');

-- Users can read their own trial email records
CREATE POLICY "Users can read own trial email records"
  ON trial_emails_sent FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all trial email records
CREATE POLICY "Service role can manage trial email records"
  ON trial_emails_sent FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pretest_answers
DROP TRIGGER IF EXISTS update_pretest_answers_updated_at ON pretest_answers;
CREATE TRIGGER update_pretest_answers_updated_at
  BEFORE UPDATE ON pretest_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
