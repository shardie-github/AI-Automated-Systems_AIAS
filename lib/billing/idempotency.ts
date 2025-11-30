/**
 * CFO Mode: Idempotency Key Management
 * 
 * Ensures all financial transactions use idempotency keys to prevent
 * double-charging or double-recording.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import crypto from 'crypto';

/**
 * Generate a unique idempotency key for a transaction
 */
export function generateIdempotencyKey(
  resourceType: string,
  resourceId: string,
  requestParams: Record<string, unknown>
): string {
  // Create deterministic key from resource type, ID, and request params
  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(requestParams))
    .digest('hex')
    .substring(0, 16);
  
  return `${resourceType}_${resourceId}_${requestHash}_${Date.now()}`;
}

/**
 * Check if idempotency key already exists and return cached response
 */
export async function checkIdempotencyKey(
  idempotencyKey: string
): Promise<{ exists: boolean; response?: unknown }> {
  const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey
  );

  const { data, error } = await supabase
    .from('idempotency_keys')
    .select('status, response_data')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (error || !data) {
    return { exists: false };
  }

  // Check if expired
  const { data: expiredCheck } = await supabase
    .from('idempotency_keys')
    .select('expires_at')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (expiredCheck?.expires_at && new Date(expiredCheck.expires_at) < new Date()) {
    return { exists: false };
  }

  if (data.status === 'completed' && data.response_data) {
    return {
      exists: true,
      response: data.response_data,
    };
  }

  return { exists: false };
}

/**
 * Record idempotency key with response
 */
export async function recordIdempotencyKey(
  idempotencyKey: string,
  resourceType: string,
  resourceId: string,
  requestHash: string,
  responseData: unknown,
  status: 'completed' | 'failed' = 'completed'
): Promise<void> {
  const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey
  );

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

  const { error } = await supabase
    .from('idempotency_keys')
    .upsert({
      idempotency_key: idempotencyKey,
      resource_type: resourceType,
      resource_id: resourceId,
      request_hash: requestHash,
      response_data: responseData as Record<string, unknown>,
      status,
      expires_at: expiresAt.toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    }, {
      onConflict: 'idempotency_key',
    });

  if (error) {
    console.error('Failed to record idempotency key:', error);
    // Don't throw - idempotency is best-effort, shouldn't break transactions
  }
}

/**
 * Record financial ledger entry with idempotency
 * CFO Mode: All financial movements go through ledger
 */
export async function recordLedgerEntry(params: {
  transactionId: string;
  idempotencyKey: string;
  accountId: string;
  accountType: 'tenant' | 'user' | 'system';
  amountCents: number; // CFO Principle: Integer math (cents)
  currency?: string;
  transactionType: 'payment' | 'refund' | 'subscription' | 'subscription_cancel' | 'invoice' | 'credit' | 'debit' | 'adjustment' | 'fee' | 'chargeback';
  sourceType: string;
  sourceId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; ledgerId?: string; error?: string }> {
  const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey
  );

  try {
    // Check idempotency first
    const idempotencyCheck = await checkIdempotencyKey(params.idempotencyKey);
    if (idempotencyCheck.exists) {
      // Return existing ledger entry ID if found
      const { data: existing } = await supabase
        .from('financial_ledger')
        .select('id')
        .eq('idempotency_key', params.idempotencyKey)
        .eq('status', 'completed')
        .single();

      if (existing) {
        return { success: true, ledgerId: existing.id };
      }
    }

    // Use database function to record entry (handles idempotency internally)
    const { data, error } = await supabase.rpc('record_ledger_entry', {
      p_transaction_id: params.transactionId,
      p_idempotency_key: params.idempotencyKey,
      p_account_id: params.accountId,
      p_account_type: params.accountType,
      p_amount_cents: params.amountCents,
      p_currency: params.currency || 'USD',
      p_transaction_type: params.transactionType,
      p_source_type: params.sourceType,
      p_source_id: params.sourceId,
      p_description: params.description || null,
      p_metadata: params.metadata || {},
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Record idempotency key
    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex');

    await recordIdempotencyKey(
      params.idempotencyKey,
      params.transactionType,
      params.transactionId,
      requestHash,
      { ledgerId: data },
      'completed'
    );

    return { success: true, ledgerId: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
