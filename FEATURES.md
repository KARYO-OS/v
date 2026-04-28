# 📖 Fitur Lengkap KARYO OS

Dokumentasi komprehensif semua fitur sistem per-role.

---

## 🏛️ Sistem Overview

KARYO OS mengimplementasikan model RBAC (Role-Based Access Control) dengan **5 role utama**:

```
┌─────────────────────────────────────────────┐
│ SUPER ADMIN (admin)                         │
│ • Konfigurasi sistem                        │
│ • Manajemen akun & reset PIN                │
│ • Audit log & monitoring kesehatan          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ KOMANDAN (komandan)                         │
│ • Tier: Batalion / Kompi / Peleton          │
│ • Manajemen anggota & assign tugas           │
│ • Monitoring real-time & laporan            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ STAF (staf)                                 │
│ • Bidang: S-1 (Pers) / S-3 (Ops) / S-4 (Log)│
│ • Input data operasional sesuai bidang      │
│ • Kelola attendance, tasks, logistics       │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴─────────┐
          │                  │
  ┌───────▼────────┐  ┌──────▼──────────┐
  │ PRAJURIT       │  │ GUARD / PROVOST │
  │ (prajurit)     │  │ (guard)         │
  │ • Tasks daily  │  │ • Validate QR   │
  │ • Gate Pass    │  │ • Scan in/out   │
  │ • Report       │  │ • Check notes   │
  └────────────────┘  └─────────────────┘
```

---

## 🔐 1. Autentikasi

### Login System
- **No Email Required** - Gunakan NRP (Nomor Registrasi Pokok)
- **6-Digit PIN** - Simple, military-standard authentication
- **Session Management** - Automatic role-based redirect
- **Multi-Tab Support** - Sinkronisasi session lintas tab

### Proses Login
```
┌──────────┐
│ Masukkan │ NRP (4-8 digit) + PIN 6-digit
│ Akun     │
└─────┬────┘
      │
      ▼
┌──────────────┐
│ Validasi     │ Cek ke database Supabase
│ Credentials  │
└─────┬────────┘
      │
   ┌──┴──┐
   │     │
   ▼     ▼
BERHASIL GAGAL
│        │
├─────┬──┤
│     │  │
▼     ▼  └──► Error: NRP/PIN salah
REDIRECT    (Auto-clear form)
(per role)
```

### Fitur Keamanan
- ✅ Password hashing bcrypt
- ✅ Row-level security (RLS) di database
- ✅ Session timeout (customizable)
- ✅ Audit log semua login attempts
- ✅ PIN reset hanya oleh admin

---

## 👤 2. Super Admin Dashboard (`/admin`)

### A. Konfigurasi Sistem
```
Settings → Configuration
├─ Branding
│  ├─ App name / logo
│  ├─ Color scheme (primary, secondary)
│  └─ Feature flags
├─ System Settings
│  ├─ Session timeout
│  ├─ Password policy
│  └─ Rate limiting
└─ Integrations
   ├─ Supabase config
   ├─ Email notifications
   └─ API keys
```

### B. Manajemen Personel (600+ users)
```
Users Management
├─ View & Filter (600+ personel)
│  ├─ Search: NRP / Nama
│  ├─ Filter: Role / Unit / Status
│  ├─ Sort: Nama / NRP / Dibuat Tgl
│  └─ Pagination: Virtual scroll (optimized)
├─ Import CSV
│  ├─ Template: NRP, Nama, Role, Unit
│  ├─ Batch import (< 10s untuk 600 user)
│  ├─ Validation & error reporting
│  └─ Rollback jika gagal
├─ Aksi Massal
│  ├─ Reset PIN bulk
│  ├─ Toggle status (active/inactive)
│  ├─ Ubah role/unit bulk
│  └─ Delete dengan konfirmasi
├─ CRUD Individual
│  ├─ Create: Form modal
│  ├─ Read: Detail view
│  ├─ Update: Edit modal (NRP, name, role, unit, status)
│  └─ Delete: Soft-delete + audit trail
└─ Audit Trail
   ├─ Semua aksi tercatat: who, what, when
   └─ Export untuk compliance
```

**Performance**: 600 users load < 2s, virtual scrolling only renders ~20 visible rows

