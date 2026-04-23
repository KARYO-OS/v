# Update Gate Pass - Waktu Keluar dan Kembali Otomatis

## 📋 Ringkasan Perubahan

Pembaruan ini mengimplementasikan fitur otomatis pengisian dan tampilan **Waktu Keluar (Waktu Keluar Aktual)** dan **Waktu Kembali (Waktu Kembali Aktual)** saat scanning di Pos Jaga.

## 🎯 Fitur yang Ditambahkan

### 1. **Otomatis Capture Waktu Scanning** ✓
- Sistem backend sudah otomatis mengupdate `actual_keluar` saat scan keluar (status approved → checked_in)
- Sistem backend sudah otomatis mengupdate `actual_kembali` saat scan kembali (status checked_in → completed)
- Waktu capture dilakukan server-side dengan `NOW()` untuk akurasi maksimal

### 2. **Utility Formatter Waktu** (`src/utils/timeFormatter.ts`)
- `formatTimeOnly(waktu)` - Format "HH:mm" (contoh: "14:30")
- `formatTimeWithDate(waktu)` - Format "HH:mm (DD Mon)" (contoh: "14:30 (25 Apr)")
- `formatFullDateTime(waktu)` - Format lengkap dengan hari (contoh: "Selasa, 25 April 2026 14:30")
- `formatDateOnly(waktu)` - Hanya tanggal (contoh: "25 April 2026")
- `formatRelativeTime(waktu)` - Waktu relatif (contoh: "24 menit lalu")
- `formatDuration(start, end)` - Durasi antara dua waktu (contoh: "4 jam 30 menit")

### 3. **Enhanced ScanResultCard** (`src/components/guard/ScanResultCard.tsx`)
Menampilkan informasi lengkap после scanning:
- **Status Utama** - Indikator jelas (✓ Sudah Keluar, ✓✓ Sudah Kembali, ⏳ Menunggu Keluar)
- **Waktu Keluar**
  - Rencana: Waktu keluar yang direncanakan
  - Aktual: Waktu capture saat scan dengan badge ✓ success
- **Waktu Kembali**
  - Rencana: Waktu kembali yang direncanakan
  - Aktual: Waktu capture saat scan dengan badge ✓ success
  - Status: "Menunggu scan kembali..." jika belum kembali

### 4. **Enhanced GatePassList** (`src/components/gatepass/GatePassList.tsx`)
Menampilkan riwayat gate pass dengan informasi waktu:
- Kolom Keluar:
  - Rencana: Waktu yang direncanakan
  - Aktual: Waktu capture (jika sudah discan) dengan ✓ icon
- Kolom Kembali:
  - Rencana: Waktu yang direncanakan
  - Aktual: Waktu capture (jika sudah discan) dengan ✓ icon

### 5. **Updated Tests** (`src/tests/components/guard/ScanResultCard.test.tsx`)
- Test case untuk status `checked_in` (sudah keluar)
- Test case untuk status `approved` (siap keluar)
- Test case untuk status `completed` (sudah kembali)
- Verification waktu rencana dan aktual ditampilkan dengan benar

## 🔄 Alur Penggunaan

### Skenario 1: Prajurit Keluar
1. Prajurit sudah membuat gate pass dengan waktu rencana (misal: 14:30 - 17:30)
2. Gate pass di-approve oleh komandan (status → 'approved')
3. Di Pos Jaga, prajurit scan QR gate pass
4. Sistem otomatis:
   - Set `actual_keluar = NOW()` (misal: 14:35)
   - Update status → 'checked_in'
   - Display di ScanResultCard menunjukkan:
     - Rencana: 14:30
     - Aktual: 14:35 ✓

### Skenario 2: Prajurit Kembali
1. Prajurit scan QR lagi di Pos Jaga saat kembali
2. Sistem otomatis:
   - Set `actual_kembali = NOW()` (misal: 17:25)
   - Update status → 'completed'
   - Display di ScanResultCard menunjukkan:
     - Waktu Kembali:
       - Rencana: 17:30
       - Aktual: 17:25 ✓

