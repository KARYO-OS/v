# 🚀 GitHub Pages + Supabase Deployment Setup

## Status Saat Ini ✓

| Komponen | Status | Detail |
|----------|--------|--------|
| **Supabase CLI** | ✓ Linked | Project: `combat` (upvrcaivdzuxozdwzvdq) |
| **.env.local** | ✓ Ada | Frontend configured untuk Supabase |
| **Frontend Build** | ✓ Berhasil | `npm run build` successful |
| **GitHub Remote** | ✓ Ada | https://github.com/yuniamagsila/v |
| **Workflow YAML** | ✓ Ada | `.github/workflows/deploy-production.yml` |
| **Migration** | ✓ Synced | 31 migrations deployed ke remote |

---

## 🔧 1. Setup GitHub Secrets untuk Deployment

GitHub Actions memerlukan env vars untuk build production. Ikuti langkah berikut:

### A. Buka GitHub Repository Settings

```
1. Buka: https://github.com/yuniamagsila/v
2. Klik tab: "Settings"
3. Menu kiri: "Secrets and variables" → "Actions"
```

### B. Tambahkan 2 Secrets

**Secret 1: VITE_SUPABASE_URL**
```
Name:  VITE_SUPABASE_URL
Value: https://upvrcaivdzuxozdwzvdq.supabase.co
```

**Secret 2: VITE_SUPABASE_ANON_KEY**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: <ANON_PUBLIC_KEY_DARI_PROJECT_UPVRCAIVDZUXOZDWZVDQ>
```

> ⚠️ **JANGAN** gunakan `service_role` key. Hanya gunakan `anon public` key.
> Secrets ini hanya visible di GitHub Actions, tidak di-expose ke public.

---

## 🧪 2. Test Deployment Workflow

### Opsi A: Trigger via GitHub Web Console

```
1. https://github.com/yuniamagsila/v
2. Tab "Actions"
3. Workflow: "GitHub Pages Deploy"
4. Klik "Run workflow"
5. Branch: main
6. Klik "Run workflow"
```

### Opsi B: Trigger via `git push`

```bash
git add .
git commit -m "fix: setup GitHub Pages deployment"
git push origin main
```

Workflow akan otomatis trigger dan:
- ✓ Build production bundle
- ✓ Deploy ke GitHub Pages
- ✓ Available di: https://yuniamagsila.github.io/v/

---

## 📋 3. Verifikasi Deployment

### Check 1: GitHub Actions Log
```
GitHub → yuniamagsila/v → Actions → Latest run
```

### Check 2: Live URL
```
https://yuniamagsila.github.io/v/
```

### Check 3: Supabase API Connectivity
```bash
# Test dari deployed app
curl -X POST https://upvrcaivdzuxozdwzvdq.supabase.co/rest/v1/rpc/api_get_users \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "p_ascending": true,
    "p_is_active": null,
    "p_order_by": "nama",
    "p_role": "admin",
    "p_role_filter": null,
    "p_satuan_filter": null,
    "p_user_id": "00000000-0000-0000-0000-000000000000"
  }'
```

---

## 🔄 4. Deployment Flow (via CLI)

### Step 1: Deploy Database Migrations

```bash
npm exec --yes supabase@latest -- db push
```

Output:
```
Applying migration 20260417142606_fix_get_users_function.sql...
✔  Migrations pushed successfully
```

### Step 2: Build & Push Frontend

```bash
npm run build
git add .
git commit -m "feat: update function api_get_users"
git push origin main
```

GitHub Actions akan secara otomatis:
1. ✓ Validasi Secrets
2. ✓ Build dengan `VITE_BASE_PATH=/v/`
3. ✓ Deploy ke GitHub Pages
4. ✓ Available di: https://yuniamagsila.github.io/v/

---

## 📊 5. Current Project URLs

| Purpose | URL |
|---------|-----|
| **Database** | https://upvrcaivdzuxozdwzvdq.supabase.co |
| **Frontend (Dev)** | `http://localhost:5173` |
| **Frontend (Prod)** | https://yuniamagsila.github.io/v/ |
| **GitHub Repo** | https://github.com/yuniamagsila/v |

---

## 🛠️ 6. Troubleshooting

### Error: "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tidak ditemukan"

**Solusi:**
1. Buka https://github.com/yuniamagsila/v/settings/secrets/actions
2. Pastikan 2 secrets sudah ada dan benar
3. Rerun workflow

### Error: "Function not found in schema cache"

**Solusi:**
```bash
npm exec --yes supabase@latest -- db query --linked "select pg_notify('pgrst', 'reload schema');"
```

### Build gagal di GitHub Actions

**Debug:**
1. Cek logs di GitHub Actions
2. Verify `.env.local` di lokal: `env | grep VITE`
3. Ensure `npm run build` berhasil lokal terlebih dahulu

### Perintah CLI salah ke project lama

Jika Supabase CLI tiba-tiba mengarah ke project lama, biasanya ada environment variable shell yang override project aktif.

```bash
printenv | grep -E '^SUPABASE_PROJECT_ID=|^VITE_SUPABASE_URL=|^VITE_SUPABASE_ANON_KEY='

# bersihkan override untuk sesi terminal saat ini
unset SUPABASE_PROJECT_ID VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY

# jalankan ulang command dengan project ref eksplisit
SUPABASE_PROJECT_ID=upvrcaivdzuxozdwzvdq npm exec --yes supabase@latest -- db push
```

---

## 📝 Checklist Deployment

- [ ] GitHub Secrets di-set (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- [ ] `.env.local` ada di lokal
- [ ] `npm run build` berhasil
- [ ] Migrations sudah di-push ke Supabase
- [ ] Workflow `.github/workflows/deploy-production.yml` ada
- [ ] `git push origin main` di-trigger
- [ ] GitHub Pages live di: https://yuniamagsila.github.io/v/

---

## 🔗 Reference

- **Supabase Docs:** https://supabase.com/docs
- **GitHub Pages:** https://pages.github.com
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

**Last Updated:** 2026-04-18  
**Status:** ✅ Ready for Deployment
