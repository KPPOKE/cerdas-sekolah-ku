import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, KeyRound, Search, Inbox, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import type { Guru, Siswa, Kelas } from '@/types';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// --- Collapsible Section Component ---
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 font-semibold text-sm bg-muted/50 hover:bg-muted transition-colors rounded-t-lg" onClick={() => setOpen(!open)}>
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// --- Guru Empty Form ---
const emptyGuruForm = (): Record<string, string> => ({
  nama: '', nip: '', pangkatGolongan: '', tempatLahir: '', tanggalLahir: '', nik: '',
  pegId: '', npk: '', nuptk: '',
  alamatJalan: '', alamatKelurahan: '', alamatKecamatan: '', alamatKabKota: '',
  statusPegawai: '', npsn: '', nsm: '', madrasahTempatTugas: 'MI Al-Haq Jakarta',
  kecamatanTugas: 'Jatinegara', sukuDinasPendidikan: 'Sudin Pendidikan Jakarta Timur',
  pendidikanTerakhir: '', bidangStudiPendidikan: '', mapelDiampu: '',
  statusSertifikasi: '', bidangStudiSertifikasi: '', nomorPesertaSertifikasi: '',
  nomorSertifikatPendidik: '', sertifikasiKedua: '',
  noHandphone: '', email: '', keterangan: '',
});

// --- Siswa Empty Form ---
const emptySiswaForm = (): Record<string, string> => ({
  kelasId: '', namaLengkap: '', nisn: '', nik: '', tempatLahir: '', tanggalLahir: '',
  umur: '', status: 'Aktif', jenisKelamin: '', alamat: '', noTelepon: '',
  kebutuhanKhusus: '', disabilitas: '', nomorKipPip: '',
  namaAyahKandung: '', namaIbuKandung: '', namaWali: '',
});

