# Prisma Migration Plan

**Last Updated: 2025-01-31  
Purpose: Complete plan to migrate from Prisma to Supabase client

---

## Executive Summary

The AIAS Platform currently uses **Supabase** as the canonical database system, but **Prisma is still used in some scripts**. This document outlines the plan to migrate all Prisma usage to Supabase client.

**Current Status:** ⚠️ **Prisma partially used**  
**Target:** ✅ **100% Supabase client**  
**Timeline:** 2-3 weeks

---

## Current Prisma Usage

### Files Using Prisma

1. **`ops/billing/stripe.ts`**
   - Uses PrismaClient for subscription operations
   - Needs migration to Supabase client

2. **`apps/web/prisma/seed.ts`**
   - Uses PrismaClient for seeding
   - Needs migration to Supabase client

3. **`scripts/master-omega-prime/validate-schema.ts`**
   - Uses PrismaClient for schema validation
   - Can be replaced with Supabase client or removed

4. **`apps/web/prisma/schema.prisma`**
   - Prisma schema file (legacy)
   - Will be archived after migration

### Prisma Dependencies

**Package.json:**
- `@prisma/client`: ^5.7.1
- `prisma`: ^5.7.1 (dev dependency)

**Scripts:**
- `db:push`: Uses Prisma
- `db:migrate`: Uses Prisma
- `db:generate`: Uses Prisma
- `db:seed`: Uses Prisma
- `db:studio`: Uses Prisma

---

## Migration Strategy

### Phase 1: Audit & Preparation (Week 1)

**Tasks:**
- [x] Identify all Prisma usage
- [ ] Document Prisma dependencies
- [ ] Create Supabase client utilities
- [ ] Set up migration testing environment

**Deliverables:**
- Prisma usage audit complete
- Supabase client utilities created
- Migration test environment ready

### Phase 2: Migrate Scripts (Week 2)

**Tasks:**
- [ ] Migrate `ops/billing/stripe.ts`
- [ ] Migrate `apps/web/prisma/seed.ts`
- [ ] Update `scripts/master-omega-prime/validate-schema.ts`
- [ ] Test all migrated scripts

**Deliverables:**
- All scripts migrated to Supabase
- Tests passing
- Documentation updated

### Phase 3: Cleanup (Week 3)

**Tasks:**
- [ ] Remove Prisma dependencies (if unused)
- [ ] Archive Prisma schema
- [ ] Update documentation
- [ ] Remove Prisma scripts (if unused)

**Deliverables:**
- Prisma removed from codebase
- Documentation updated
- Legacy Prisma schema archived

---

## Migration Details

### 1. Migrate `ops/billing/stripe.ts`

**Current Code:**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.subscription.upsert({
  where: { id: subscriptionId },
  update: { ... },
  create: { ... },
});
```

**Migrated Code:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data, error } = await supabase
  .from('subscriptions')
  .upsert({
    id: subscriptionId,
    ...data
  }, {
    onConflict: 'id'
  });
```

**Migration Steps:**
1. Replace PrismaClient import with Supabase client
2. Convert Prisma queries to Supabase queries
3. Handle Prisma-specific features (transactions, etc.)
4. Test thoroughly

### 2. Migrate `apps/web/prisma/seed.ts`

**Current Code:**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: {},
  create: { email: 'user@example.com', ... },
});
```

**Migrated Code:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use Supabase upsert or insert with conflict handling
const { data, error } = await supabase
  .from('users')
  .upsert({
    email: 'user@example.com',
    ...userData
  }, {
    onConflict: 'email'
  });
```

**Migration Steps:**
1. Replace PrismaClient with Supabase client
2. Convert seed operations to Supabase queries
3. Handle relationships (Supabase doesn't have Prisma's nested writes)
4. Test seed script

### 3. Update Schema Validation

**Current:** Uses PrismaClient for validation  
**New:** Use Supabase client or existing `db-schema-validator.ts`

**Action:** Update `scripts/master-omega-prime/validate-schema.ts` to use Supabase client instead of PrismaClient

---

## Supabase Client Utilities

### Helper Functions for Common Operations

Create `lib/supabase/db-helpers.ts`:

```typescript
/**
 * Supabase Database Helpers
 * Provides Prisma-like convenience functions for Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);

/**
 * Upsert helper (similar to Prisma's upsert)
 */
export async function upsert<T>(
  table: string,
  data: T,
  onConflict?: string
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from(table)
    .upsert(values, { onConflict });
  
  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
  
  return data;
}

/**
 * Find unique helper
 */
export async function findUnique<T>(
  table: string,
  where: Record<string, any>
): Promise<T | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from(table)
    .select('*')
    .eq(key, where[key])
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Transaction helper (Supabase doesn't support transactions, use RPC functions)
 */
export async function transaction<T>(
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  // Supabase doesn't have transactions, but we can use RPC functions
  // For complex operations, create a database function
  const client = getSupabaseClient();
  return callback(client);
}
```

**Note:** Supabase doesn't support transactions like Prisma. For complex operations requiring transactions, create PostgreSQL functions.

---

## Migration Checklist

### Pre-Migration
- [x] Audit Prisma usage
- [ ] Create Supabase helper utilities
- [ ] Set up test environment
- [ ] Document migration plan

### Migration
- [ ] Migrate `ops/billing/stripe.ts`
- [ ] Migrate `apps/web/prisma/seed.ts`
- [ ] Update `scripts/master-omega-prime/validate-schema.ts`
- [ ] Test all migrated code
- [ ] Update tests

### Post-Migration
- [ ] Remove Prisma dependencies
- [ ] Archive Prisma schema
- [ ] Update documentation
- [ ] Remove Prisma scripts
- [ ] Verify no Prisma imports remain

---

## Common Migration Patterns

### Pattern 1: Upsert

**Prisma:**
```typescript
await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'Updated' },
  create: { email: 'user@example.com', name: 'New' },
});
```

**Supabase:**
```typescript
const { data, error } = await supabase
  .from('users')
  .upsert({
    email: 'user@example.com',
    name: 'Updated'
  }, {
    onConflict: 'email'
  });
```

### Pattern 2: Find Unique

**Prisma:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

**Supabase:**
```typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### Pattern 3: Relations

**Prisma:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { subscriptions: true }
});
```

**Supabase:**
```typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*, subscriptions(*)')
  .eq('id', userId)
  .single();
```

### Pattern 4: Transactions

**Prisma:**
```typescript
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.subscription.create({ data: subData }),
]);
```

**Supabase:**
```typescript
// Option 1: Use RPC function
const { data, error } = await supabase.rpc('create_user_with_subscription', {
  user_data: userData,
  subscription_data: subData
});

// Option 2: Sequential operations (if not critical)
const { data: user } = await supabase.from('users').insert(userData);
const { data: sub } = await supabase.from('subscriptions').insert({
  ...subData,
  user_id: user.id
});
```

---

## Risks & Considerations

### Risks

1. **Data Loss:** Ensure backups before migration
2. **Breaking Changes:** Test thoroughly
3. **Performance:** Supabase queries may differ in performance
4. **Transactions:** Supabase doesn't support transactions (use RPC functions)

### Considerations

1. **Relationships:** Supabase handles relationships differently
2. **Type Safety:** Supabase types are auto-generated
3. **Error Handling:** Supabase error format differs from Prisma
4. **Testing:** Update all tests using Prisma

---

## Timeline

### Week 1: Preparation
- Day 1-2: Audit and document Prisma usage
- Day 3-4: Create Supabase helper utilities
- Day 5: Set up test environment

### Week 2: Migration
- Day 1-2: Migrate `ops/billing/stripe.ts`
- Day 3: Migrate `apps/web/prisma/seed.ts`
- Day 4: Update validation scripts
- Day 5: Test all migrations

### Week 3: Cleanup
- Day 1: Remove Prisma dependencies
- Day 2: Archive Prisma schema
- Day 3: Update documentation
- Day 4: Final testing
- Day 5: Deploy

---

## Conclusion

**Status:** ⚠️ **Migration in progress**  
**Next Steps:** Create Supabase helper utilities, then migrate scripts one by one

**Key Points:**
- Supabase is canonical database system
- Prisma is legacy and being phased out
- Migration requires careful testing
- No breaking changes expected

---

**Last Updated:** 2025-01-31  
**Next Review:** After migration completion
