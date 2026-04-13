import type { User, Siswa, Guru, Kelas, TahunAjaran, Semester, MataPelajaran, PengajaranGuru, Absensi, Nilai } from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', nama: 'Administrator', role: 'admin', email: 'admin@mialhaqqjakarta.sch.id' },
  { id: 'u2', username: '3175014501850001', nama: 'Siti Aminah, S.Pd.I', role: 'guru', email: 'siti.aminah@mialhaqqjakarta.sch.id' },
  { id: 'u3', username: '3175021503870002', nama: 'Budi Santoso, S.Pd', role: 'guru', email: 'budi.santoso@mialhaqqjakarta.sch.id' },
];

export const mockTahunAjaran: TahunAjaran[] = [
  { id: 'ta1', nama: '2025/2026', mulai: '2025-07-14', selesai: '2026-06-20', aktif: true },
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
  { id: 'mp6', kode: 'AGM', nama: 'Pendidikan Agama Islam', deskripsi: 'Pelajaran Agama Islam' },
];

export const mockKelas: Kelas[] = [
  { id: 'k1a', tingkat: 1, namaKelas: '1A', guruId: 'g1' },
  { id: 'k1b', tingkat: 1, namaKelas: '1B', guruId: 'g2' },
  { id: 'k2a', tingkat: 2, namaKelas: '2A', guruId: 'g3' },
  { id: 'k2b', tingkat: 2, namaKelas: '2B', guruId: null },
  { id: 'k3a', tingkat: 3, namaKelas: '3A', guruId: null },
  { id: 'k3b', tingkat: 3, namaKelas: '3B', guruId: null },
  { id: 'k4a', tingkat: 4, namaKelas: '4A', guruId: null },
  { id: 'k4b', tingkat: 4, namaKelas: '4B', guruId: null },
  { id: 'k5a', tingkat: 5, namaKelas: '5A', guruId: null },
  { id: 'k6a', tingkat: 6, namaKelas: '6A', guruId: null },
];

export const mockGuru: Guru[] = [];

export const mockSiswa: Siswa[] = [];

export const mockPengajaran: PengajaranGuru[] = [
  { id: 'pg1', guruId: 'g1', kelasId: 'k1a', mataPelajaranId: 'mp1', semesterId: 'sm2' },
  { id: 'pg2', guruId: 'g1', kelasId: 'k1a', mataPelajaranId: 'mp2', semesterId: 'sm2' },
  { id: 'pg3', guruId: 'g2', kelasId: 'k1b', mataPelajaranId: 'mp1', semesterId: 'sm2' },
  { id: 'pg4', guruId: 'g2', kelasId: 'k2a', mataPelajaranId: 'mp4', semesterId: 'sm2' },
  { id: 'pg5', guruId: 'g3', kelasId: 'k3a', mataPelajaranId: 'mp3', semesterId: 'sm2' },
  { id: 'pg6', guruId: 'g3', kelasId: 'k5a', mataPelajaranId: 'mp5', semesterId: 'sm2' },
];

export const mockAbsensi: Absensi[] = [];

export const mockNilai: Nilai[] = [];


// Ekstrakurikuler and PPDB data now served from Laravel API (no longer mocked)

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