### C. Audit Log & Monitoring
```
Monitoring
├─ Sistem Health
│  ├─ Database: Connection status, query time
│  ├─ Realtime: Active subscriptions, events/min
│  ├─ Storage: Usage, quota
│  └─ Performance: p50/p95/p99 latency
├─ User Activity
│  ├─ Login attempts (success/fail)
│  ├─ Feature usage (most accessed modules)
│  ├─ Data changes (CRUD operations)
│  └─ Timerange: Last 7/30/90 days
└─ Alerts
   ├─ Threshold: Errors > 10/min
   ├─ Deprecated: Downtime > 5min
   └─ Custom: Define custom metrics
```

### D. Feature Flags
```
Feature Control
├─ Toggle fitur on/off instantly (no deploy)
├─ Per-user rollout (A/B testing)
├─ Per-role activation
└─ Bulk enable/disable
```

### E. Analytics & Dashboard
```
Analytics & Performance Metrics
├─ Dashboard Overview
│  ├─ Total personel (active/inactive)
│  ├─ System health status
│  ├─ Real-time activity gauge
│  ├─ Alert summary (jika ada issues)
│  └─ Key metrics at a glance
├─ Task Analytics
│  ├─ Task status distribution (pending/in-progress/done/approved/rejected)
│  ├─ Bar chart: Task status trends
│  ├─ Completion rate per assignment period
│  ├─ Average task duration
│  ├─ Top task assigners
│  └─ Filter by date range, satuan
├─ Attendance Analytics
│  ├─ Attendance status summary (hadir/izin/sakit/dinas_luar/alpa)
│  ├─ Bar chart: Attendance trends
│  ├─ Heatmap: Attendance pattern by day
│  ├─ Per-unit attendance comparison
│  ├─ Late arrival tracking
│  └─ Export attendance data
├─ Custom Filters
│  ├─ Filter by Satuan/Unit
│  ├─ Filter by date range
│  ├─ Real-time or historical data
│  └─ Applied filters persist in session
├─ Data Export
│  ├─ CSV export untuk semua metrics
│  ├─ PDF report generation
│  ├─ Email scheduled reports
│  └─ Bulk download capabilities
└─ Refresh & Caching
   ├─ Manual refresh button
   ├─ Last updated timestamp
   ├─ Auto-refresh every 5 minutes
   └─ Cache optimization for performance
```

---

## 👨‍💼 3. Komandan Dashboard (`/komandan`)

### A. Monitoring Personel
```
Personel Management
├─ Real-time List
│  ├─ Status: Hadir / Izin / Cuti / Keluar
│  ├─ Lokasi: Pos Jaga / HQ / Lapangan
│  ├─ Tier: Batalion / Kompi / Peleton
│  └─ Quick Actions: Send message, assign task, view profile
├─ Statistics
│  ├─ Total personel: count
│  ├─ Hadir hari ini: count
│  ├─ Gate pass aktif: count
│  ├─ Tugas pending: count
│  └─ Overdue alert: count
└─ View Details
   ├─ Attendance history
   ├─ Task completion rate
   ├─ Gate pass submissions
   └─ Discipline notes
```

### B. Task Management
```
Manajemen Tugas
├─ Create Task
│  ├─ Title, description, priority
│  ├─ Assign to: Individual / Group / Unit
│  ├─ Date: Tanggal target penyelesaian
│  ├─ Attachments: File, link, dokumen
│  ├─ Status: Pending → In Progress → Completed
│  └─ Template: Reuse tasks
├─ Monitor Progress
│  ├─ Filter: Status, priority, due date
│  ├─ View: List / Board / Calendar
│  ├─ Metrics: Completion rate, overdue count
│  └─ Bulk actions: Close, extend, reassign
└─ Review Submissions
   ├─ View task reports dari subordinate
   ├─ Accept / Reject / Request revision
   ├─ Add comments & feedback
   └─ Archive completed
```

