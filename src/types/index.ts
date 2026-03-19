export type UserRole = 'admin' | 'guru';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  email: string;
  mustChangePassword?: boolean;
}

export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  agama: string;
  alamat: string;
  kelasId: string;
  namaAyah: string;
  namaIbu: string;
  teleponOrtu: string;
  foto?: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  agama: string;
  alamat: string;
  telepon: string;
  email: string;
  pendidikan: string;
  foto?: string;
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat: number;
  tahunAjaranId: string;
  guruId: string;
}

export interface TahunAjaran {
  id: string;
  nama: string;
  mulai: string;
  selesai: string;
  aktif: boolean;
}

export interface Semester {
  id: string;
  nama: string;
  tahunAjaranId: string;
  aktif: boolean;
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
}

export interface PengajaranGuru {
  id: string;
  guruId: string;
  kelasId: string;
  mataPelajaranId: string;
  semesterId: string;
}

export type StatusKehadiran = 'hadir' | 'alfa' | 'sakit' | 'izin';

export interface Absensi {
  id: string;
  siswaId: string;
  kelasId: string;
  tanggal: string;
  status: StatusKehadiran;
  keterangan?: string;
}

export interface Nilai {
  id: string;
  siswaId: string;
  mataPelajaranId: string;
  kelasId: string;
  semesterId: string;
  tugas: number;
  uts: number;
  uas: number;
  rataRata: number;
}
