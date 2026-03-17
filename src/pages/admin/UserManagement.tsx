import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Users, Inbox, Loader2 } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { generateId, setData } from '@/lib/mock-data';
import type { Guru, Siswa, Kelas } from '@/types';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function UserManagement() {
  const { data: guruData, loading: loadG } = useApiData<Guru>('/guru');
  const { data: siswaData, loading: loadS } = useApiData<Siswa>('/siswa');
  const { data: kelas } = useApiData<Kelas>('/kelas');
  
  const isLoading = loadG || loadS;

  const [guru, setGuru] = useState(() => [] as Guru[]);
  const [siswa, setSiswa] = useState(() => [] as Siswa[]);
  
  // Sync API data to local state
  if (guruData.length > 0 && guru.length === 0) setGuru(guruData);
  if (siswaData.length > 0 && siswa.length === 0) setSiswa(siswaData);

  const [searchGuru, setSearchGuru] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');

  // Guru dialog
  const [guruDialog, setGuruDialog] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [guruForm, setGuruForm] = useState({ nip: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L' as 'L' | 'P', agama: '', alamat: '', telepon: '', email: '', pendidikan: '' });

  // Siswa dialog
  const [siswaDialog, setSiswaDialog] = useState(false);
  const [editSiswa, setEditSiswa] = useState<Siswa | null>(null);
  const [siswaForm, setSiswaForm] = useState({ nis: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L' as 'L' | 'P', agama: '', alamat: '', kelasId: '', namaAyah: '', namaIbu: '', teleponOrtu: '' });

  const openAddGuru = () => {
    setEditGuru(null);
    setGuruForm({ nip: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L', agama: '', alamat: '', telepon: '', email: '', pendidikan: '' });
    setGuruDialog(true);
  };

  const openEditGuru = (g: Guru) => {
    setEditGuru(g);
    setGuruForm({ nip: g.nip, nama: g.nama, tempatLahir: g.tempatLahir, tanggalLahir: g.tanggalLahir, jenisKelamin: g.jenisKelamin, agama: g.agama, alamat: g.alamat, telepon: g.telepon, email: g.email, pendidikan: g.pendidikan });
    setGuruDialog(true);
  };

  const saveGuru = () => {
    let updated: Guru[];
    if (editGuru) {
      updated = guru.map(g => g.id === editGuru.id ? { ...g, ...guruForm } : g);
    } else {
      updated = [...guru, { id: generateId(), ...guruForm }];
    }
    setGuru(updated);
    setData('guru', updated);
    setGuruDialog(false);
  };

  const deleteGuru = (id: string) => {
    const updated = guru.filter(g => g.id !== id);
    setGuru(updated);
    setData('guru', updated);
  };

  const openAddSiswa = () => {
    setEditSiswa(null);
    setSiswaForm({ nis: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L', agama: '', alamat: '', kelasId: '', namaAyah: '', namaIbu: '', teleponOrtu: '' });
    setSiswaDialog(true);
  };

  const openEditSiswa = (s: Siswa) => {
    setEditSiswa(s);
    setSiswaForm({ nis: s.nis, nama: s.nama, tempatLahir: s.tempatLahir, tanggalLahir: s.tanggalLahir, jenisKelamin: s.jenisKelamin, agama: s.agama, alamat: s.alamat, kelasId: s.kelasId, namaAyah: s.namaAyah, namaIbu: s.namaIbu, teleponOrtu: s.teleponOrtu });
    setSiswaDialog(true);
  };

  const saveSiswa = () => {
    let updated: Siswa[];
    if (editSiswa) {
      updated = siswa.map(s => s.id === editSiswa.id ? { ...s, ...siswaForm } : s);
    } else {
      updated = [...siswa, { id: generateId(), ...siswaForm }];
    }
    setSiswa(updated);
    setData('siswa', updated);
    setSiswaDialog(false);
  };

  const deleteSiswa = (id: string) => {
    const updated = siswa.filter(s => s.id !== id);
    setSiswa(updated);
    setData('siswa', updated);
  };

  const filteredGuru = guru.filter(g => g.nama.toLowerCase().includes(searchGuru.toLowerCase()) || g.nip.includes(searchGuru));
  const filteredSiswa = siswa.filter(s => s.nama.toLowerCase().includes(searchSiswa.toLowerCase()) || s.nis.includes(searchSiswa));

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

        {/* GURU TAB */}
        <TabsContent value="guru">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Daftar Guru</CardTitle>
              <Button size="sm" onClick={openAddGuru}><Plus className="h-4 w-4 mr-1" />Tambah Guru</Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari nama atau NIP..." className="pl-9" value={searchGuru} onChange={e => setSearchGuru(e.target.value)} />
              </div>
              {filteredGuru.length === 0 ? <EmptyState message="Belum ada data guru" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIP</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Telepon</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuru.map(g => (
                        <TableRow key={g.id}>
                          <TableCell className="font-mono text-xs">{g.nip}</TableCell>
                          <TableCell className="font-medium">{g.nama}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{g.email}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{g.telepon}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditGuru(g)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteGuru(g.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

        {/* SISWA TAB */}
        <TabsContent value="siswa">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Daftar Siswa</CardTitle>
              <Button size="sm" onClick={openAddSiswa}><Plus className="h-4 w-4 mr-1" />Tambah Siswa</Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari nama atau NIS..." className="pl-9" value={searchSiswa} onChange={e => setSearchSiswa(e.target.value)} />
              </div>
              {filteredSiswa.length === 0 ? <EmptyState message="Belum ada data siswa" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Kelas</TableHead>
                        <TableHead className="hidden sm:table-cell">JK</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSiswa.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                          <TableCell className="font-medium">{s.nama}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{kelas.find(k => k.id === s.kelasId)?.nama || '-'}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditSiswa(s)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSiswa(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

      {/* GURU DIALOG */}
      <Dialog open={guruDialog} onOpenChange={setGuruDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editGuru ? 'Edit Guru' : 'Tambah Guru'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>NIP</Label><Input value={guruForm.nip} onChange={e => setGuruForm({ ...guruForm, nip: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={guruForm.nama} onChange={e => setGuruForm({ ...guruForm, nama: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tempat Lahir</Label><Input value={guruForm.tempatLahir} onChange={e => setGuruForm({ ...guruForm, tempatLahir: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tanggal Lahir</Label><Input type="date" value={guruForm.tanggalLahir} onChange={e => setGuruForm({ ...guruForm, tanggalLahir: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={guruForm.jenisKelamin} onValueChange={v => setGuruForm({ ...guruForm, jenisKelamin: v as 'L' | 'P' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Agama</Label><Input value={guruForm.agama} onChange={e => setGuruForm({ ...guruForm, agama: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Alamat</Label><Input value={guruForm.alamat} onChange={e => setGuruForm({ ...guruForm, alamat: e.target.value })} /></div>
            <div className="space-y-2"><Label>Telepon</Label><Input value={guruForm.telepon} onChange={e => setGuruForm({ ...guruForm, telepon: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={guruForm.email} onChange={e => setGuruForm({ ...guruForm, email: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Pendidikan Terakhir</Label><Input value={guruForm.pendidikan} onChange={e => setGuruForm({ ...guruForm, pendidikan: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuruDialog(false)}>Batal</Button>
            <Button onClick={saveGuru}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SISWA DIALOG */}
      <Dialog open={siswaDialog} onOpenChange={setSiswaDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editSiswa ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>NIS</Label><Input value={siswaForm.nis} onChange={e => setSiswaForm({ ...siswaForm, nis: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={siswaForm.nama} onChange={e => setSiswaForm({ ...siswaForm, nama: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tempat Lahir</Label><Input value={siswaForm.tempatLahir} onChange={e => setSiswaForm({ ...siswaForm, tempatLahir: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tanggal Lahir</Label><Input type="date" value={siswaForm.tanggalLahir} onChange={e => setSiswaForm({ ...siswaForm, tanggalLahir: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={siswaForm.jenisKelamin} onValueChange={v => setSiswaForm({ ...siswaForm, jenisKelamin: v as 'L' | 'P' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Agama</Label><Input value={siswaForm.agama} onChange={e => setSiswaForm({ ...siswaForm, agama: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Alamat</Label><Input value={siswaForm.alamat} onChange={e => setSiswaForm({ ...siswaForm, alamat: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={siswaForm.kelasId} onValueChange={v => setSiswaForm({ ...siswaForm, kelasId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nama Ayah</Label><Input value={siswaForm.namaAyah} onChange={e => setSiswaForm({ ...siswaForm, namaAyah: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nama Ibu</Label><Input value={siswaForm.namaIbu} onChange={e => setSiswaForm({ ...siswaForm, namaIbu: e.target.value })} /></div>
            <div className="space-y-2"><Label>Telepon Orang Tua</Label><Input value={siswaForm.teleponOrtu} onChange={e => setSiswaForm({ ...siswaForm, teleponOrtu: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSiswaDialog(false)}>Batal</Button>
            <Button onClick={saveSiswa}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
