# Troubleshooting Guide: 600+ User Optimization

Quick answers to common issues during deployment and usage.

---

## 🔴 Critical Issues

### Issue 1: "Import still takes me 20+ minutes for 600 users"

**Symptom:** CSV import not faster despite new deployment

**Root Causes:**

1. **Migration NOT applied**
   ```bash
   # Check if migration is applied
   supabase db status
   # Should show: "20260422150000_optimize_600_users_end_to_end" ✓ Applied
   
   # If NOT applied, run:
   supabase db push
   ```

2. **Old import function still being used**
   ```typescript
   // ❌ OLD (slow)
   for (const user of csvData) {
     await createUser(user);  // Per-user call
   }
   
   // ✅ NEW (fast)
   import { bulkImportUsers } from '@/lib/api/optimized600Users';
   await bulkImportUsers({ users: csvData });
   ```

3. **Connection pooling disabled**
   ```bash
   # Verify pooling is enabled
   grep "enabled = true" supabase/config.toml
   # Should show: enabled = true
   
   # If false, update config.toml and restart:
   supabase start --force-rebuild
   ```

**Solution:**
```bash
# 1. Verify migration applied
supabase db status

# 2. Verify code uses bulkImportUsers (check UserManagement.tsx)
grep -r "bulkImportUsers" src/

# 3. Verify connection pooling enabled
grep "db.pooler" supabase/config.toml

# 4. Test manually
npm run build && npm run dev
# Then try import again
```

---

### Issue 2: "I still get 'only 50 users available' error"

**Symptom:** Can only authenticate as first 50 users out of 600

**Root Causes:**

1. **User limit enforced in RLS policy**
   ```sql
   -- Check if there's a LIMIT on user visibility
   SELECT * 
   FROM pg_policies 
   WHERE tablename = 'users' 
   AND polname LIKE '%LIMIT%';
   ```

2. **Pagination not properly set up**
   ```sql
   -- Verify api_get_users function works for rows > 50
   SELECT api_get_users(
     p_caller_id := 'test',
     p_caller_role := 'admin',
     p_limit := 100,      -- Request 100, not 50
     p_offset := 50
   );
   -- Should return 100 rows, not error
   ```

3. **Feature flag might be limiting users**
   ```sql
   SELECT * FROM system_feature_flags 
   WHERE key = 'user_management' OR key LIKE '%limit%';
   ```

**Solution:**
```sql
-- 1. Verify count of all users
SELECT COUNT(*) FROM public.users WHERE is_deleted = false;
-- Should show 600

-- 2. Verify RLS policy doesn't limit
SELECT * FROM pg_policies WHERE tablename = 'users';
-- Should not have "LIMIT 50" in definition

-- 3. Test pagination endpoint directly
curl "http://localhost:3000/rest/v1/users?limit=100&offset=50"
-- Should return 100 users, not error
```

---

### Issue 3: "Connection pool exhausted: 'cannot acquire connection'"

**Symptom:** After 100-150 concurrent users, new logins fail

**Root Causes:**

1. **Connection pooling disabled**
   ```bash
   grep "enabled = true" supabase/config.toml
   # If false, that's the problem!
   ```

2. **Pool size too small**
   ```bash
   grep "default_pool_size" supabase/config.toml
   # Should be 50 or higher for 600 users
   ```

3. **Subscriptions not cleaned up**
   ```typescript
   // Problem: Each page creates subscription, none cleaned up
   useEffect(() => {
     optimizedRealtimeSubscriber.subscribe(...);
     // Missing cleanup!
   }, []);
   
   // Solution: Add cleanup
   useEffect(() => {
     const key = optimizedRealtimeSubscriber.subscribe(...);
     return () => optimizedRealtimeSubscriber.unsubscribe(key);  // ✅ Cleanup
   }, []);
   ```

4. **Too many realtime subscriptions**
   ```typescript
   // Monitor subscription count
   const count = optimizedRealtimeSubscriber.getSubscriptionCount();
   console.log('Active subscriptions:', count);
   // Should stay <10. If >10, reduce pages open simultaneously
   ```

**Solution:**
```bash
# 1. Enable connection pooling
# Edit supabase/config.toml:
[db.pooler]
enabled = true
default_pool_size = 50
max_client_conn = 500

# 2. Restart
supabase start --force-rebuild

# 3. Monitor
curl http://localhost:3000/health/pool
```

---

## 🟡 Performance Issues

### Issue 4: "Search still slow (>2 seconds)"

**Symptom:** Finding a user by name takes 2+ seconds

**Root Causes:**

1. **Indexes not created**
   ```sql
   -- Check if search indexes exist
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'users' 
   AND indexname LIKE '%nama%' OR indexname LIKE '%nrp%';
   
   -- Should show:
   -- idx_users_nama_lower
   -- idx_users_nrp_lower
   ```

