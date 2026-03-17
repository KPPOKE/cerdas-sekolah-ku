

## Sistem Informasi Akademik Sekolah Dasar

### Desain & Tema
- **Warna**: Forest green sebagai aksen utama, background putih/abu-abu muda, teks gelap
- **Bahasa**: Seluruh UI dalam Bahasa Indonesia
- **Layout**: Sidebar navigasi di desktop, hamburger menu di mobile

### Halaman Login
- Form login dengan username & password
- Pilihan role (Admin/Guru) — simulasi autentikasi dengan data mock
- Redirect ke dashboard sesuai role

### 🔑 Admin Panel

**1. Dashboard Admin**
- Statistik: Total Siswa, Total Guru, Total Kelas, Aktivitas Terbaru
- Card ringkasan dengan ikon

**2. Manajemen Pengguna**
- Tabel daftar Guru & Siswa dengan CRUD (modal form)
- Filter & pencarian
- Empty state saat belum ada data

**3. Pengaturan Akademik**
- Kelola Tahun Ajaran & Semester
- Kelola Mata Pelajaran
- Assign guru ke kelas tertentu

**4. Data Master**
- Data lengkap siswa (biodata, info orang tua)
- Data lengkap guru (biodata, kontak)

### 👩‍🏫 Panel Guru

**1. Dashboard Guru**
- Daftar kelas yang diampu
- Jadwal mengajar hari ini

**2. Modul Absensi**
- Pilih kelas → tampilkan daftar siswa
- Tandai kehadiran: Hadir, Alfa, Sakit, Izin
- Rekap absensi per bulan

**3. Sistem Penilaian**
- Input nilai per mata pelajaran (Tugas, UTS, UAS)
- Perhitungan otomatis rata-rata semester
- Export rapor ke PDF & data ke Excel

**4. Daftar Siswa**
- Profil ringkas siswa di kelas yang diampu

### Data & Navigasi
- Semua data menggunakan mock/dummy (localStorage)
- Routing terpisah untuk Admin (`/admin/*`) dan Guru (`/guru/*`)
- Sidebar dengan highlight halaman aktif
- Fully responsive (desktop, tablet, mobile)

