import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { isUnauthorizedError } from '@/lib/api-errors';

interface Ekskul {
  id: string;
  nama: string;
  hari: string;
}

interface Anggota {
  id: string;
  ekstrakurikulerId: string;
  siswaId: string;
  createdAt: string;
  siswa?: { id: string; namaLengkap: string; status: string };
}

interface Siswa {
  id: string;
  namaLengkap: string;
  kelasId: string;
}

interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: number;
}

export default function PelatihDashboard() {
  const { user } = useAuth();
  const [ekskul, setEkskul] = useState<Ekskul | null>(null);
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('all');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Get Ekskul assigned to this coach
      const ekskulRes = await api.get(`/ekstrakurikuler?guru_id=${user.id}`);
      const ekskulData = Array.isArray(ekskulRes.data) ? ekskulRes.data : ekskulRes.data.data || [];
      const myEkskul = ekskulData[0] || null;
      setEkskul(myEkskul);

      if (myEkskul) {
        // 2. Get Members of this ekskul
        const anggotaRes = await api.get(`/ekstrakurikuler-anggota?ekstrakurikuler_id=${myEkskul.id}`);
        const anggotaData = Array.isArray(anggotaRes.data) ? anggotaRes.data : anggotaRes.data.data || [];
        setAnggota(anggotaData);

        // 3. Get Classes and Students
        const [kelasRes, siswaRes] = await Promise.all([
          api.get('/kelas'),
          api.get('/siswa')
        ]);
        
        setKelasList(Array.isArray(kelasRes.data) ? kelasRes.data : (kelasRes.data.data || []));
        
        // Filter out students already in this ekskul
        const currentMemberIds = anggotaData.map((a: Anggota) => a.siswaId);
        const rawSiswa = Array.isArray(siswaRes.data) ? siswaRes.data : (siswaRes.data.data || []);
        
        const mappedSiswa = rawSiswa
          .filter((s: any) => !currentMemberIds.includes(s.id))
          .map((s: any) => ({
            id: s.id,
            namaLengkap: s.namaLengkap || 'Tanpa Nama',
            kelasId: s.kelasId
          }));
        
        setAllSiswa(mappedSiswa);
      }
    } catch (err: any) {
      if (!isUnauthorizedError(err)) {
        console.error('Error loading coach data:', err);
        toast.error('Gagal memuat data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSiswa = async () => {
    if (!selectedSiswaId || !ekskul) return;
    setIsAdding(true);
    try {
      await api.post('/ekstrakurikuler-anggota', {
        ekstrakurikuler_id: ekskul.id,
        siswa_id: selectedSiswaId
      });
      toast.success('Siswa berhasil ditambahkan');
      setIsDialogOpen(false);
      setSelectedSiswaId('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan siswa');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSiswa = async (id: string) => {
    if (!confirm('Hapus siswa dari ekstrakurikuler ini?')) return;
    try {
      await api.delete(`/ekstrakurikuler-anggota/${id}`);
      toast.success('Siswa berhasil dihapus');
      loadData();
    } catch (err: any) {
      toast.error('Gagal menghapus siswa');
    }
  };

  const filteredSiswa = (selectedKelasId === 'all' 
    ? allSiswa 
    : allSiswa.filter(s => s.kelasId === selectedKelasId))
    .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ekskul) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-bold">Belum Ada Ekskul</h3>
          <p className="text-muted-foreground">Anda belum ditugaskan untuk mengajar kegiatan ekstrakurikuler apapun.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen {ekskul.nama}</h2>
          <p className="text-muted-foreground">Kelola daftar siswa yang mengikuti kegiatan {ekskul.nama} (Hari {ekskul.hari}).</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto" onClick={() => {
              setSelectedKelasId('all');
              setSelectedSiswaId('');
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Anggota Baru</DialogTitle>
              <CardDescription>Pilih siswa dari daftar untuk ditambahkan ke {ekskul.nama}.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter Per Kelas</label>
                <Select value={selectedKelasId} onValueChange={(val) => {
                  setSelectedKelasId(val);
                  setSelectedSiswaId('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas..." />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {kelasList.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Nama Siswa</label>
                <Select value={selectedSiswaId} onValueChange={setSelectedSiswaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cari Nama Siswa..." />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-[200px] overflow-y-auto">
                    {filteredSiswa.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.namaLengkap}</SelectItem>
                    ))}
                    {filteredSiswa.length === 0 && (
                      <p className="p-2 text-sm text-center text-muted-foreground">
                        {selectedKelasId === 'all' ? 'Tidak ada siswa yang tersedia.' : 'Tidak ada siswa di kelas ini yang tersedia.'}
                      </p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAddSiswa} disabled={!selectedSiswaId || isAdding}>
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tambahkan Ke Ekskul
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta ({anggota.length} Siswa)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Nama Siswa</th>
                  <th className="p-3 font-medium">Tanggal Daftar</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {anggota.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      Belum ada peserta yang bergabung.
                    </td>
                  </tr>
                ) : anggota.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{a.siswa?.namaLengkap || '-'}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {a.siswa?.status || 'Aktif'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveSiswa(a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