### C. Gate Pass Approval
```
Gate Pass Management
├─ Pending Approvals
│  ├─ List: Pending submissions dari personel
│  ├─ Details: Tujuan, waktu keluar/kembali, alasan
│  ├─ Approve / Reject / Request info
│  ├─ Bulk approve (select multiple)
│  └─ Filter: Priority, requestor, destination
├─ Tracking
│  ├─ Approved list: Track siapa keluar
│  ├─ Status: Pending → Approved → Checked-in → Completed
│  ├─ Overdue alerts: Auto-flag jika tidak kembali tepat waktu
│  └─ History: Last 30 days
└─ Reports
   ├─ Gate pass usage: Frekuensi per personel
   ├─ Peak times: Jam berapa paling banyak keluar
   └─ Export: CSV / PDF untuk compliance
```

### D. Evaluasi & Penilaian Personel
```
Catatan Disiplin & Penghargaan
├─ Tambah Catatan
│  ├─ Tipe: Penghargaan / Peringatan / Catatan
│  ├─ Pilih personel dari unit
│  ├─ Deskripsi lengkap catatan
│  ├─ Auto-timestamp saat dibuat
│  └─ History tersimpan permanen
├─ View History
│  ├─ Lihat semua catatan per personel
│  ├─ Filter: Tipe, tanggal, personel
│  ├─ Sort: Terbaru / Tertua
│  └─ Search: Cari berdasarkan isi
├─ Aksi
│  ├─ Edit catatan (hanya pembuat atau admin)
│  ├─ Delete catatan
│  ├─ Print/Export
│  └─ Attach dokumen pendukung
└─ Laporan
   ├─ Statistik: Total penghargaan vs peringatan per personel
   ├─ Report periode (bulanan/tahunan)
   └─ Export untuk HRD
```

### E. Manajemen Sprint (Surat Perintah Dinas)
```
Surat Perintah (Sprint) Management
├─ Create Sprint
│  ├─ Judul surat perintah
│  ├─ Dasar hukum / pertimbangan
│  ├─ Tujuan dinas
│  ├─ Tempat tujuan
│  ├─ Tanggal berangkat & kembali
│  ├─ Pilih personel yang ditunjuk
│  ├─ Assign jabatan untuk setiap personel
│  └─ Status awal: Draft
├─ Workflow
│  ├─ Draft: Komandan input data
│  ├─ Disetujui: Komandan approve sendiri / tunggu atasan
│  ├─ Aktif: Sprint sedang berlangsung
│  ├─ Selesai: Sprint completed, laporan diterima
│  └─ Dibatalkan: Jika ada perubahan perintah
├─ Tracking
│  ├─ List semua sprint (aktif & historis)
│  ├─ Filter: Status, tanggal, tempat tujuan
│  ├─ View detail personel yang ditugaskan
│  ├─ Track status setiap personel
│  └─ Add notes/amendments
├─ Reports
│  ├─ Laporan kembali dari personel
│  ├─ View & dokumentasikan hasil dinas
│  ├─ Archive sprint setelah selesai
│  └─ History untuk compliance
└─ Actions
   ├─ Edit (jika masih draft)
   ├─ Change status manually
   ├─ Delete (hanya draft untuk keamanan)
   └─ Print surat perintah
```

### F. Permintaan Logistik
```
Logistics Request Management
├─ Submit Request
│  ├─ Nama item yang diminta
│  ├─ Jumlah & satuannya
│  ├─ Alasan / keperluan
│  ├─ Tingkat urgensi (optional)
│  └─ Status awal: Pending
├─ Track Status
│  ├─ List semua permintaan
│  ├─ Filter: Status (pending/approved/rejected)
│  ├─ View admin notes / rejection reason
│  ├─ Timeline kapan disetujui/ditolak
│  └─ Quantity approved vs requested
├─ History
│  ├─ Completed requests (last 90 days)
│  ├─ Average approval time
│  ├─ Most frequent requested items
│  └─ Export untuk dokumentasi
└─ Actions
   ├─ Edit request (jika masih pending)
   ├─ Resubmit setelah ditolak
   └─ Cancel request (jika tidak diperlukan lagi)
```