## 📊 Data yang Disimpan

### Database Fields
```typescript
interface GatePass {
  waktu_keluar: string;        // Waktu rencana keluar (input user saat buat)
  waktu_kembali: string;       // Waktu rencana kembali (input user saat buat)
  actual_keluar?: string;      // Waktu AKTUAL keluar (captured saat scan)
  actual_kembali?: string;     // Waktu AKTUAL kembali (captured saat scan)
  status: GatePassStatus;      // approved → checked_in → completed
}
```

## 🛠️ File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/utils/timeFormatter.ts` | ✨ NEW - Utility untuk format waktu |
| `src/components/guard/ScanResultCard.tsx` | 🔄 Enhanced - Tampilkan waktu rencana & aktual |
| `src/components/gatepass/GatePassList.tsx` | 🔄 Enhanced - Tampilkan waktu dengan icon ✓ |
| `src/tests/components/guard/ScanResultCard.test.tsx` | 🔄 Updated - Test cases sesuai UI baru |

## 🎨 Visual Changes

### Guard Dashboard - Scan Result
```
┌─────────────────────────────────────┐
│  Nama: Prajurit A                   │
│  NRP: 12345                         │
│                                     │
│  ✓ Sudah Keluar                     │
│                                     │
│  🕐 Waktu Keluar                    │
│    Rencana: 14:30 (25 Apr)          │
│    Aktual:  14:35 (25 Apr) ✓        │
│                                     │
│  🕐 Waktu Kembali                   │
│    Rencana: 17:30 (25 Apr)          │
│    Aktual:  17:25 (25 Apr) ✓        │
│                                     │
│  Scan kembali untuk masuk           │
└─────────────────────────────────────┘
```

### Gate Pass List - Row Item
```
Tujuan: Bandung        [APPROVED]
Keperluan: Rapat Penting

🕐 Keluar: 14:30 ✓ 14:35
🕐 Kembali: 17:30 ✓ 17:25
```

## ✅ Checklist Implementasi

- [x] Create utility formatter time (`timeFormatter.ts`)
- [x] Update `ScanResultCard` untuk tampilkan actual times
- [x] Update `GatePassList` untuk tampilkan actual times pada list
- [x] Update test cases sesuai UI baru
- [x] Verify tidak ada compilation errors
- [x] Dokumentasi lengkap

## 🚀 Testing

### Manual Testing
1. Buka `/guard` untuk Guard Dashboard
2. Scan QR gate pass (approved status)
3. Verifikasi `ScanResultCard` menampilkan:
   - Rencana: waktu_keluar
   - Aktual: actual_keluar (captured saat scan)
4. Verify untuk kembali juga sama

### Automated Testing
```bash
npm test -- src/tests/components/guard/ScanResultCard.test.tsx
npm test -- src/tests/components/gatepass/GatePassList.test.tsx
```

## 💾 Backend Implementation (Already Done)

Database migration sudah implemented di:
- `supabase/migrations/20260418222000_harden_scan_rpcs_and_combined_auth_scan.sql`

Fungsi RPC:
- `scan_gate_pass()` - Capture actual_keluar dan actual_kembali
- `authenticated_scan_pos_jaga()` - Scan dengan NRP+PIN

Both functions otomatis set:
- `actual_keluar = NOW()` saat keluar (status: approved → checked_in)
- `actual_kembali = NOW()` saat kembali (status: checked_in → completed)

## 📝 Notes

- Waktu capture menggunakan server timezone untuk konsistensi
- Display format menggunakan locale Indonesia (id-ID)
- Utility formatter dapat digunakan di komponen lain yang perlu tampilkan waktu
- Actual times dan rencana times ditampilkan bersebelahan untuk perbandingan mudah