export default function UserManagement() {
  const { data: guruList, loading: loadGuru, refetch: refetchGuru } = useApiData<Guru>('/guru');
  const { data: siswaList, loading: loadSiswa, refetch: refetchSiswa } = useApiData<Siswa>('/siswa');
  const { data: kelasList } = useApiData<Kelas>('/kelas');
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [guruSearch, setGuruSearch] = useState('');
  const [siswaSearch, setSiswaSearch] = useState('');

  // Guru Dialog
  const [guruDialog, setGuruDialog] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [guruForm, setGuruForm] = useState(emptyGuruForm());

  // Siswa Dialog
  const [siswaDialog, setSiswaDialog] = useState(false);
  const [editSiswa, setEditSiswa] = useState<Siswa | null>(null);
  const [siswaForm, setSiswaForm] = useState(emptySiswaForm());

  const openAddGuru = () => { setEditGuru(null); setGuruForm(emptyGuruForm()); setGuruDialog(true); };
  const openEditGuru = (g: Guru) => {
    setEditGuru(g);
    const f = emptyGuruForm();
    for (const key of Object.keys(f)) {
      f[key] = (g as any)[key] ?? '';
    }
    setGuruForm(f);
    setGuruDialog(true);
  };

  const openAddSiswa = () => { setEditSiswa(null); setSiswaForm(emptySiswaForm()); setSiswaDialog(true); };
  const openEditSiswa = (s: Siswa) => {
    setEditSiswa(s);
    const f = emptySiswaForm();
    for (const key of Object.keys(f)) {
      f[key] = (s as any)[key] ?? '';
    }
    setSiswaForm(f);
    setSiswaDialog(true);
  };

  // --- Guru CRUD ---
  const saveGuru = async () => {
    setSaving(true);
    try {
      if (editGuru) {
        await api.put(`/guru/${editGuru.id}`, guruForm);
        toast({ title: 'Berhasil', description: 'Data guru berhasil diperbarui' });
      } else {
        const res = await api.post('/guru', guruForm);
        const acct = res.data?.account;
        const msg = acct ? `Username: ${acct.username}, Password: ${acct.defaultPassword}` : 'Guru berhasil ditambahkan';
        toast({ title: 'Berhasil', description: msg });
      }
      setGuruDialog(false);
      refetchGuru();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan data guru';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const deleteGuru = async (id: string) => {
    try {
      await api.delete(`/guru/${id}`);
      toast({ title: 'Berhasil', description: 'Data guru berhasil dihapus' });
      refetchGuru();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal menghapus', variant: 'destructive' });
    }
  };

  const resetPasswordGuru = async (id: string) => {
    try {
      await api.post(`/guru/${id}/reset-password`);
      toast({ title: 'Berhasil', description: 'Password guru berhasil direset ke default' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal mereset password', variant: 'destructive' });
    }
  };

  // --- Siswa CRUD ---
  const saveSiswa = async () => {
    setSaving(true);
    try {
      if (editSiswa) {
        await api.put(`/siswa/${editSiswa.id}`, siswaForm);
        toast({ title: 'Berhasil', description: 'Data siswa berhasil diperbarui' });
      } else {
        await api.post('/siswa', siswaForm);
        toast({ title: 'Berhasil', description: 'Siswa berhasil ditambahkan' });
      }
      setSiswaDialog(false);
      refetchSiswa();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal menyimpan data siswa', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const deleteSiswa = async (id: string) => {
    try {
      await api.delete(`/siswa/${id}`);
      toast({ title: 'Berhasil', description: 'Data siswa berhasil dihapus' });
      refetchSiswa();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal menghapus', variant: 'destructive' });
    }
  };

  // --- Filtering ---
  const filteredGuru = guruList.filter(g => {
    const q = guruSearch.toLowerCase();
    return !q || g.nama.toLowerCase().includes(q) || g.nik.toLowerCase().includes(q) || (g.nip && g.nip.toLowerCase().includes(q));
  });

  const filteredSiswa = siswaList.filter(s => {
    const q = siswaSearch.toLowerCase();
    return !q || s.namaLengkap.toLowerCase().includes(q) || (s.nisn && s.nisn.toLowerCase().includes(q));
  });

  // --- Helper ---
  const gf = (key: string, val: string) => setGuruForm({ ...guruForm, [key]: val });
  const sf = (key: string, val: string) => setSiswaForm({ ...siswaForm, [key]: val });
  const kelasName = (id: string) => kelasList.find(k => k.id === id)?.namaKelas || '-';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola data guru dan siswa</p>
      </div>

      <Tabs defaultValue="guru">
        <TabsList>
          <TabsTrigger value="guru">Data Guru</TabsTrigger>
          <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
        </TabsList>

        {/* ===== GURU TAB ===== */}
        <TabsContent value="guru">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <CardTitle className="font-heading text-lg">Data Guru / Tenaga Pendidik</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari nama, NIK, NIP..." className="pl-8 w-full sm:w-64" value={guruSearch} onChange={e => setGuruSearch(e.target.value)} />
                </div>
                <Button size="sm" onClick={openAddGuru}><Plus className="h-4 w-4 mr-1" />Tambah Guru</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadGuru ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : filteredGuru.length === 0 ? <EmptyState message="Belum ada data guru" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NIK</TableHead>
                        <TableHead className="hidden lg:table-cell">NIP</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden sm:table-cell">HP</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuru.map(g => (
                        <TableRow key={g.id}>
                          <TableCell className="font-medium">{g.nama}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs font-mono">{g.nik}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs font-mono">{g.nip || '-'}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs">{g.statusPegawai}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs">{g.noHandphone || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditGuru(g)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => resetPasswordGuru(g.id)} title="Reset Password"><KeyRound className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteGuru(g.id)} className="text-destructive" title="Hapus"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SISWA TAB ===== */}
        <TabsContent value="siswa">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <CardTitle className="font-heading text-lg">Data Siswa</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari nama, NISN..." className="pl-8 w-full sm:w-64" value={siswaSearch} onChange={e => setSiswaSearch(e.target.value)} />
                </div>
                <Button size="sm" onClick={openAddSiswa}><Plus className="h-4 w-4 mr-1" />Tambah Siswa</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadSiswa ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : filteredSiswa.length === 0 ? <EmptyState message="Belum ada data siswa" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="hidden sm:table-cell">JK</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSiswa.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.namaLengkap}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs font-mono">{s.nisn || '-'}</TableCell>
                          <TableCell className="text-xs">{kelasName(s.kelasId)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs">{s.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs">{s.status}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditSiswa(s)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSiswa(s.id)} className="text-destructive" title="Hapus"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== GURU DIALOG ===== */}
      <Dialog open={guruDialog} onOpenChange={setGuruDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">{editGuru ? 'Edit' : 'Tambah'} Data Guru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Data Pribadi */}
            <Section title="Data Pribadi" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nama Lengkap *</Label><Input value={guruForm.nama} onChange={e => gf('nama', e.target.value)} /></div>
                <div className="space-y-2"><Label>NIK *</Label><Input value={guruForm.nik} onChange={e => gf('nik', e.target.value)} /></div>
                <div className="space-y-2"><Label>Tempat Lahir *</Label><Input value={guruForm.tempatLahir} onChange={e => gf('tempatLahir', e.target.value)} /></div>
                <div className="space-y-2"><Label>Tanggal Lahir *</Label><Input type="date" value={guruForm.tanggalLahir} onChange={e => gf('tanggalLahir', e.target.value)} /></div>
              </div>
            </Section>

            {/* Data Kepegawaian */}
            <Section title="Data Kepegawaian" defaultOpen={!editGuru}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>NIP</Label><Input value={guruForm.nip} onChange={e => gf('nip', e.target.value)} /></div>
                <div className="space-y-2"><Label>Pangkat/Golongan</Label><Input value={guruForm.pangkatGolongan} onChange={e => gf('pangkatGolongan', e.target.value)} /></div>
                <div className="space-y-2"><Label>Peg ID</Label><Input value={guruForm.pegId} onChange={e => gf('pegId', e.target.value)} /></div>
                <div className="space-y-2"><Label>NPK</Label><Input value={guruForm.npk} onChange={e => gf('npk', e.target.value)} /></div>
                <div className="space-y-2"><Label>NUPTK</Label><Input value={guruForm.nuptk} onChange={e => gf('nuptk', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Status Pegawai *</Label>
                  <Select value={guruForm.statusPegawai} onValueChange={v => gf('statusPegawai', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PNS">PNS</SelectItem>
                      <SelectItem value="GTY">GTY</SelectItem>
                      <SelectItem value="GTT">GTT</SelectItem>
                      <SelectItem value="Honorer">Honorer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>NPSN</Label><Input value={guruForm.npsn} onChange={e => gf('npsn', e.target.value)} /></div>
                <div className="space-y-2"><Label>NSM</Label><Input value={guruForm.nsm} onChange={e => gf('nsm', e.target.value)} /></div>
                <div className="space-y-2"><Label>Madrasah Tempat Tugas *</Label><Input value={guruForm.madrasahTempatTugas} onChange={e => gf('madrasahTempatTugas', e.target.value)} /></div>
                <div className="space-y-2"><Label>Kecamatan Tugas *</Label><Input value={guruForm.kecamatanTugas} onChange={e => gf('kecamatanTugas', e.target.value)} /></div>
                <div className="space-y-2"><Label>Suku Dinas Pendidikan *</Label><Input value={guruForm.sukuDinasPendidikan} onChange={e => gf('sukuDinasPendidikan', e.target.value)} /></div>
              </div>
            </Section>

            {/* Alamat */}
            <Section title="Alamat">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2"><Label>Alamat Jalan *</Label><Input value={guruForm.alamatJalan} onChange={e => gf('alamatJalan', e.target.value)} /></div>
                <div className="space-y-2"><Label>Kelurahan *</Label><Input value={guruForm.alamatKelurahan} onChange={e => gf('alamatKelurahan', e.target.value)} /></div>
                <div className="space-y-2"><Label>Kecamatan *</Label><Input value={guruForm.alamatKecamatan} onChange={e => gf('alamatKecamatan', e.target.value)} /></div>
                <div className="space-y-2"><Label>Kab/Kota *</Label><Input value={guruForm.alamatKabKota} onChange={e => gf('alamatKabKota', e.target.value)} /></div>
              </div>
            </Section>

            {/* Pendidikan & Sertifikasi */}
            <Section title="Pendidikan & Sertifikasi">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pendidikan Terakhir *</Label>
                  <Select value={guruForm.pendidikanTerakhir} onValueChange={v => gf('pendidikanTerakhir', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMA/MA">SMA/MA</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Bidang Studi Pendidikan</Label><Input value={guruForm.bidangStudiPendidikan} onChange={e => gf('bidangStudiPendidikan', e.target.value)} /></div>
                <div className="space-y-2"><Label>Mapel Diampu</Label><Input value={guruForm.mapelDiampu} onChange={e => gf('mapelDiampu', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Status Sertifikasi</Label>
                  <Select value={guruForm.statusSertifikasi} onValueChange={v => gf('statusSertifikasi', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sudah">Sudah</SelectItem>
                      <SelectItem value="Belum">Belum</SelectItem>
                      <SelectItem value="Proses">Proses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Bidang Studi Sertifikasi</Label><Input value={guruForm.bidangStudiSertifikasi} onChange={e => gf('bidangStudiSertifikasi', e.target.value)} /></div>
                <div className="space-y-2"><Label>No. Peserta Sertifikasi</Label><Input value={guruForm.nomorPesertaSertifikasi} onChange={e => gf('nomorPesertaSertifikasi', e.target.value)} /></div>
                <div className="space-y-2"><Label>No. Sertifikat Pendidik</Label><Input value={guruForm.nomorSertifikatPendidik} onChange={e => gf('nomorSertifikatPendidik', e.target.value)} /></div>
                <div className="space-y-2"><Label>Sertifikasi Kedua</Label><Input value={guruForm.sertifikasiKedua} onChange={e => gf('sertifikasiKedua', e.target.value)} /></div>
              </div>
            </Section>

            {/* Kontak & Keterangan */}
            <Section title="Kontak & Keterangan">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>No. Handphone</Label><Input value={guruForm.noHandphone} onChange={e => gf('noHandphone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={guruForm.email} onChange={e => gf('email', e.target.value)} /></div>
                <div className="md:col-span-2 space-y-2"><Label>Keterangan</Label><Input value={guruForm.keterangan} onChange={e => gf('keterangan', e.target.value)} /></div>
              </div>
            </Section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuruDialog(false)}>Batal</Button>
            <Button onClick={saveGuru} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== SISWA DIALOG ===== */}
      <Dialog open={siswaDialog} onOpenChange={setSiswaDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">{editSiswa ? 'Edit' : 'Tambah'} Data Siswa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Section title="Data Pribadi" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nama Lengkap *</Label><Input value={siswaForm.namaLengkap} onChange={e => sf('namaLengkap', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Kelas *</Label>
                  <Select value={siswaForm.kelasId} onValueChange={v => sf('kelasId', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                    <SelectContent>{kelasList.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>NISN</Label><Input value={siswaForm.nisn} onChange={e => sf('nisn', e.target.value)} /></div>
                <div className="space-y-2"><Label>NIK</Label><Input value={siswaForm.nik} onChange={e => sf('nik', e.target.value)} /></div>
                <div className="space-y-2"><Label>Tempat Lahir *</Label><Input value={siswaForm.tempatLahir} onChange={e => sf('tempatLahir', e.target.value)} /></div>
                <div className="space-y-2"><Label>Tanggal Lahir *</Label><Input type="date" value={siswaForm.tanggalLahir} onChange={e => sf('tanggalLahir', e.target.value)} /></div>
                <div className="space-y-2"><Label>Umur</Label><Input placeholder="cth: 7 th, 10 bln" value={siswaForm.umur} onChange={e => sf('umur', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin *</Label>
                  <Select value={siswaForm.jenisKelamin} onValueChange={v => sf('jenisKelamin', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={siswaForm.status} onValueChange={v => sf('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Pindah">Pindah</SelectItem>
                      <SelectItem value="Keluar">Keluar</SelectItem>
                      <SelectItem value="Lulus">Lulus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2"><Label>Alamat *</Label><Input value={siswaForm.alamat} onChange={e => sf('alamat', e.target.value)} /></div>
                <div className="space-y-2"><Label>No. Telepon</Label><Input value={siswaForm.noTelepon} onChange={e => sf('noTelepon', e.target.value)} /></div>
              </div>
            </Section>

            <Section title="Data Khusus & KIP">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Kebutuhan Khusus</Label><Input value={siswaForm.kebutuhanKhusus} onChange={e => sf('kebutuhanKhusus', e.target.value)} /></div>
                <div className="space-y-2"><Label>Disabilitas</Label><Input value={siswaForm.disabilitas} onChange={e => sf('disabilitas', e.target.value)} /></div>
                <div className="space-y-2"><Label>Nomor KIP/PIP</Label><Input value={siswaForm.nomorKipPip} onChange={e => sf('nomorKipPip', e.target.value)} /></div>
              </div>
            </Section>

            <Section title="Data Orang Tua / Wali">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nama Ayah Kandung</Label><Input value={siswaForm.namaAyahKandung} onChange={e => sf('namaAyahKandung', e.target.value)} /></div>
                <div className="space-y-2"><Label>Nama Ibu Kandung</Label><Input value={siswaForm.namaIbuKandung} onChange={e => sf('namaIbuKandung', e.target.value)} /></div>
                <div className="space-y-2"><Label>Nama Wali</Label><Input value={siswaForm.namaWali} onChange={e => sf('namaWali', e.target.value)} /></div>
              </div>
            </Section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSiswaDialog(false)}>Batal</Button>
            <Button onClick={saveSiswa} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
