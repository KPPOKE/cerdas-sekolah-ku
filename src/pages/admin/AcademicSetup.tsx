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
import { generateId, setData } from '@/lib/mock-data';
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
  const { data: tahunAjaranData, loading: loadTA } = useApiData<TahunAjaran>('/tahun-ajaran');
  const { data: semesterData, loading: loadSem } = useApiData<Semester>('/semester');
  const { data: mapelData, loading: loadMapel } = useApiData<MataPelajaran>('/mata-pelajaran');
  const { data: pengajaranData, loading: loadPG } = useApiData<PengajaranGuru>('/pengajaran');
  const { data: kelas } = useApiData<Kelas>('/kelas');
  const { data: guru } = useApiData<Guru>('/guru');
  
  const isLoading = loadTA || loadSem || loadMapel || loadPG;

  const [tahunAjaran, setTahunAjaran] = useState(() => [] as TahunAjaran[]);
  const [semester, setSemester] = useState(() => [] as Semester[]);
  const [mapel, setMapel] = useState(() => [] as MataPelajaran[]);
  const [pengajaran, setPengajaran] = useState(() => [] as PengajaranGuru[]);

  // Sync API data to local state
  useState(() => {});
  if (tahunAjaranData.length > 0 && tahunAjaran.length === 0) setTahunAjaran(tahunAjaranData);
  if (semesterData.length > 0 && semester.length === 0) setSemester(semesterData);
  if (mapelData.length > 0 && mapel.length === 0) setMapel(mapelData);
  if (pengajaranData.length > 0 && pengajaran.length === 0) setPengajaran(pengajaranData);

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

  const saveTa = () => {
    let updated: TahunAjaran[];
    if (editTa) {
      updated = tahunAjaran.map(t => t.id === editTa.id ? { ...t, ...taForm } : t);
    } else {
      updated = [...tahunAjaran, { id: generateId(), ...taForm, aktif: false }];
    }
    setTahunAjaran(updated);
    setData('tahunAjaran', updated);
    setTaDialog(false);
  };

  const deleteTa = (id: string) => {
    const updated = tahunAjaran.filter(t => t.id !== id);
    setTahunAjaran(updated);
    setData('tahunAjaran', updated);
  };

  const toggleTaAktif = (id: string) => {
    const updated = tahunAjaran.map(t => ({ ...t, aktif: t.id === id }));
    setTahunAjaran(updated);
    setData('tahunAjaran', updated);
  };

  const saveMapel = () => {
    let updated: MataPelajaran[];
    if (editMapel) {
      updated = mapel.map(m => m.id === editMapel.id ? { ...m, ...mapelForm } : m);
    } else {
      updated = [...mapel, { id: generateId(), ...mapelForm }];
    }
    setMapel(updated);
    setData('mapel', updated);
    setMapelDialog(false);
  };

  const deleteMapel = (id: string) => {
    const updated = mapel.filter(m => m.id !== id);
    setMapel(updated);
    setData('mapel', updated);
  };

  const savePengajaran = () => {
    const updated = [...pengajaran, { id: generateId(), ...pgForm }];
    setPengajaran(updated);
    setData('pengajaran', updated);
    setPgDialog(false);
  };

  const deletePengajaran = (id: string) => {
    const updated = pengajaran.filter(p => p.id !== id);
    setPengajaran(updated);
    setData('pengajaran', updated);
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
                        <TableCell>{kelas.find(k => k.id === pg.kelasId)?.nama || '-'}</TableCell>
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

      {/* TA Dialog */}
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
          <DialogFooter><Button variant="outline" onClick={() => setTaDialog(false)}>Batal</Button><Button onClick={saveTa}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapel Dialog */}
      <Dialog open={mapelDialog} onOpenChange={setMapelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">{editMapel ? 'Edit' : 'Tambah'} Mata Pelajaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Kode</Label><Input placeholder="Contoh: MTK" value={mapelForm.kode} onChange={e => setMapelForm({ ...mapelForm, kode: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nama</Label><Input placeholder="Contoh: Matematika" value={mapelForm.nama} onChange={e => setMapelForm({ ...mapelForm, nama: e.target.value })} /></div>
            <div className="space-y-2"><Label>Deskripsi</Label><Input value={mapelForm.deskripsi} onChange={e => setMapelForm({ ...mapelForm, deskripsi: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMapelDialog(false)}>Batal</Button><Button onClick={saveMapel}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pengajaran Dialog */}
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
                <SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}</SelectContent>
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
          <DialogFooter><Button variant="outline" onClick={() => setPgDialog(false)}>Batal</Button><Button onClick={savePengajaran}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