### G. Laporan Operasional
```
Laporan Ops Management
├─ View Submitted Reports
│  ├─ Dari Staf S-3 (Operasional)
│  ├─ Tipe: Harian / Insidentil / Latihan / dll
│  ├─ Status: Diajukan / Diketahui / Diarsipkan
│  ├─ Filter & sort reports
│  └─ Quick preview
├─ Review Process
│  ├─ Read full report
│  ├─ Mark as "Diketahui" (approve/acknowledge)
│  ├─ Archive jika sudah ditindaklanjuti
│  ├─ Add response/notes
│  └─ Escalate jika perlu
├─ History & Archive
│  ├─ Lihat laporan yang sudah diketahui
│  ├─ Archive untuk rujukan
│  ├─ Search by date/type/content
│  └─ Export untuk compliance
└─ Statistics
   ├─ Total reports per period
   ├─ Average response time
   ├─ Reports by type
   └─ Open vs closed reports
```

### H. Reports & Analytics
```
Laporan Komandan
├─ Daily Reports
│  ├─ Attendance summary: Hadir / Izin / Sakit / Alpa
│  ├─ Task completion: Selesai vs pending
│  ├─ Gate passes approved: Jumlah & destinasi
│  ├─ Logistics requests pending
│  └─ Any incidents / alerts
├─ By Date Selection
│  ├─ Pick specific date untuk laporan
│  ├─ Data real-time atau historis
│  ├─ Compare dengan hari lain
│  └─ Trend visualization
├─ Export Options
│  ├─ Download as CSV
│  ├─ Print for records
│  ├─ Email to higher authority
│  └─ Schedule recurring reports
└─ Performance Metrics
   ├─ Personel performance ranking
   ├─ Task completion rate per personel
   ├─ Attendance rate trends
   ├─ Gate pass usage patterns
   └─ Discipline incidents tracking
```

### I. Komunikasi
```
Messaging
├─ Send Broadcast
│  ├─ Ke: Unit / Role / Individual
│  ├─ Tipe: Info / Alert / Urgent
│  ├─ Schedule: Now / Later
│  └─ Tracking: Delivered / Read
├─ Receive Reports
│  ├─ From: Subordinate
│  ├─ Tipe: Task report, issue, feedback
│  ├─ Filter & search
│  └─ Archive
└─ Notifications
   ├─ Real-time pada dashboard
   ├─ Email/push (optional)
   └─ Do-not-disturb hours
```

---

## 👔 4. Staf Dashboard (`/staf`)

Automatic role-mapping berdasarkan `jabatan` field:

### S-1 (Personnel / Pers)
```
Bidang Personel (S-1)
├─ Absensi Management
│  ├─ Manual input kehadiran
│  ├─ Bulk mark kehadiran (excel import)
│  ├─ History: 3 months
│  ├─ Discrepancy report (jika ada anomali)
│  └─ Approve: Dari sistem ke komandan
├─ Izin & Cuti
│  ├─ Kelola izin dari personel
│  ├─ Approve / Reject izin
│  ├─ Track: Cuti balance per personel
│  └─ Bulk cuti: Liburan nasional
└─ Personel Data
   ├─ Maintain data pribadi
   ├─ Contact info updates
   ├─ Education/training records
   └─ Discipline notes entry
```

### S-3 (Operations / Ops)
```
Bidang Operasional (S-3)
├─ Task Distribution
│  ├─ Create & assign tasks
│  ├─ Priority levels: Urgent / Normal / Low
│  ├─ Broadcast instruksi ke unit
│  └─ Track completion
├─ Shift Schedule
│  ├─ Create shift templates
│  ├─ Assign personel ke shift
│  ├─ Conflict detection
│  ├─ Publish schedule
│  └─ Track actual attendance
├─ Pos Jaga (Guard Post) Management
│  ├─ Buat & kelola posts
│  ├─ Assign guard (personel)
│  ├─ Generate QR code per post
│  ├─ Monitor: Siapa jaga sekarang
│  └─ History: Jaga records
└─ Incident Reporting
   ├─ Report operasional incidents
   ├─ Severity levels
   ├─ Send ke komandan & higher authority
   └─ Track resolution
```

### S-4 (Logistics / Log)
```
Bidang Logistik (S-4)
├─ Inventory Management
│  ├─ Item master: Nama, kategori, unit, harga
│  ├─ Stock tracking: Incoming / outgoing
│  ├─ Reorder alerts: Low stock warnings
│  ├─ Physical count: Reconcile vs system
│  └─ History: 1 year
├─ Purchase Requisition
│  ├─ Create request (dari komandan)
│  ├─ Approve / Reject dengan reason
│  ├─ Track: Budget vs actual
│  └─ Archive: Closed POs
├─ Distribution
│  ├─ Track: Mana barang dikirim
│  ├─ Recipient: Personel / Unit
│  ├─ Signature: Digital approval
│  └─ Return: Track retur
└─ Reports
   ├─ Inventory report (current stock)
   ├─ Usage report (trend)
   ├─ Budget utilization
   └─ Supplier performance
```

