import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import type { PengajaranGuru, Kelas, Siswa, Absensi, StatusKehadiran } from '@/types';
import { Save, Inbox, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { isUnauthorizedError } from '@/lib/api-errors';

const statusColors: Record<StatusKehadiran, string> = {
  hadir: 'bg-primary/10 text-primary border-primary/30',
  alfa: 'bg-destructive/10 text-destructive border-destructive/30',
  sakit: 'bg-warning/10 text-warning border-warning/30',
  izin: 'bg-info/10 text-info border-info/30',
};

const statusLabels: Record<StatusKehadiran, string> = {
  hadir: 'Hadir',
  alfa: 'Alfa',
  sakit: 'Sakit',
  izin: 'Izin',
};

export default function Attendance() {
  const { guruId } = useAuth();
  const { toast } = useToast();
  const { data: pengajaranAll, loading: loadP } = useApiData<PengajaranGuru>('/pengajaran');
  const { data: kelas, loading: loadK } = useApiData<Kelas>('/kelas');
  const { data: allSiswa, loading: loadS } = useApiData<Siswa>('/siswa');

  const isLoading = loadP || loadK || loadS;

  const pengajaran = pengajaranAll.filter(p => p.guruId === guruId);
  const kelasIds = [...new Set(pengajaran.map(p => p.kelasId))];
  const assignedKelas = kelas.filter(k => kelasIds.includes(k.id));

  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, StatusKehadiran>>({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const siswaInKelas = useMemo(() => allSiswa.filter(s => s.kelasId === selectedKelas), [selectedKelas, allSiswa]);

  useEffect(() => {
    if (!selectedKelas || !tanggal) {
      setLocalAttendance({});
      return;
    }

    let isMounted = true;

    const loadAttendance = async () => {
      const existing: Record<string, StatusKehadiran> = {};
      siswaInKelas.forEach((siswa) => {
        existing[siswa.id] = 'hadir';
      });

      setIsLoadingAttendance(true);

      try {
        const response = await api.get('/absensi', {
          params: {
            kelas_id: selectedKelas,
            tanggal,
          },
        });

        const absensiData: Absensi[] = Array.isArray(response.data) ? response.data : response.data.data || [];
        absensiData.forEach((item) => {
          existing[item.siswaId] = item.status;
        });

        if (isMounted) {
          setLocalAttendance(existing);
        }
      } catch (err) {
        if (isMounted && !isUnauthorizedError(err)) {
          setLocalAttendance(existing);
          toast({ title: 'Gagal', description: 'Gagal memuat absensi', variant: 'destructive' });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAttendance(false);
        }
      }
    };

    loadAttendance();

    return () => {
      isMounted = false;
    };
  }, [selectedKelas, tanggal, siswaInKelas, toast]);

  const toggleStatus = (siswaId: string) => {
    const order: StatusKehadiran[] = ['hadir', 'alfa', 'sakit', 'izin'];
    const current = localAttendance[siswaId] || 'hadir';
    const next = order[(order.indexOf(current) + 1) % order.length];
    setLocalAttendance(prev => ({ ...prev, [siswaId]: next }));
  };

  const saveAttendance = async () => {
    if (!selectedKelas || siswaInKelas.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/absensi/batch', {
        kelas_id: selectedKelas,
        tanggal,
        absensi: siswaInKelas.map((siswa) => ({
          siswa_id: siswa.id,
          status: localAttendance[siswa.id] || 'hadir',
          keterangan: null,
        })),
      });

      toast({ title: 'Berhasil', description: 'Absensi berhasil disimpan' });
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast({ title: 'Gagal', description: 'Gagal menyimpan absensi', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Rekap
  const rekapKelas = useMemo(() => {
    if (!selectedKelas) return null;
    const values = Object.values(localAttendance);
    return {
      hadir: values.filter(v => v === 'hadir').length,
      alfa: values.filter(v => v === 'alfa').length,
      sakit: values.filter(v => v === 'sakit').length,
      izin: values.filter(v => v === 'izin').length,
    };
  }, [selectedKelas, localAttendance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Absensi Siswa</h1>
        <p className="text-muted-foreground">Kelola kehadiran harian siswa</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>Pilih Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                <SelectContent>{assignedKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedKelas && (
        <>
          {rekapKelas && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(statusLabels) as [StatusKehadiran, string][]).map(([key, label]) => (
                <div key={key} className={`p-3 rounded-lg border text-center ${statusColors[key]}`}>
                  <p className="text-2xl font-heading font-bold">{rekapKelas[key]}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-heading text-lg">Daftar Kehadiran</CardTitle>
              <Button size="sm" onClick={saveAttendance} disabled={isLoadingAttendance || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : siswaInKelas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm">Tidak ada siswa di kelas ini</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siswaInKelas.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{s.namaLengkap}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`cursor-pointer select-none ${statusColors[localAttendance[s.id] || 'hadir']}`}
                            onClick={() => toggleStatus(s.id)}
                          >
                            {statusLabels[localAttendance[s.id] || 'hadir']}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
