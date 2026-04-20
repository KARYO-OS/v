# 🚀 UPGRADE PLAN: KARYO OS v1.5.0 → v2.0.0

**Status**: Draft for Review  
**Target Release**: Q4 2026  
**Created**: April 20, 2026  
**Current Version**: 1.5.0

---

## Executive Summary

Karyo OS v2.0 adalah upgrade strategis yang mentransformasi aplikasi dari **web-only single-instance** menjadi **platform hybrid enterprise-grade** dengan dukungan offline, multi-satuan, dan analytics lanjutan untuk mendukung 20k+ pengguna.

### Visi v2.0
> "Accessible anywhere, anytime, for every unit."

### Key Objectives
1. ✅ **PWA & Offline Mode**: Full offline capability dengan background sync
2. ✅ **Multi-Satuan**: Satu sistem untuk multiple military units  
3. ✅ **Enterprise Analytics**: Dashboard analytics real-time dengan custom reports
4. ✅ **Scale to 20k+ Users**: Database & frontend optimized untuk massive scale
5. ✅ **Data Exchange**: Export/import CSV, Excel, API integrations

---

## Timeline Overview

### Development Phases (16-20 weeks, May-September 2026)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: PWA & OFFLINE (May)         [Weeks 1-4]               │
│ ├─ Service Worker enhancement       [Week 1-2]                 │
│ ├─ IndexedDB offline storage        [Week 1-2]                 │
│ ├─ Background sync & conflict resolution [Week 3-4]            │
│ └─ Status: Alpha ready               [End May]                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: MULTI-SATUAN (June)         [Weeks 5-8]               │
│ ├─ Database schema evolution         [Week 5-6]                │
│ ├─ RLS policy updates (multi-tenant) [Week 5-6]                │
│ ├─ Frontend multi-satuan UI          [Week 7-8]                │
│ └─ Status: Beta ready                [End June]                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: ANALYTICS (July)            [Weeks 9-12]              │
│ ├─ Analytics backend (RPC functions) [Week 9-10]               │
│ ├─ Materialized views + cron refresh [Week 9-10]               │
│ ├─ Analytics UI & charts             [Week 11-12]              │
│ └─ Status: Feature complete          [End July]                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: OPTIMIZATION & SCALE (August) [Weeks 13-16]           │
│ ├─ Database optimization & indexes   [Week 13-14]              │
│ ├─ Frontend performance tuning       [Week 15-16]              │
│ ├─ Load testing (1000 concurrent)    [Week 13-14]              │
│ └─ Status: Optimization complete     [End August]              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: QA & RELEASE (September)    [Weeks 17-20]             │
│ ├─ Comprehensive testing (UAT)       [Week 17-18]              │
│ ├─ Documentation & training          [Week 19]                 │
│ ├─ Staging deployment & final checks [Week 19-20]              │
│ └─ Status: PRODUCTION RELEASE        [End September]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### PHASE 1: PWA & OFFLINE (May 2026) — 4 weeks

**Goal**: Aplikasi dapat bekerja 100% offline dengan auto-sync online

#### Key Features
- **Offline Data Storage**: IndexedDB dengan 50MB capacity
- **Background Sync**: Queue write operations + retry logic
- **Conflict Resolution**: Automatic sync handling
- **Offline UI**: Show sync status & queue size

#### Technical Tasks
```
Service Worker:
 □ Precache critical routes + assets
 □ Implement stale-while-revalidate strategy
 □ Handle background sync coordination
 
IndexedDB:
 □ Mirror Supabase schema (users, gate_passes, tasks, etc)
 □ Implement data sync logic
 □ Add IndexedDB query helpers

State Management:
 □ Add offline mode flag to Zustand
 □ Create useOfflineSync() hook
 □ Update all data hooks for offline compatibility

UI:
 □ Sync status indicator (online/offline/syncing)
 □ Queue size badge
 □ Manual retry button
```

#### New Dependencies
```json
{
  "idb": "^8.0.0"  // IndexedDB wrapper
}
```

#### Success Criteria
- [ ] App works completely without internet
- [ ] Auto-sync when connection restored
- [ ] Queue handles 1000+ pending items
- [ ] 0 data loss or corruption
- [ ] Lighthouse PWA score ≥ 95

---

### PHASE 2: MULTI-SATUAN (June 2026) — 4 weeks