2. **Search not using cache**
   ```typescript
   // ❌ No cache
   const results = await supabase
     .from('users')
     .select('*')
     .ilike('nama', `%${term}%`);
   
   // ✅ With cache
   const results = await optimizedFetchUsers(userId, role, {
     search: term  // Uses cache internally
   });
   ```

3. **Large page size causing slow response**
   ```typescript
   // ❌ Requesting 1000 users at once
   const results = await supabase.from('users').select('*').range(0, 1000);
   
   // ✅ Paginated
   const results = await optimizedFetchUsers(userId, role, {
     page: 1,
     pageSize: 50  // Reasonable size
   });
   ```

**Solution:**
```sql
-- Verify indexes exist
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'users' ORDER BY indexname;

-- If missing, create manually:
CREATE INDEX idx_users_nama_lower ON public.users USING gin(nama public.gin_trgm_ops);
CREATE INDEX idx_users_nrp_lower ON public.users USING gin(nrp public.gin_trgm_ops);

-- Then test
VACUUM ANALYZE public.users;
```

```typescript
// In code: Use optimizedFetchUsers
const results = await optimizedFetchUsers(userId, role, {
  search: "ahmad",
  useCache: true  // Enable caching
});
```

---

### Issue 5: "Dashboard loads slow (3+ seconds)"

**Symptom:** User stats widget takes long time to load

**Root Causes:**

1. **Materialized view not created**
   ```sql
   -- Check if v_user_stats exists
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'v_user_stats';
   -- Should show 1 row
   ```

2. **Stats fetched without cache**
   ```typescript
   // ❌ No cache - fetches every 3 seconds
   setInterval(async () => {
     const stats = await supabase
       .from('v_user_stats')
       .select('*');
     // Heavy query every 3 seconds!
   }, 3000);
   
   // ✅ With cache - fetches every 5 minutes
   const stats = await getCachedUserStats();
   // First call: 500ms, subsequent: <5ms
   ```

3. **Multiple stats queries instead of one**
   ```typescript
   // ❌ 4 separate queries
   const total = await supabase.from('users').select('*', { count: 'exact' });
   const active = await supabase.from('users').select('*').eq('is_active', true);
   const online = await supabase.from('users').select('*').eq('is_online', true);
   const locked = await supabase.from('users').select('*').eq('is_locked', true);
   
   // ✅ 1 query
   const stats = await getCachedUserStats();
   // Returns: { total, active, online, locked, byRole, bySatuan }
   ```

**Solution:**
```bash
# 1. Create materialized view if missing
supabase db push

# 2. In code: Use cache
import { getCachedUserStats } from '@/lib/api/optimized600Users';

const stats = await getCachedUserStats();

# 3. Invalidate cache only after bulk changes
import { invalidateUserStatsCache } from '@/lib/api/optimized600Users';

await bulkImportUsers({ users });
invalidateUserStatsCache();  // Fresh stats next time
```

---

### Issue 6: "Memory leaks - page gets slower over time"

**Symptom:** UserManagement page responsive first minute, then slows down

**Root Causes:**

1. **Realtime subscriptions accumulating**
   ```typescript
   // ❌ Creates new subscription on every page refresh
   useEffect(() => {
     optimizedRealtimeSubscriber.subscribe(
       { table: 'users', event: '*' },
       () => refreshUsers()
     );
     // Missing cleanup = subscriptions accumulate!
   }, []);
   
   // ✅ Cleanup on unmount
   useEffect(() => {
     const key = optimizedRealtimeSubscriber.subscribe(...);
     return () => optimizedRealtimeSubscriber.unsubscribe(key);  // ✅
   }, []);
   ```

2. **Many pages open simultaneously**
   ```typescript
   // Check subscription count
   setInterval(() => {
     const count = optimizedRealtimeSubscriber.getSubscriptionCount();
     if (count > 10) console.warn('Too many subscriptions!', count);
   }, 5000);
   // Should stay <10
   ```

3. **Large arrays in state**
   ```typescript
   // ❌ Holds all 600 users in memory
   const [allUsers, setAllUsers] = useState([]);
   
   // ✅ Hold only current page (50)
   const [users, setUsers] = useState([]);
   const [page, setPage] = useState(1);
   ```

**Solution:**
```typescript
// 1. Verify subscriptions cleanup
export const UserPage = () => {
  useEffect(() => {
    const key = optimizedRealtimeSubscriber.subscribe(...);
    
    // Console: Check before/after unmount
    console.log('Before cleanup:', optimizedRealtimeSubscriber.getSubscriptionCount());
    
    return () => {
      optimizedRealtimeSubscriber.unsubscribe(key);
      console.log('After cleanup:', optimizedRealtimeSubscriber.getSubscriptionCount());
    };
  }, []);
};

// 2. Use Virtual Table (already done)
// src/components/ui/VirtualizedTable.tsx handles memory

// 3. Monitor with DevTools
// Chrome → F12 → Memory → Take heap snapshot → Look for leaks
```