---

## 🪖 5. Prajurit Dashboard (`/prajurit`)

### A. Task Management
```
Tugas
├─ Assigned Tasks
│  ├─ List dari komandan
│  ├─ Priority: Urgent badge jika ada
│  ├─ Due date: Countdown timer
│  ├─ View: Details dengan attachment
│  └─ Status: Pending → In Progress → Submitted
├─ Report Submission
│  ├─ Kerjakan task → Submit report
│  ├─ Add: Description, attachment, photos
│  ├─ Status: Submitted (waiting for approval)
│  └─ Notification: Approval status
├─ History
│  ├─ Completed tasks (Last 30 days)
│  ├─ Rating: Berapa bintang dari komandan
│  └─ Performance trend chart
└─ Overdue Alert
   ├─ Tasks that past due date
   ├─ Fast action: Report late submission
   └─ Notification bell prominent
```

### B. Attendance
```
Absensi
├─ Check-in / Check-out
│  ├─ Daily clock in/out
│  ├─ Location capture (optional GPS)
│  ├─ Time recorded automatically
│  └─ Confirmation message
├─ Status
│  ├─ Hari ini: Present / Absent / Late
│  ├─ On leave: Show tipe cuti
│  ├─ On gate pass: Show tujuan
│  └─ Real-time update
├─ History
│  ├─ Monthly attendance calendar
│  ├─ Summary: Present/Absent/Cuti days
│  ├─ Punctuality: On-time %, average
│  └─ Discrepancy flag: If karyawan input ≠ system
└─ Permohonan Izin
   ├─ Submit: Cuti / Sakit / Keperluan
   ├─ Date range & alasan
   ├─ Attachment: Dokumen (surat sakit, etc)
   ├─ Status: Pending / Approved / Rejected
   └─ Notification: Approval update
```

### C. Gate Pass (Keluar-Masuk)
```
Gate Pass
├─ Submission
│  ├─ Alasan (Reason): Text, 5-255 chars
│  ├─ Tujuan (Destination): 3-255 chars
│  ├─ Waktu Keluar: Date + time
│  ├─ Waktu Kembali: Date + time (> keluar, ≤ 7 hari)
│  ├─ GPS Location: Optional latitude/longitude saat submit (untuk tracking)
│  ├─ Auto-approval: Auto-approved jika eligible
│  │   └─ Kriteria: Good history, known destination, ≤ 24h, working hours
│  ├─ Submit
│  └─ Instant cancel: Can cancel anytime before checkout (status = 'cancelled')
├─ Approval Status
│  ├─ Auto-Approved: Langsung bisa berangkat
│  ├─ Pending: Tunggu approval komandan
│  ├─ Rejected: Reason ditampilkan
│  ├─ Cancelled: User membatalkan sebelum keluar
│  └─ Timeline: Submitted → Approved → Checkout → Checkin → Completed
├─ At Guard Post
│  ├─ Guard scan QR code
│  ├─ CHECKOUT (first scan):
│  │  ├─ System records: Actual checkout time
│  │  ├─ Auto-adjust return time: If checkout delayed, return time otomatis extended
│  │  │   Example: Planned 14:00-18:00, actual checkout 14:10 → return adjusted to 18:10
│  │  └─ Status changes to: 'checked_in'
│  ├─ CHECKIN (when returning):
│  │  ├─ Guard scan QR again
│  │  ├─ System records: Actual return time
│  │  └─ Status changes to: 'completed'
│  └─ Validation: Can only scan if status = 'approved'
├─ Overdue Tracking
│  ├─ System auto-flags if actual_kembali > adjusted_waktu_kembali
│  ├─ Status becomes: 'overdue' (if not returned by expected time)
│  ├─ Notification ke: Personel + Komandan + Guard
│  ├─ Action: Contact personel, mark as emergency
│  └─ Resolution: Guard can override on checkout (update actual times)
├─ Cancellation
│  ├─ Prajurit dapat cancel sebelum keluar
│  ├─ Status: pending/approved → cancelled
│  ├─ Cannot cancel: Jika sudah checkout (status = checked_in/completed)
│  └─ Notifikasi: Komandan ternotif cancellation
└─ History
   ├─ All submissions (Last 90 days)
   ├─ Status distribution chart (include 'cancelled')
   ├─ Destination frequency
   ├─ Average duration per destination
   ├─ GPS tracking map: Show checkout/checkin locations
   └─ Delay analytics: Avg checkout delay by destination
```