**Goal**: Satu sistem dapat melayani multiple military units dengan data isolation

#### Key Features
- **Tenant Data Isolation**: RLS policies prevent cross-satuan access
- **Bulk User Import**: CSV upload per satuan
- **Satuan Management UI**: Create, edit, configure units
- **Backward Compatibility**: Existing single-unit deployments work unchanged

#### Database Changes
```sql
-- Add satuan_id to all tables
ALTER TABLE users ADD COLUMN satuan_id UUID REFERENCES satuans(id);
ALTER TABLE gate_passes ADD COLUMN satuan_id UUID REFERENCES satuans(id);
ALTER TABLE tasks ADD COLUMN satuan_id UUID REFERENCES satuans(id);
-- ... repeat for leave_requests, announcements, messages, etc

-- Create satuans master table
CREATE TABLE satuans (
  id UUID PRIMARY KEY,
  nama VARCHAR UNIQUE,
  kode_satuan VARCHAR UNIQUE,
  tingkat VARCHAR, -- battalion, company, squad
  logo_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_users_satuan_id ON users(satuan_id);
CREATE INDEX idx_gate_passes_satuan_id ON gate_passes(satuan_id);
-- ... etc

-- Update RLS to isolate data per satuan
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_satuan_isolation ON users USING (
  auth.uid() = id -- own user
  OR satuan_id = (SELECT satuan_id FROM users WHERE id = auth.uid()) -- same satuan
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin' -- admin bypass
);
```

#### Frontend Changes
```
New Pages:
 □ AdminSatuanManagement.tsx (super admin dashboard)
 □ SatuanSettings.tsx (satuan admin settings)

Updated Pages:
 □ UserManagement: add satuan filter
 □ GatePassMonitor: show satuan breakdown
 □ Reports: add satuan comparison
 
New Components:
 □ SatuanSelector (dropdown/switcher)
 □ BulkUserImportModal (CSV upload)
```

#### Success Criteria
- [ ] 0 data leaks between satuans (security audit)
- [ ] RLS policies verified + tested
- [ ] Bulk import handles 1000+ users/satuan
- [ ] Multi-satuan switching works seamlessly
- [ ] Backward compatible (single-unit mode still works)

---

### PHASE 3: ANALYTICS (July 2026) — 4 weeks

**Goal**: Enterprise-grade analytics dashboard dengan real-time insights

#### Key Features
- **Analytics Dashboard**: Attendance trends, task completion, personnel utilization
- **Custom Reports**: Drag-drop columns, date ranges, export
- **Data Export**: PDF, CSV, Excel formats
- **Performance Charts**: Line, bar, pie, heatmap visualizations

#### Backend (New RPC Functions)
```sql
-- Attendance analytics
api_get_attendance_stats(p_satuan_id, p_date_from, p_date_to)
  → (date, present_count, absent_count, late_count, on_time_percent)

-- Task analytics
api_get_task_stats(p_satuan_id, p_date_from, p_date_to)
  → (status, count, completion_rate, avg_days_to_complete)

-- Gate pass analytics
api_get_gatepass_stats(p_satuan_id, p_date_from, p_date_to)
  → (date, approved_count, checked_in, overdue, completed)

-- Personnel utilization
api_get_personnel_utilization(p_satuan_id, p_date_from, p_date_to)
  → (person_id, name, tasks_completed, leaves_taken, gate_passes_month)
```

#### Materialized Views
```sql
-- Refresh every hour
CREATE MATERIALIZED VIEW mv_attendance_daily AS
  SELECT satuan_id, DATE(created_at), 
         COUNT(*) present, 
         COUNT(*) FILTER (WHERE status='present') on_time,
         COUNT(*) FILTER (WHERE status='late') late
    FROM attendances GROUP BY 1, 2;

CREATE MATERIALIZED VIEW mv_task_completed_daily AS
  SELECT satuan_id, DATE(completed_at),
         COUNT(*) completed,
         COUNT(*) FILTER (WHERE approved_by IS NOT NULL) approved
    FROM tasks WHERE status='done' GROUP BY 1, 2;
```