---

## 🟠 Common Mistakes

### Mistake 1: Not using batch operations

```typescript
// ❌ SLOW: Sequential API calls
for (const userId of userIds) {
  await resetUserPin(userId, '123456');
  // 100 users = 100 API calls
}

// ✅ FAST: Single batch operation
import { batchResetUserPins } from '@/lib/api/optimized600Users';
await batchResetUserPins(userIds, '123456');
// 100 users = 1 API call
```

---

### Mistake 2: Forgetting to clean up subscriptions

```typescript
// ❌ Memory leak
export const UserPage = () => {
  useEffect(() => {
    optimizedRealtimeSubscriber.subscribe({
      table: 'users',
      event: '*'
    }, () => {});
    // No cleanup - subscription stays forever!
  }, []);
};

// ✅ Proper cleanup
export const UserPage = () => {
  useEffect(() => {
    const key = optimizedRealtimeSubscriber.subscribe({
      table: 'users',
      event: '*'
    }, () => {});
    
    return () => {
      optimizedRealtimeSubscriber.unsubscribe(key);  // ✅
    };
  }, []);
};
```

---

### Mistake 3: Not respecting page size limits

```typescript
// ❌ Requesting too many rows
const result = await optimizedFetchUsers(userId, role, {
  pageSize: 1000  // Way too large!
});

// ✅ Reasonable page size
const result = await optimizedFetchUsers(userId, role, {
  pageSize: 50  // Or use getOptimalPageSize()
});
```

---

### Mistake 4: Ignoring pool stress signals

```typescript
// ❌ Ignoring pool metrics
const health = getPoolMetrics();
// { queuedRequests: 45, activeConnections: 50 }
// → Ignoring warnings = unhappy users

// ✅ Adapt to pool stress
if (isPoolUnderStress()) {
  pageSize = 25;  // Reduce page size
  debounceMs = 500;  // Increase debounce
  console.warn('⚠️ Pool under stress, reducing load');
} else {
  pageSize = 50;
  debounceMs = 300;
}
```

---

## 📋 Diagnostic Commands

### Check System Health

```bash
# 1. Verify migration applied
supabase db status
# Look for: "✓ 20260422150000_optimize_600_users_end_to_end"

# 2. Check connection pooling
grep -A 5 "\[db.pooler\]" supabase/config.toml
# Should show: enabled = true, default_pool_size = 50

# 3. Verify indexes exist
supabase postgres client
# Inside psql:
SELECT indexname FROM pg_indexes WHERE tablename = 'users' ORDER BY indexname;
# Should show 9+ indexes (6 new + 3 existing)

# 4. Check materialized view
SELECT * FROM information_schema.views WHERE table_name = 'v_user_stats';
# Should return 1 row

# 5. Test database health
SELECT version();  # Verify PostgreSQL is responsive
SELECT COUNT(*) FROM public.users;  # Should return 600
```

### Check Frontend Health

```bash
# Open browser DevTools (F12)

# 1. Check performance metrics
localStorage.getItem('perf_metrics_optimization600');
// Should show recent API call times

# 2. Check subscription count
console.log(optimizedRealtimeSubscriber.getSubscriptionCount());
// Should be 1-10, not growing

# 3. Check cache hit rate
console.log(getPerformanceMetrics());
// Should show cache_hits > request_count / 2

# 4. Monitor network tabs
// Search results should show 1 request (not N)
// Stats should show 1 request (not 4)
```

---

## 🆘 Getting Help

### Generate Debug Report

```bash
# Create comprehensive debug output
npm run diagnose:600users

# Generates:
# - System info
# - Database status
# - Config validation
# - Performance metrics
# - Recent errors
# - Subscription count
# - Connection pool stats
```

### Contact Support

Include:
1. Output from `npm run diagnose:600users`
2. Browser console errors (F12)
3. Database logs: `supabase logs`
4. Last error timestamp
5. Reproduction steps

---

## ✅ Verification Checklist

After deployment, run through this:

- [ ] Migration applied: `supabase db status` shows ✓
- [ ] Import fast: 600 users in <10 seconds
- [ ] Can login as all 600 users
- [ ] Search response: <500ms
- [ ] Dashboard stats: <1 second
- [ ] Subscriptions: Not exceeding 10
- [ ] Pool metrics: No errors in logs
- [ ] Memory: Not growing over time
- [ ] Build successful: `npm run build` completes

---

**Last Updated:** April 22, 2026  
**Status:** Ready for Production ✅
