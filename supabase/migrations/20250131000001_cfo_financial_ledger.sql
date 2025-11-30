-- CFO Mode: Financial Ledger & Idempotency
-- Creates immutable ledger table and idempotency tracking

-- ============================================================================
-- IDEMPOTENCY KEYS TABLE
-- ============================================================================
-- Tracks all idempotency keys to prevent duplicate transactions
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  resource_type TEXT NOT NULL, -- 'payment', 'subscription', 'refund', etc.
  resource_id TEXT, -- Stripe payment_intent_id, subscription_id, etc.
  request_hash TEXT, -- Hash of request params for verification
  response_data JSONB, -- Cached response for duplicate requests
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_resource ON idempotency_keys(resource_type, resource_id);

-- Cleanup expired keys (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM idempotency_keys
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- ============================================================================
-- FINANCIAL LEDGER TABLE (Credit/Debit Model)
-- ============================================================================
-- Immutable ledger for all financial movements
-- CFO Principle: Never delete, only offset with corrective transactions
CREATE TABLE IF NOT EXISTS financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL, -- Stripe payment_intent_id, invoice_id, etc.
  idempotency_key TEXT REFERENCES idempotency_keys(idempotency_key),
  
  -- Transaction Details
  account_id UUID, -- tenant_id or user_id
  account_type TEXT NOT NULL CHECK (account_type IN ('tenant', 'user', 'system')),
  
  -- Amount (stored as INTEGER in cents - CFO Principle: No floating point)
  amount_cents BIGINT NOT NULL, -- Positive for credits, negative for debits
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'payment', 'refund', 'subscription', 'subscription_cancel',
    'invoice', 'credit', 'debit', 'adjustment', 'fee', 'chargeback'
  )),
  
  -- Reference to source
  source_type TEXT, -- 'stripe', 'manual', 'system', 'webhook'
  source_id TEXT, -- Stripe event ID, admin user ID, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Reversal tracking (for corrections)
  reversed_by UUID REFERENCES financial_ledger(id),
  reversal_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_account ON financial_ledger(account_id, account_type);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_transaction_id ON financial_ledger(transaction_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_type ON financial_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_date ON financial_ledger(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_status ON financial_ledger(status);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_idempotency ON financial_ledger(idempotency_key);

-- Function to calculate account balance from ledger
CREATE OR REPLACE FUNCTION get_account_balance(
  p_account_id UUID,
  p_account_type TEXT
)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount_cents), 0)
  FROM financial_ledger
  WHERE account_id = p_account_id
    AND account_type = p_account_type
    AND status = 'completed';
$$;

-- Function to record ledger entry (with idempotency check)
CREATE OR REPLACE FUNCTION record_ledger_entry(
  p_transaction_id TEXT,
  p_idempotency_key TEXT,
  p_account_id UUID,
  p_account_type TEXT,
  p_amount_cents BIGINT,
  p_currency TEXT DEFAULT 'USD',
  p_transaction_type TEXT,
  p_source_type TEXT,
  p_source_id TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger_id UUID;
  v_existing_id UUID;
BEGIN
  -- Check idempotency: if key exists and completed, return existing ledger entry
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM financial_ledger
    WHERE idempotency_key = p_idempotency_key
      AND status = 'completed'
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
      RETURN v_existing_id;
    END IF;
  END IF;
  
  -- Check transaction_id uniqueness
  SELECT id INTO v_existing_id
  FROM financial_ledger
  WHERE transaction_id = p_transaction_id
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Transaction ID already exists: %', p_transaction_id;
  END IF;
  
  -- Insert new ledger entry
  INSERT INTO financial_ledger (
    transaction_id,
    idempotency_key,
    account_id,
    account_type,
    amount_cents,
    currency,
    transaction_type,
    source_type,
    source_id,
    description,
    metadata,
    status
  ) VALUES (
    p_transaction_id,
    p_idempotency_key,
    p_account_id,
    p_account_type,
    p_amount_cents,
    p_currency,
    p_transaction_type,
    p_source_type,
    p_source_id,
    p_description,
    p_metadata,
    'completed'
  )
  RETURNING id INTO v_ledger_id;
  
  RETURN v_ledger_id;
END;
$$;

-- Enable RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for idempotency_keys (service role only)
CREATE POLICY "Service role can manage idempotency keys"
  ON idempotency_keys
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for financial_ledger
-- Users can view their own account ledger entries
CREATE POLICY "Users can view their account ledger"
  ON financial_ledger
  FOR SELECT
  USING (
    (account_type = 'user' AND account_id = auth.uid())
    OR
    (account_type = 'tenant' AND account_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    ))
  );

-- Service role can manage all ledger entries
CREATE POLICY "Service role can manage ledger"
  ON financial_ledger
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE financial_ledger IS 'Immutable financial ledger following credit/debit model. CFO Principle: Never delete, only offset with corrective transactions.';
COMMENT ON TABLE idempotency_keys IS 'Tracks idempotency keys to prevent duplicate financial transactions.';
COMMENT ON COLUMN financial_ledger.amount_cents IS 'Amount in cents (integer). CFO Principle: No floating point math for money.';
COMMENT ON COLUMN financial_ledger.reversed_by IS 'Reference to corrective transaction if this entry was reversed.';
