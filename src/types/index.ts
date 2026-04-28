export type UserRole = 'admin' | 'guru' | 'pelatih';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  email: string;
  mustChangePassword?: boolean;
}

export interface Guru {
  id: string;
  // Identitas
  nama: string;
  nip: string | null;
  pangkatGolongan: string | null;
  nik: string;
  pegId: string | null;
  npk: string | null;
  nuptk: string | null;
  // Pribadi
  tempatLahir: string;
  tanggalLahir: string;
  // Alamat
  alamatJalan: string;
  alamatKelurahan: string;
  alamatKecamatan: string;
  alamatKabKota: string;
  // Kepegawaian
  statusPegawai: string;
  npsn: string | null;
  nsm: string | null;
  madrasahTempatTugas: string;
  kecamatanTugas: string;
  sukuDinasPendidikan: string;
  // Pendidikan
  pendidikanTerakhir: string;
  bidangStudiPendidikan: string | null;
  mapelDiampu: string | null;
  // Sertifikasi
  statusSertifikasi: string | null;
  bidangStudiSertifikasi: string | null;
  nomorPesertaSertifikasi: string | null;
  nomorSertifikatPendidik: string | null;
  sertifikasiKedua: string | null;
  // Kontak
  noHandphone: string | null;
  email: string | null;
  // Lain-lain
  keterangan: string | null;
}

export interface Siswa {
  id: string;
  kelasId: string;
  namaLengkap: string;
  nisn: string | null;
  nik: string | null;
  tempatLahir: string;
  tanggalLahir: string;
  umur: string | null;
  status: string;
  jenisKelamin: string;
  alamat: string;
  noTelepon: string | null;
  kebutuhanKhusus: string | null;
  disabilitas: string | null;
  nomorKipPip: string | null;
  namaAyahKandung: string | null;
  namaIbuKandung: string | null;
  namaWali: string | null;
}

export interface Kelas {
  id: string;
  tingkat: number;
  namaKelas: string;
  guruId: string | null;
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

export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Ekstrakurikuler {
  id: string;
  nama: string;
  hari: Hari;
  guruId: string | null;
  deskripsi?: string;
}

export interface PesertaEkstrakurikuler {
  id: string;
  ekstrakurikulerId: string;
  siswaId: string;
  tanggalDaftar: string;
}

export interface AbsensiEkstrakurikuler {
  id: string;
  ekstrakurikulerId: string;
  siswaId: string;
  tanggal: string;
  status: StatusKehadiran;
  keterangan?: string;
}

export type StatusPPDB = 'pending' | 'diterima' | 'ditolak';

export interface PendaftarPPDB {
  id: string;
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  namaAyah: string;
  namaIbu: string;
  pekerjaanAyah?: string | null;
  pekerjaanIbu?: string | null;
  noWa: string;
  alamat: string;
  status: StatusPPDB;
  berkasPasFoto?: string | null;
  berkasKk?: string | null;
  berkasAktaKelahiran?: string | null;
  createdAt: string;
}
