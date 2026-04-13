import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
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
  siswa?: { id: string; nama_lengkap: string; status: string };
}

export default function ExtracurricularManagement() {
  const [myEkskuls, setMyEkskuls] = useState<Ekskul[]>([]);
  const [selectedEkskul, setSelectedEkskul] = useState<string>('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  
  // Attendance state
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Get ekskul assigned to this guru
      const ekskulRes = await api.get('/ekstrakurikuler', { params: { guru_id: currentUser.id } });
      let ekskulList = ekskulRes.data;
      
      // If no ekskul assigned, show all (for testing)
      if (ekskulList.length === 0) {
        const allRes = await api.get('/ekstrakurikuler');
        ekskulList = allRes.data;
      }
      
      setMyEkskuls(ekskulList);
      if (ekskulList.length > 0 && !selectedEkskul) {
        setSelectedEkskul(ekskulList[0].id);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memuat data ekskul');
    }
  }, [selectedEkskul]);

  const loadAnggota = useCallback(async () => {
    if (!selectedEkskul) return;
    try {
      const res = await api.get('/ekstrakurikuler-anggota', { params: { ekstrakurikuler_id: selectedEkskul } });
      setAnggota(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memuat anggota');
    }
  }, [selectedEkskul]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAnggota();
    setAttendance({});
  }, [loadAnggota]);

  const handleAttendance = (siswaId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [siswaId]: status }));
  };

  const submitAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      toast.error('Belum ada absensi yang diisi.');
      return;
    }
    try {
      await api.post('/ekstrakurikuler-absensi', {
        ekstrakurikuler_id: selectedEkskul,
        tanggal: new Date().toISOString().split('T')[0],
        absensi: attendance,
      });
      toast.success('Presensi berhasil disimpan!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menyimpan presensi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Ekstrakurikuler</h2>
          <p className="text-muted-foreground">Kelola presensi peserta pada kegiatan ekstrakurikuler yang Anda bina.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Presensi Hari Ini</CardTitle>
              <CardDescription>
                Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedEkskul} onValueChange={setSelectedEkskul}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Ekstrakurikuler" />
                </SelectTrigger>
                <SelectContent>
                  {myEkskuls.map(ekskul => (
                    <SelectItem key={ekskul.id} value={ekskul.id}>{ekskul.nama} ({ekskul.hari})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Nama Siswa</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-center">Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {anggota.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-muted-foreground">
                      Tidak ada peserta di ekstrakurikuler ini.
                    </td>
                  </tr>
                ) : anggota.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{a.siswa?.nama_lengkap || '-'}</td>
                      <td className="p-3">
                         <Badge variant="outline">{a.siswa?.status || 'Aktif'}</Badge>
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                         <Button 
                           size="sm" 
                           variant={attendance[a.siswa_id] === 'hadir' ? 'default' : 'outline'}
                           className={attendance[a.siswa_id] === 'hadir' ? 'bg-green-600 hover:bg-green-700' : ''}
                           onClick={() => handleAttendance(a.siswa_id, 'hadir')}
                         >
                           <CheckCircle2 className="w-4 h-4 mr-1" /> Hadir
                         </Button>
                         <Button 
                           size="sm" 
                           variant={attendance[a.siswa_id] === 'izin' ? 'default' : 'outline'}
                           className={attendance[a.siswa_id] === 'izin' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                           onClick={() => handleAttendance(a.siswa_id, 'izin')}
                         >
                           <Clock className="w-4 h-4 mr-1" /> Izin
                         </Button>
                         <Button 
                           size="sm" 
                           variant={attendance[a.siswa_id] === 'alfa' ? 'default' : 'outline'}
                           className={attendance[a.siswa_id] === 'alfa' ? 'bg-red-600 hover:bg-red-700' : ''}
                           onClick={() => handleAttendance(a.siswa_id, 'alfa')}
                         >
                           <XCircle className="w-4 h-4 mr-1" /> Alfa
                         </Button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          {anggota.length > 0 && (
             <div className="mt-6 flex justify-end">
               <Button onClick={submitAttendance}>Simpan Presensi</Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