### D. Kalender Kegiatan & RSVP
```
Kegiatan & Event Management
├─ View Kegiatan
│  ├─ List semua kegiatan satuan
│  ├─ Filter: Tanggal, jenis, status RSVP
│  ├─ Jenis kegiatan: Latihan / Upacara / Inspeksi / Perjalanan / Rapat / Lainnya
│  ├─ Show: Waktu, lokasi, deskripsi, peserta yang diundang
│  └─ Personalized: Hanya kegiatan satuan user
├─ RSVP Management (Konfirmasi Kehadiran)
│  ├─ Respond Status
│  │  ├─ Hadir: Konfirmasi hadir
│  │  ├─ Tidak Hadir: Konfirmasi tidak hadir
│  │  └─ Belum: Default state (belum dikonfirmasi)
│  ├─ Timeline
│  │  ├─ Submit RSVP anytime sebelum kegiatan
│  │  ├─ Update RSVP sampai kegiatan dimulai
│  │  └─ History: Lihat riwayat RSVP changes
│  ├─ Attendance Verification
│  │  ├─ Admin/Komandan verify kehadiran saat kegiatan
│  │  ├─ Compare RSVP vs actual attendance
│  │  └─ Flag discrepancies untuk follow-up
│  └─ Notifications
│     ├─ Reminder: 1 hari sebelum kegiatan
│     ├─ Update: Jika ada perubahan kegiatan
│     └─ Confirmation: Notif ketika RSVP diterima
├─ History & Trends
│  ├─ Past events: Kegiatan yang sudah berlalu
│  ├─ Attendance rate: % keua vs RSVP hadir
│  ├─ Personal calendar: Timeline kegiatan pribadi
│  └─ Statistics: Total kehadiran per periode
└─ Details View
   ├─ Judul kegiatan
   ├─ Tanggal & waktu (mulai-selesai)
   ├─ Lokasi kegiatan
   ├─ Deskripsi detail
   ├─ Peserta yang RSVP hadir
   └─ Documents/attachment jika ada
```

### E. Komunikasi & Dokumen
```
Messaging & Documents
├─ Inbox
│  ├─ Pesan dari komandan / staf
│  ├─ Tipe: Info / Alert / Instruksi
│  ├─ Read status
│  └─ Archive
├─ Notifikasi
│  ├─ Task assignment
│  ├─ Approval updates
│  ├─ Broadcast dari komandan
│  ├─ Badge count
│  └─ Sound + vibration (configurable)
├─ Documents
│  ├─ Download dokumen dari sistem
│  ├─ Types: Forms, regulasi, template
│  ├─ Offline access: Saved for offline reading
│  └─ Latest version indicator
└─ Profile
   ├─ View pribadi data
   ├─ Edit: Contact, alamat, emergency contact
   ├─ Security: Change PIN (old PIN required)
   └─ Picture: Upload profile photo
```

### F. Apel Digital
```
Sesi Apel & Laporan Kehadiran
├─ Join Apel Session
│  ├─ View sesi apel hari ini
│  ├─ Jenis apel: Pagi / Siang / Sore / Khusus
│  ├─ Jadwal: Waktu buka dan tutup sesi
│  ├─ Status: Open / Closed
│  ├─ Countdown timer sampai sesi tutup
│  └─ Personal status: Sudah lapor / Belum lapor
├─ Lapor Hadir
│  ├─ One-click button untuk lapor kehadiran saat sesi buka
│  ├─ Confirmation: "Kehadiran dicatat pukul HH:MM"
│  ├─ Dapat repeat: Bisa ulang jika belum hadir
│  └─ Timestamp auto-saved
├─ History & Statistics
│  ├─ Monthly attendance: Chart kehadiran apel per bulan
│  ├─ Streak: Berapa hari berturut-turut hadir
│  ├─ Missed sessions: Daftar sesi yang tidak dihadiri
│  ├─ Alpa pattern analysis
│  └─ Exportable for personal records
└─ Notifications
   ├─ Reminder: Notif sebelum sesi dimulai
   ├─ Session open: Notif ketika sesi buka
   ├─ Session closing soon: Warning mendekati akhir
   └─ Confirmation: Auto-notif setelah lapor hadir
```

