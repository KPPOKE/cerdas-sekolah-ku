import type { User, Siswa, Guru, Kelas, TahunAjaran, Semester, MataPelajaran, PengajaranGuru, Absensi, Nilai } from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', nama: 'Administrator', role: 'admin', email: 'admin@sekolah.id' },
  { id: 'u2', username: 'guru1', nama: 'Bu Siti Aminah', role: 'guru', email: 'siti@sekolah.id' },
  { id: 'u3', username: 'guru2', nama: 'Pak Budi Santoso', role: 'guru', email: 'budi@sekolah.id' },
];

export const mockTahunAjaran: TahunAjaran[] = [
  { id: 'ta1', nama: '2025/2026', mulai: '2025-07-14', selesai: '2026-06-20', aktif: true },
  { id: 'ta2', nama: '2024/2025', mulai: '2024-07-15', selesai: '2025-06-21', aktif: false },
];

export const mockSemester: Semester[] = [
  { id: 'sm1', nama: 'Semester 1 (Ganjil)', tahunAjaranId: 'ta1', aktif: false },
  { id: 'sm2', nama: 'Semester 2 (Genap)', tahunAjaranId: 'ta1', aktif: true },
];

export const mockMataPelajaran: MataPelajaran[] = [
  { id: 'mp1', kode: 'MTK', nama: 'Matematika', deskripsi: 'Pelajaran Matematika' },
  { id: 'mp2', kode: 'BIN', nama: 'Bahasa Indonesia', deskripsi: 'Pelajaran Bahasa Indonesia' },
  { id: 'mp3', kode: 'IPA', nama: 'Ilmu Pengetahuan Alam', deskripsi: 'Pelajaran IPA' },
  { id: 'mp4', kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial', deskripsi: 'Pelajaran IPS' },
  { id: 'mp5', kode: 'PKN', nama: 'Pendidikan Kewarganegaraan', deskripsi: 'Pelajaran PKn' },
  { id: 'mp6', kode: 'AGM', nama: 'Pendidikan Agama', deskripsi: 'Pelajaran Agama' },
];

export const mockKelas: Kelas[] = [
  { id: 'k1', nama: 'Kelas 1A', tingkat: 1, tahunAjaranId: 'ta1', guruId: 'g1' },
  { id: 'k2', nama: 'Kelas 2A', tingkat: 2, tahunAjaranId: 'ta1', guruId: 'g2' },
  { id: 'k3', nama: 'Kelas 3A', tingkat: 3, tahunAjaranId: 'ta1', guruId: 'g1' },
  { id: 'k4', nama: 'Kelas 4A', tingkat: 4, tahunAjaranId: 'ta1', guruId: 'g3' },
  { id: 'k5', nama: 'Kelas 5A', tingkat: 5, tahunAjaranId: 'ta1', guruId: 'g2' },
  { id: 'k6', nama: 'Kelas 6A', tingkat: 6, tahunAjaranId: 'ta1', guruId: 'g3' },
];

export const mockGuru: Guru[] = [
  { id: 'g1', nip: '198501012010011001', nama: 'Siti Aminah, S.Pd', tempatLahir: 'Jakarta', tanggalLahir: '1985-01-01', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Melati No. 12, Jakarta', telepon: '081234567890', email: 'siti@sekolah.id', pendidikan: 'S1 PGSD' },
  { id: 'g2', nip: '198703152011011002', nama: 'Budi Santoso, S.Pd', tempatLahir: 'Bandung', tanggalLahir: '1987-03-15', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Kenanga No. 5, Bandung', telepon: '081298765432', email: 'budi@sekolah.id', pendidikan: 'S1 Pendidikan Matematika' },
  { id: 'g3', nip: '199002202012012003', nama: 'Dewi Lestari, S.Pd', tempatLahir: 'Surabaya', tanggalLahir: '1990-02-20', jenisKelamin: 'P', agama: 'Kristen', alamat: 'Jl. Anggrek No. 8, Surabaya', telepon: '081356789012', email: 'dewi@sekolah.id', pendidikan: 'S1 Pendidikan IPA' },
];

export const mockSiswa: Siswa[] = [
  { id: 's1', nis: '20250001', nama: 'Ahmad Rizki', tempatLahir: 'Jakarta', tanggalLahir: '2018-05-12', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Mawar No. 3', kelasId: 'k1', namaAyah: 'Hendra Rizki', namaIbu: 'Sari Wulan', teleponOrtu: '081200001111' },
  { id: 's2', nis: '20250002', nama: 'Putri Amelia', tempatLahir: 'Bogor', tanggalLahir: '2018-08-22', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Dahlia No. 7', kelasId: 'k1', namaAyah: 'Rudi Amelia', namaIbu: 'Rina Sari', teleponOrtu: '081200002222' },
  { id: 's3', nis: '20250003', nama: 'Bima Prasetya', tempatLahir: 'Depok', tanggalLahir: '2017-03-10', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Cemara No. 15', kelasId: 'k2', namaAyah: 'Andi Prasetya', namaIbu: 'Lina Marlina', teleponOrtu: '081200003333' },
  { id: 's4', nis: '20250004', nama: 'Citra Dewi', tempatLahir: 'Tangerang', tanggalLahir: '2017-11-05', jenisKelamin: 'P', agama: 'Kristen', alamat: 'Jl. Flamboyan No. 20', kelasId: 'k2', namaAyah: 'Joko Dewi', namaIbu: 'Maria Dewi', teleponOrtu: '081200004444' },
  { id: 's5', nis: '20250005', nama: 'Dani Saputra', tempatLahir: 'Bekasi', tanggalLahir: '2016-07-18', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Kamboja No. 9', kelasId: 'k3', namaAyah: 'Udin Saputra', namaIbu: 'Nur Hasanah', teleponOrtu: '081200005555' },
  { id: 's6', nis: '20250006', nama: 'Eka Putri', tempatLahir: 'Jakarta', tanggalLahir: '2016-01-25', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Teratai No. 11', kelasId: 'k3', namaAyah: 'Bambang Eko', namaIbu: 'Sri Mulyani', teleponOrtu: '081200006666' },
  { id: 's7', nis: '20250007', nama: 'Fajar Nugroho', tempatLahir: 'Semarang', tanggalLahir: '2015-04-30', jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Sakura No. 4', kelasId: 'k4', namaAyah: 'Surya Nugroho', namaIbu: 'Dewi Nugroho', teleponOrtu: '081200007777' },
  { id: 's8', nis: '20250008', nama: 'Gina Rahmawati', tempatLahir: 'Yogyakarta', tanggalLahir: '2015-09-14', jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Bougenville No. 16', kelasId: 'k4', namaAyah: 'Agus Rahman', namaIbu: 'Fitri Rahmawati', teleponOrtu: '081200008888' },
];

export const mockPengajaran: PengajaranGuru[] = [
  { id: 'pg1', guruId: 'g1', kelasId: 'k1', mataPelajaranId: 'mp1', semesterId: 'sm2' },
  { id: 'pg2', guruId: 'g1', kelasId: 'k1', mataPelajaranId: 'mp2', semesterId: 'sm2' },
  { id: 'pg3', guruId: 'g1', kelasId: 'k3', mataPelajaranId: 'mp3', semesterId: 'sm2' },
  { id: 'pg4', guruId: 'g2', kelasId: 'k2', mataPelajaranId: 'mp1', semesterId: 'sm2' },
  { id: 'pg5', guruId: 'g2', kelasId: 'k2', mataPelajaranId: 'mp4', semesterId: 'sm2' },
  { id: 'pg6', guruId: 'g2', kelasId: 'k5', mataPelajaranId: 'mp2', semesterId: 'sm2' },
  { id: 'pg7', guruId: 'g3', kelasId: 'k4', mataPelajaranId: 'mp3', semesterId: 'sm2' },
  { id: 'pg8', guruId: 'g3', kelasId: 'k6', mataPelajaranId: 'mp5', semesterId: 'sm2' },
];

export const mockAbsensi: Absensi[] = [];

export const mockNilai: Nilai[] = [];

// Helper to get/set data from localStorage with fallback to mock
export function getData<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

export function setData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