#### Frontend Components
```
New Page: AnalyticsDashboard.tsx
 ├─ Header: DateRange selector + Satuan filter + Export buttons
 ├─ KPI Cards: 4 main metrics (Attendance %, Task %, Active GatePass, Util %)
 ├─ Charts:
 │  ├─ Line: Attendance trends (7-day rolling)
 │  ├─ Bar: Task completion by person (top 10)
 │  ├─ Pie: Gate pass status breakdown
 │  └─ Heatmap: Shift utilization
 └─ ReportBuilder: Custom report + export UI

New Hook: useAnalytics()
 ├─ useDateRange(defaultDays=7)
 ├─ useAnalyticsData(type, dateRange, satuan)
 └─ Caching with 5min TTL
```

#### New Dependencies
```json
{
  "recharts": "^2.10.0",  // Charts library
  "xlsx": "^0.18.5"       // Excel/CSV export
}
```

#### Success Criteria
- [ ] Analytics dashboard loads < 2 seconds with 90-day data
- [ ] Charts render with 20k+ data points
- [ ] Export (PDF, CSV, Excel) works without error
- [ ] Caching strategy prevents API overload

---

### PHASE 4: OPTIMIZATION & SCALE (August 2026) — 4 weeks

**Goal**: Database & frontend optimized untuk 20k+ concurrent users

#### Database Optimization
```
□ Query analysis: EXPLAIN ANALYZE all slow queries
□ Missing indexes: Add on high-cardinality columns (satuan_id, dates)
□ Vertical partitioning: Separate recent data (3mo) from archive
□ Connection pooling: PgBouncer with 20-30 connections
□ Caching layer: Redis (optional) for materialized view refresh

Performance Targets:
  - API response p95: < 500ms
  - Database query avg: < 100ms
  - Load test: 1000 concurrent → p95 < 2s response
```

#### Frontend Optimization
```
□ Bundle analysis: Identify large dependencies
□ Code splitting: Lazy load analytics, admin pages
□ Tree-shaking: Remove unused code
□ Asset optimization: Image compression, SVG minification
□ Cache busting: Version-based asset caching

Size Targets:
  - Main bundle: < 200KB (currently 220KB)
  - Vendor: < 80KB (currently 77KB)
  - Total: < 400KB (currently 392KB)
```

#### Monitoring Setup
```
□ Error tracking: Sentry integration
□ Performance monitoring: Core Web Vitals tracking
□ Infrastructure monitoring: Database queries, API latency
□ Alerting: Email/Slack for errors > threshold
```

#### Load Testing
```bash
# k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 100 },    // ramp up to 100
    { duration: '10m', target: 500 },   // ramp to 500
    { duration: '10m', target: 1000 },  // peak 1000
    { duration: '5m', target: 0 },      // ramp down
  ],
};

export default function() {
  let res = http.get('https://karyo-os/api/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

#### Success Criteria
- [ ] Build time remains ≤ 5.5s
- [ ] Bundle size ≤ 400KB
- [ ] Lighthouse PWA score ≥ 95
- [ ] Load test p95 response < 2 seconds
- [ ] Database handles 20k+ users without degradation

---

### PHASE 5: QA & RELEASE (September 2026) — 4 weeks

**Goal**: Production-ready release dengan comprehensive testing

#### Testing Strategy
```
Unit Tests (target 80% coverage):
 □ All new hooks (useOfflineSync, useAnalytics, etc)
 □ State management updates
 □ Utility functions

Integration Tests:
 □ Offline sync workflow (create → sync → verify)
 □ Multi-satuan data isolation
 □ Permission boundaries (RLS policies)

E2E Tests (Playwright):
 □ Offline mode: disconnect → work offline → reconnect → verify
 □ PWA installation: install → launch → use offline
 □ Multi-satuan: switch units → verify data isolation
 □ Analytics: load dashboard → apply filters → export

Performance Tests:
 □ Load test: 1000 concurrent users
 □ Stress test: burst traffic (2000 users for 1 min)
 □ Endurance test: 8-hour continuous usage

Security Tests:
 □ OWASP Top 10 assessment
 □ RLS policy penetration test
 □ JWT token validation
```

#### UAT (User Acceptance Testing)
```
Participants: 5-10 real personnel from different units
Duration: 2 weeks
Focus Areas:
  - Offline mode usability
  - Analytics dashboard clarity
  - Multi-satuan switching
  - Export functionality