### G. Reporting
```
Laporan Pribadi
├─ Statistics
│  ├─ Attendance: % kehadiran bulan ini
│  ├─ Tasks: Completed vs assigned
│  ├─ Rating: Average rating dari komandan
│  ├─ Gate pass: Submitted vs approved
│  ├─ Apel attendance: % kehadiran apel
│  └─ Punctuality: Ontime %
├─ Trends
│  ├─ Performance trend (3-month chart)
│  ├─ Attendance pattern (daily/weekly)
│  ├─ Task completion rate trend
│  ├─ Discipline incidents (jika ada)
│  └─ RSVP accuracy (laporan vs actual hadir)
└─ Export
   ├─ Download personal record (PDF)
   ├─ Attendance certificate
   ├─ Performance report
   ├─ Gate pass summary
   └─ For HR / external agencies
```

### H. Pos Jaga Scanning
```
Scan Pos Jaga
├─ QR Scanner Interface
│  ├─ Scan static QR code di pos jaga
│  ├─ Auto-detect lokasi pos berdasarkan QR
│  ├─ Camera focus & auto-focus
│  ├─ Vibration feedback saat scan
│  └─ Sound notification
├─ Scan Recording
│  ├─ Auto-timestamp saat scan
│  ├─ Record lokasi GPS (optional)
│  ├─ Store locally + sync online
│  ├─ Offline-capable (works without internet)
│  └─ Sync when online
├─ History & Analytics
│  ├─ Per-location scan history
│  ├─ Peak scan times
│  ├─ Frequency analytics per pos
│  ├─ Personal visit pattern
│  └─ Export scan records
└─ Feedback
   ├─ Success: Green screen + beep
   ├─ Error: Red screen + info
   ├─ Duplicate: Alert jika sudah scan pos sama hari ini
   └─ Summary: Total pos scanned hari ini
```

---

## 🪖 5. Reporting
```
Laporan Pribadi
├─ Statistics
│  ├─ Attendance: % kehadiran bulan ini
│  ├─ Tasks: Completed vs assigned
│  ├─ Rating: Average rating dari komandan
│  ├─ Gate pass: Submitted vs approved
│  ├─ Apel attendance: % kehadiran apel
│  └─ Punctuality: Ontime %
├─ Trends
│  ├─ Performance trend (3-month chart)
│  ├─ Attendance pattern (daily/weekly)
│  ├─ Task completion rate trend
│  ├─ Discipline incidents (jika ada)
│  └─ RSVP accuracy (laporan vs actual hadir)
└─ Export
   ├─ Download personal record (PDF)
   ├─ Attendance certificate
   ├─ Performance report
   ├─ Gate pass summary
   └─ For HR / external agencies
```

### A. QR Scanning & Validation
```
Gate Post Duties
├─ QR Scanner Interface
│  ├─ Camera access (use device camera)
│  ├─ Scan gate pass QR code
│  ├─ Automatic validation
│  └─ Haptic feedback (vibration)
├─ Validation Checks
│  ├─ QR exists in system?
│  ├─ Gate pass status? (must be approved)
│  ├─ Waktu keluar sudah tiba? (or too early)
│  ├─ Jika scanning keluar: Record time & location
│  ├─ Jika scanning kembali: Mark completed
│  └─ If overdue: Alert and escalate
├─ Result Display
│  ├─ Green (✓): Scan success, personel bisa lewat
│  ├─ Red (✗): Invalid/expired/already used
│  ├─ Yellow (⚠): Warning - ask personel (e.g. slightly early)
│  └─ Beep + vibration feedback
└─ Manual Entry
   ├─ Jika QR scanner rusak: Manual NRP/PIN entry
   ├─ Verify personel identity
   ├─ Record manually if QR not available
   └─ Flag untuk review nanti
```

