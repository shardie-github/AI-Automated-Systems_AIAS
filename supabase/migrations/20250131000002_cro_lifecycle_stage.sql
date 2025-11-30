-- CRO Mode: Add lifecycle_stage to leads table
-- Ensures proper lead lifecycle tracking

-- Add lifecycle_stage enum type
DO $$ BEGIN
  CREATE TYPE lifecycle_stage AS ENUM (
    'subscriber',
    'lead',
    'mql', -- Marketing Qualified Lead
    'sql', -- Sales Qualified Lead
    'customer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add lifecycle_stage column to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS lifecycle_stage lifecycle_stage DEFAULT 'lead';

-- Create index for lifecycle_stage queries
CREATE INDEX IF NOT EXISTS idx_leads_lifecycle_stage ON leads(lifecycle_stage);

-- Update existing leads: set lifecycle_stage based on status
UPDATE leads
SET lifecycle_stage = CASE
  WHEN status = 'converted' THEN 'customer'::lifecycle_stage
  WHEN qualified = true THEN 'sql'::lifecycle_stage
  WHEN score >= 50 THEN 'mql'::lifecycle_stage
  ELSE 'lead'::lifecycle_stage
END
WHERE lifecycle_stage IS NULL;

-- Create trigger to log lifecycle_stage changes to activity_logs
CREATE OR REPLACE FUNCTION log_lifecycle_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log lifecycle_stage changes to activity_logs (if table exists)
  IF NEW.lifecycle_stage IS DISTINCT FROM OLD.lifecycle_stage THEN
    INSERT INTO lead_activities (
      lead_id,
      activity_type,
      activity_data,
      tenant_id
    ) VALUES (
      NEW.id,
      'lifecycle_stage_changed',
      jsonb_build_object(
        'old_stage', OLD.lifecycle_stage,
        'new_stage', NEW.lifecycle_stage,
        'changed_at', NOW()
      ),
      NEW.tenant_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_log_lifecycle_stage_change ON leads;
CREATE TRIGGER trigger_log_lifecycle_stage_change
  AFTER UPDATE OF lifecycle_stage ON leads
  FOR EACH ROW
  WHEN (OLD.lifecycle_stage IS DISTINCT FROM NEW.lifecycle_stage)
  EXECUTE FUNCTION log_lifecycle_stage_change();

-- Also log status changes (CRO requirement)
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO lead_activities (
      lead_id,
      activity_type,
      activity_data,
      tenant_id
    ) VALUES (
      NEW.id,
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      ),
      NEW.tenant_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_lead_status_change ON leads;
CREATE TRIGGER trigger_log_lead_status_change
  AFTER UPDATE OF status ON leads
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_lead_status_change();

COMMENT ON COLUMN leads.lifecycle_stage IS 'CRO Mode: Lead lifecycle stage (subscriber, lead, mql, sql, customer). All status changes are logged to lead_activities.';