```

#### Documentation Updates
```
□ README.md: Add PWA offline instructions + installation guide
□ SPESIFIKASI.md: Update to v2.0 specifications + architecture
□ API docs: Document new analytics endpoints
□ Admin guide: Multi-satuan setup, backup/restore
□ User guide: Offline mode walkthrough (video + written)
□ Migration guide: v1.5 → v2.0 upgrade steps
```

#### Deployment Strategy (Blue-Green)
```
Step 1: Staging Deployment
  - Deploy v2.0 to staging environment
  - Run full test suite + smoke tests
  - UAT on staging (2 weeks)

Step 2: Production Canary
  - Deploy v2.0 to production (new instance)
  - Route 10% traffic to v2.0
  - Monitor for 24 hours (errors, latency, crashes)
  - If stable, proceed to full rollout

Step 3: Production Rollout
  - Route 100% traffic to v2.0
  - Keep v1.5 running as instant fallback
  - Monitoring 24/7 for 1 week

Step 4: v1.5 Sunset
  - After 1 week stable operation, decommission v1.5
  - Archive v1.5 code + database snapshot
```

#### Success Criteria
- [ ] All test suites pass (unit, integration, e2e)
- [ ] OWASP security assessment: pass
- [ ] UAT feedback score ≥ 4/5
- [ ] 0 critical issues in staging
- [ ] Deployment executed without rollback

---

## Dependencies & New Packages

### NPM Package Additions
```json
{
  "idb": "^8.0.0",              // IndexedDB wrapper
  "recharts": "^2.10.0",        // Charts library (100KB gzipped)
  "xlsx": "^0.18.5",            // Excel export (400KB uncompressed, tree-shaken)
  "@sentry/react": "^8.0.0",    // Error tracking (optional for Phase 4)
  "vite-plugin-visualizer": "^1.0.0"  // Dev tool for bundle analysis
}
```

### Infrastructure Changes
```
Current Supabase Tier:
  - Plan: Pro ($25/month)
  - Functions: 100k calls/day
  - Storage: 100GB
  - Bandwidth: Unlimited

Target Supabase Tier (v2.0):
  - Plan: Pro or Team ($100-200/month)
  - Functions: 500k calls/day
  - Storage: 500GB
  - Reason: Analytics queries + multi-satuan data growth
  
Optional: Add Redis Cache (v2.1)
  - Service: Upstash Redis
  - Cost: $10-20/month
  - Use: Cache materialized views (analytics)
```

### Development Tools
```bash
# Install and use during development
npm install -D vite-plugin-visualizer  # Bundle analysis
npm install -D k6                       # Load testing
npm install -D @lighthouse/cli          # Performance CI
```

---

## Migration Path: v1.5 → v2.0

### Pre-Migration (Week 19)
```
1. Backup current production database
2. Create database snapshot (export to JSON)
3. Prepare staging environment with v2.0 schema
4. Create migration script for satuan_id backfill
5. Test migration on copy of production data
```

### Migration Steps (Week 20)
```
Step 1: Schema Evolution (30 min downtime)
  - Add satuan_id columns to all tables
  - Create foreign keys + indexes
  - Create satuans table
  - Update RLS policies
  - Refresh materialized views

Step 2: Data Backfill (automated, <5 min)
  - INSERT default satuan "Primary Unit"
  - UPDATE all existing rows: satuan_id = default_satuan_id
  - Verify row counts match pre-migration

Step 3: Verification (no downtime)
  - Check data integrity (foreign keys, row counts)
  - Test RLS policies (select as different roles)
  - Verify V1.5 queries still work (backward compatibility)

Step 4: Deploy v2.0 (blue-green)
  - Deploy v2.0 frontend + backend
  - Route 10% traffic → monitor 24h
  - Route 100% traffic if stable
```

### Rollback Plan
```
If critical issues discovered within 1 hour of deployment:
  1. Stop traffic to v2.0
  2. Restore v1.5 from pre-migration snapshot
  3. Investigate issue in staging
  4. Re-test before retry
  
