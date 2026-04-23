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

interface Ekskul {
  id: string;
  nama: string;
  hari: string;
}

interface Anggota {
  id: string;
  ekstrakurikuler_id: string;
  siswa_id: string;
  created_at: string;
  siswa?: { id: string; nama_lengkap: string; status: string };
}

interface Siswa {
  id: string;
  namaLengkap: string;
}

export default function PelatihDashboard() {
  const { user } = useAuth();
  const [ekskul, setEkskul] = useState<Ekskul | null>(null);
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [availableSiswa, setAvailableSiswa] = useState<Siswa[]>([]);
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
      const myEkskul = ekskulRes.data[0] || null;
      setEkskul(myEkskul);

      if (myEkskul) {
        // 2. Get Members of this ekskul
        const anggotaRes = await api.get(`/ekstrakurikuler-anggota?ekstrakurikuler_id=${myEkskul.id}`);
        setAnggota(anggotaRes.data);

        // 3. Get all students for the "Add" dropdown
        const siswaRes = await api.get('/siswa');
        // Filter out students already in this ekskul
        const currentMemberIds = anggotaRes.data.map((a: Anggota) => a.siswa_id);
        
        // Handle different backend response structures
        const rawSiswa = Array.isArray(siswaRes.data) ? siswaRes.data : (siswaRes.data.data || []);
        
        const filteredSiswa = rawSiswa.filter((s: any) => !currentMemberIds.includes(s.id));
        
        const mappedSiswa = filteredSiswa.map((s: any) => ({
          id: s.id,
          namaLengkap: s.nama_lengkap || s.namaLengkap || 'Tanpa Nama'
        }));
        
        setAvailableSiswa(mappedSiswa);
      }
    } catch (err: any) {
      console.error('Error loading coach data:', err);
      toast.error('Gagal memuat data');
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
            <Button className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Anggota Baru</DialogTitle>
              <CardDescription>Pilih siswa dari daftar untuk ditambahkan ke {ekskul.nama}.</CardDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedSiswaId} onValueChange={setSelectedSiswaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Cari Nama Siswa..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSiswa.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.namaLengkap}</SelectItem>
                  ))}
                  {availableSiswa.length === 0 && (
                    <p className="p-2 text-sm text-center text-muted-foreground">Semua siswa sudah terdaftar atau tidak ada data.</p>
                  )}
                </SelectContent>
              </Select>
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
                    <td className="p-3 font-medium">{a.siswa?.nama_lengkap || '-'}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString('id-ID')}
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