### B. Check-list & Inspection
```
Guard Check List
├─ Pre-Shift
│  ├─ Weapon count & serial check
│  ├─ Post condition inspection (cleanness, security)
│  ├─ Equipment availability
│  ├─ Sign-in to start shift
│  └─ Handover dari previous guard
├─ During Shift
│  ├─ Log all personel in/out
│  ├─ Monitor suspicious activity
│  ├─ Check guest list (if applicable)
│  ├─ Perimeter check (time-based)
│  └─ Report incidents immediately
└─ End-Shift
   ├─ Count & verify weapon again
   ├─ Final post inspection
   ├─ Handover checklist
   ├─ Sign-out from duty
   └─ Incident summary
```

### C. Discipline Notes
```
Personel Monitoring
├─ View Discipline History
│  ├─ Untuk setiap personel yang scan QR
│  ├─ Show: Incidents, warnings, violations
│  ├─ Tipe: Late arrivals, unauthorized absence, etc
│  ├─ Date & reason
│  └─ Status: Resolved / Pending
├─ Add Incident
│  ├─ Tipe: Violation, late, unauthorized, etc
│  ├─ Severity: Minor / Major / Critical
│  ├─ Description + timestamp
│  ├─ Evidence: Photo / attachment (optional)
│  └─ Escalate ke komandan
└─ Alert System
   ├─ Flag high-risk personel (pattern detection)
   ├─ Auto-notify komandan if severity high
   ├─ Followup: Track investigation status
   └─ Archive resolved cases
```

### D. Real-time Dashboard
```
Guard Dashboard
├─ Current Shift Info
│  ├─ Waktu shift: Check-in → Check-out
│  ├─ Expected personel today: Count
│  ├─ Checked in so far: Live counter
│  ├─ Overdue (not kembali): Alert list
│  └─ Post status: Alert jika ada issue
├─ Live Activity Log
│  ├─ Last 10 QR scans: Time, personel, tipe (in/out)
│  ├─ Auto-refresh
│  └─ Click untuk details
├─ Statistics
│  ├─ Total gate passes today
│  ├─ Failed scans (if any)
│  ├─ Average processing time
│  └─ Current active personel di luar
└─ Emergency
   ├─ SOS button untuk urgent report
   ├─ Direct call ke supervisor
   └─ Auto-escalate incident
```

---

## 🔑 Role Permissions Matrix

| Action | Admin | Komandan | Staf | Prajurit | Guard |
|--------|-------|----------|------|----------|-------|
| Create User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅* | ✅* | ❌ | ❌ |
| Assign Task | ❌ | ✅* | ✅* | ❌ | ❌ |
| Create Task | ❌ | ✅ | ✅ | ❌ | ❌ |
| Submit Gate Pass | ❌ | ✅ | ❌ | ✅ | ❌ |
| Approve Gate Pass | ✅ | ✅* | ❌ | ❌ | ❌ |
| Scan QR | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Audit Log | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅* | ✅* | ✅* | ❌ |

`*` = Scoped by unit/role hierarchy

---

## ⚙️ Advanced Features

### 1. Real-time Synchronization
- Multi-tab sync: Perubahan di satu tab langsung reflect di tab lain
- Realtime subscriptions: Live updates tanpa polling
- Conflict resolution: Last-write-wins strategy

### 2. Offline Support (PWA)
- Service Worker: Cache-first for assets
- IndexedDB: 50MB offline database
- Background sync: Sync when online again
- Offline indicator: Show status di navbar

### 3. Performance Optimization (600+ Users)
- Virtual scrolling: Only render visible rows
- Request coalescing: Deduplicate identical requests
- Caching: 2-min TTL on API responses
- Bundle optimization: Dynamic imports for heavy modules

### 4. Security
- Row-level security (RLS) at database layer
- NRP + PIN authentication
- Audit logging: All actions tracked
- Session management: Timeout + refresh token

---

## 📚 For More Details

- **Advanced Gate Pass**: See `/docs/ADVANCED_GATE_PASS.md`
- **API Reference**: See `/docs/API_REFERENCE.md`
- **Performance Optimization**: See `/docs/SCALABILITY.md`
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

[← Back to README](./README.md)