If issues discovered after 1+ hours:
  1. Patch in v2.0 directly (don't rollback)
  2. Deploy hotfix + re-test
```

---

## Resource Requirements

### Team Composition
- **Frontend Developer**: 1 FTE (PWA UI, state management, charts)
- **Backend Developer**: 1 FTE (RPC/migrations, analytics, optimization)
- **DevOps/QA Engineer**: 0.5 FTE (testing, deployment, monitoring)
- **Product Manager**: 0.25 FTE (UAT coordination, feedback)

### Optional Acceleration
```
With 2 frontend devs:
  - Timeline can reduce by 4-6 weeks
  - Parallel: Phase 1 PWA + Phase 2 UI can overlap
  
With dedicated backend team:
  - Database optimization can be done in parallel
  - Reduce Phase 4 from 4 weeks to 2 weeks
```

### Equipment/Infrastructure
```
Development:
  - Local development machine with 16GB RAM (IndexedDB needs RAM)
  - Recent browser (Chrome, Firefox, Safari) for PWA testing
  
Testing:
  - Multiple devices for PWA installation testing
  - Load testing infrastructure (k6 cloud or local setup)
  
Staging:
  - Supabase staging project (mirror of production)
  - GitHub Pages staging domain
```

---

## Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **IndexedDB quota (50MB) exceeded** | Users can't add more data offline | Medium | Smart cache eviction + user education on cleanup |
| **Sync conflicts cause data issues** | Data corruption/loss | High | Extensive testing of LWW strategy |
| **RLS policy bugs in multi-satuan** | Data leak between units | High | Security audit + peer review + penetration test |
| **Analytics queries timeout under load** | Dashboard unusable | Medium | Pre-compute materialized views + aggressive caching |
| **Service Worker breaks UI updates** | Users stuck on old version | Low | Version check + force reload prompts |
| **Database connection pool exhausted** | Response timeouts | Medium | Monitor pool usage + upgrade Supabase if needed |
| **PWA fails in production** | Installation doesn't work for users | Low | Extensive testing on real devices early |
| **Breaking changes from npm upgrades** | Build failures before launch | Medium | Pin versions, test in isolated branch first |
| **Timeline slips (common in dev)** | Delayed release | High | Weekly sprint reviews + risk tracking |

---

## Success Metrics

### Functional
- [ ] Offline mode: 100% feature parity with online mode
- [ ] Multi-satuan: 0 cross-satuan data leaks in penetration test
- [ ] Analytics: Dashboard loads < 2s with 90-day data
- [ ] Export: CSV/Excel files generate without errors
- [ ] PWA: Installable on iOS, Android, Windows, macOS

### Performance
- [ ] Build time: ≤ 5.5s (5% increase allowed for PWA features)
- [ ] Bundle size: ≤ 410KB (5% increase allowed)
- [ ] First contentful paint: ≤ 1.5s (offline cached)
- [ ] Lighthouse PWA score: ≥ 95
- [ ] Load test: 1000 concurrent users → p95 < 2s

### Scale
- [ ] 20k+ users supported with < 50ms latency
- [ ] Database: avg query < 100ms, p95 < 500ms
- [ ] IndexedDB: sync queue handles 1000+ items

### Quality
- [ ] Test coverage: ≥ 80% (up from baseline)
- [ ] Security: 0 critical OWASP issues
- [ ] E2E tests: 100% pass rate (including new PWA + offline tests)

---

## Approval & Sign-Off

| Role | Required? | Name | Date | Status |
|------|-----------|------|------|--------|
| Product Owner | Yes | [TBD] | | ⏳ Pending |
| Tech Lead | Yes | [TBD] | | ⏳ Pending |
| Security Lead | Yes | [TBD] | | ⏳ Pending |
| Executive Sponsor | Yes | [TBD] | | ⏳ Pending |

---

## Appendix: Quick Reference

### Key Dates
- Planning phase complete: ✅ April 20, 2026
- Development start: May 1, 2026
- Phase 1 (PWA): May 1 - May 31
- Phase 2 (Multi-satuan): June 1 - June 30
- Phase 3 (Analytics): July 1 - July 31
- Phase 4 (Optimization): August 1 - August 31
- Phase 5 (QA/Release): September 1 - September 30
- **Production release target**: September 30, 2026

### Key Contacts
- Product Owner: [TBD]
- Tech Lead: [TBD]
- Security Officer: [TBD]
- Supabase Support: [TBD]

### Key Resources
- Repository: https://github.com/yuniamagsila/v
- Supabase: https://app.supabase.com
- GitHub Pages: https://yuniamagsila.github.io/v
- Current specifications: SPESIFIKASI.md
- Contributing guide: CONTRIBUTING.md

---

**Document Version**: 1.0  
**Created**: April 20, 2026  
**Last Updated**: [TBD]  
**Next Review**: May 15, 2026 (after team kickoff)

---

*This is a living document. Updates will be made as the project progresses.*  
*For questions or feedback, contact the Product Team or Tech Lead.*
