import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Inbox, Loader2 } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import type { TahunAjaran, Semester, MataPelajaran, Kelas, Guru, PengajaranGuru } from '@/types';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function AcademicSetup() {
  const { data: tahunAjaran, loading: loadTA, refetch: refetchTA } = useApiData<TahunAjaran>('/tahun-ajaran');
  const { data: semester } = useApiData<Semester>('/semester');
  const { data: mapel, loading: loadMapel, refetch: refetchMapel } = useApiData<MataPelajaran>('/mata-pelajaran');
  const { data: pengajaran, loading: loadPG, refetch: refetchPG } = useApiData<PengajaranGuru>('/pengajaran');
  const { data: kelas } = useApiData<Kelas>('/kelas');
  const { data: guru } = useApiData<Guru>('/guru');
  const { toast } = useToast();

  const isLoading = loadTA || loadMapel || loadPG;
  const [saving, setSaving] = useState(false);

  // TA Dialog
  const [taDialog, setTaDialog] = useState(false);
  const [editTa, setEditTa] = useState<TahunAjaran | null>(null);
  const [taForm, setTaForm] = useState({ nama: '', mulai: '', selesai: '' });

  // Mapel Dialog
  const [mapelDialog, setMapelDialog] = useState(false);
  const [editMapel, setEditMapel] = useState<MataPelajaran | null>(null);
  const [mapelForm, setMapelForm] = useState({ kode: '', nama: '', deskripsi: '' });

  // Pengajaran Dialog
  const [pgDialog, setPgDialog] = useState(false);
  const [pgForm, setPgForm] = useState({ guruId: '', kelasId: '', mataPelajaranId: '', semesterId: '' });

  // ---- Tahun Ajaran CRUD ----
  const saveTa = async () => {
    setSaving(true);
    try {
      if (editTa) {
        await api.put(`/tahun-ajaran/${editTa.id}`, taForm);
        toast({ title: 'Berhasil', description: 'Tahun ajaran berhasil diperbarui' });
      } else {
        await api.post('/tahun-ajaran', taForm);
        toast({ title: 'Berhasil', description: 'Tahun ajaran berhasil ditambahkan' });
      }
      setTaDialog(false);
      refetchTA();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan tahun ajaran';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteTa = async (id: string) => {
    try {
      await api.delete(`/tahun-ajaran/${id}`);
      toast({ title: 'Berhasil', description: 'Tahun ajaran berhasil dihapus' });
      refetchTA();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menghapus tahun ajaran';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const toggleTaAktif = async (id: string) => {
    try {
      await api.put(`/tahun-ajaran/${id}/toggle-aktif`);
      toast({ title: 'Berhasil', description: 'Status tahun ajaran diperbarui' });
      refetchTA();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mengubah status';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  // ---- Mata Pelajaran CRUD ----
  const saveMapel = async () => {
    setSaving(true);
    try {
      if (editMapel) {
        await api.put(`/mata-pelajaran/${editMapel.id}`, mapelForm);
        toast({ title: 'Berhasil', description: 'Mata pelajaran berhasil diperbarui' });
      } else {
        await api.post('/mata-pelajaran', mapelForm);
        toast({ title: 'Berhasil', description: 'Mata pelajaran berhasil ditambahkan' });
      }
      setMapelDialog(false);
      refetchMapel();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan mata pelajaran';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteMapel = async (id: string) => {
    try {
      await api.delete(`/mata-pelajaran/${id}`);
      toast({ title: 'Berhasil', description: 'Mata pelajaran berhasil dihapus' });
      refetchMapel();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menghapus mata pelajaran';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  // ---- Pengajaran Guru CRUD ----
  const savePengajaran = async () => {
    setSaving(true);
    try {
      await api.post('/pengajaran', pgForm);
      toast({ title: 'Berhasil', description: 'Penugasan guru berhasil ditambahkan' });
      setPgDialog(false);
      refetchPG();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan penugasan';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePengajaran = async (id: string) => {
    try {
      await api.delete(`/pengajaran/${id}`);
      toast({ title: 'Berhasil', description: 'Penugasan guru berhasil dihapus' });
      refetchPG();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menghapus penugasan';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Pengaturan Akademik</h1>
        <p className="text-muted-foreground">Kelola tahun ajaran, mata pelajaran, dan penugasan guru</p>
      </div>

      <Tabs defaultValue="tahun-ajaran">
        <TabsList className="flex-wrap">
          <TabsTrigger value="tahun-ajaran">Tahun Ajaran</TabsTrigger>
          <TabsTrigger value="mapel">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="pengajaran">Penugasan Guru</TabsTrigger>
        </TabsList>

        {/* ===== TAHUN AJARAN TAB ===== */}
        <TabsContent value="tahun-ajaran">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Tahun Ajaran & Semester</CardTitle>
              <Button size="sm" onClick={() => { setEditTa(null); setTaForm({ nama: '', mulai: '', selesai: '' }); setTaDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {tahunAjaran.length === 0 ? <EmptyState message="Belum ada tahun ajaran" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Tahun Ajaran</TableHead><TableHead>Mulai</TableHead><TableHead>Selesai</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {tahunAjaran.map(ta => (
                      <TableRow key={ta.id}>
                        <TableCell className="font-medium">{ta.nama}</TableCell>
                        <TableCell className="text-sm">{ta.mulai}</TableCell>
                        <TableCell className="text-sm">{ta.selesai}</TableCell>
                        <TableCell>
                          <Badge variant={ta.aktif ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleTaAktif(ta.id)}>
                            {ta.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditTa(ta); setTaForm({ nama: ta.nama, mulai: ta.mulai, selesai: ta.selesai }); setTaDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteTa(ta.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MATA PELAJARAN TAB ===== */}
        <TabsContent value="mapel">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Mata Pelajaran</CardTitle>
              <Button size="sm" onClick={() => { setEditMapel(null); setMapelForm({ kode: '', nama: '', deskripsi: '' }); setMapelDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {mapel.length === 0 ? <EmptyState message="Belum ada mata pelajaran" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead className="hidden sm:table-cell">Deskripsi</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {mapel.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-xs">{m.kode}</TableCell>
                        <TableCell className="font-medium">{m.nama}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{m.deskripsi}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditMapel(m); setMapelForm({ kode: m.kode, nama: m.nama, deskripsi: m.deskripsi }); setMapelDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMapel(m.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PENUGASAN GURU TAB ===== */}
        <TabsContent value="pengajaran">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Penugasan Guru ke Kelas</CardTitle>
              <Button size="sm" onClick={() => { setPgForm({ guruId: '', kelasId: '', mataPelajaranId: '', semesterId: semester.find(s => s.aktif)?.id || '' }); setPgDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {pengajaran.length === 0 ? <EmptyState message="Belum ada penugasan" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Guru</TableHead><TableHead>Kelas</TableHead><TableHead className="hidden sm:table-cell">Mata Pelajaran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pengajaran.map(pg => (
                      <TableRow key={pg.id}>
                        <TableCell className="font-medium">{guru.find(g => g.id === pg.guruId)?.nama || '-'}</TableCell>
                        <TableCell>{kelas.find(k => k.id === pg.kelasId)?.namaKelas || '-'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{mapel.find(m => m.id === pg.mataPelajaranId)?.nama || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => deletePengajaran(pg.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== TA DIALOG ===== */}
      <Dialog open={taDialog} onOpenChange={setTaDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">{editTa ? 'Edit' : 'Tambah'} Tahun Ajaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama</Label><Input placeholder="Contoh: 2025/2026" value={taForm.nama} onChange={e => setTaForm({ ...taForm, nama: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Mulai</Label><Input type="date" value={taForm.mulai} onChange={e => setTaForm({ ...taForm, mulai: e.target.value })} /></div>
              <div className="space-y-2"><Label>Selesai</Label><Input type="date" value={taForm.selesai} onChange={e => setTaForm({ ...taForm, selesai: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaDialog(false)}>Batal</Button>
            <Button onClick={saveTa} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== MAPEL DIALOG ===== */}
      <Dialog open={mapelDialog} onOpenChange={setMapelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">{editMapel ? 'Edit' : 'Tambah'} Mata Pelajaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Kode</Label><Input placeholder="Contoh: MTK" value={mapelForm.kode} onChange={e => setMapelForm({ ...mapelForm, kode: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nama</Label><Input placeholder="Contoh: Matematika" value={mapelForm.nama} onChange={e => setMapelForm({ ...mapelForm, nama: e.target.value })} /></div>
            <div className="space-y-2"><Label>Deskripsi</Label><Input value={mapelForm.deskripsi} onChange={e => setMapelForm({ ...mapelForm, deskripsi: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapelDialog(false)}>Batal</Button>
            <Button onClick={saveMapel} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PENGAJARAN DIALOG ===== */}
      <Dialog open={pgDialog} onOpenChange={setPgDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Tambah Penugasan Guru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Guru</Label>
              <Select value={pgForm.guruId} onValueChange={v => setPgForm({ ...pgForm, guruId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                <SelectContent>{guru.map(g => <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={pgForm.kelasId} onValueChange={v => setPgForm({ ...pgForm, kelasId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={pgForm.mataPelajaranId} onValueChange={v => setPgForm({ ...pgForm, mataPelajaranId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                <SelectContent>{mapel.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPgDialog(false)}>Batal</Button>
            <Button onClick={savePengajaran} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
