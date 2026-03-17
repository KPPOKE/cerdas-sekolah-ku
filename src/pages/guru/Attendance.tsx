import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getData, setData, mockPengajaran, mockKelas, mockSiswa, mockAbsensi, generateId } from '@/lib/mock-data';
import type { PengajaranGuru, Kelas, Siswa, Absensi, StatusKehadiran } from '@/types';
import { Save, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const pengajaran = getData<PengajaranGuru>('pengajaran', mockPengajaran).filter(p => p.guruId === guruId);
  const kelas = getData<Kelas>('kelas', mockKelas);
  const allSiswa = getData<Siswa>('siswa', mockSiswa);
  const [absensi, setAbsensi] = useState(() => getData<Absensi>('absensi', mockAbsensi));

  const kelasIds = [...new Set(pengajaran.map(p => p.kelasId))];
  const assignedKelas = kelas.filter(k => kelasIds.includes(k.id));

  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, StatusKehadiran>>({});

  const siswaInKelas = useMemo(() => allSiswa.filter(s => s.kelasId === selectedKelas), [selectedKelas, allSiswa]);

  // Load existing attendance when kelas/tanggal changes
  useMemo(() => {
    if (!selectedKelas || !tanggal) return;
    const existing: Record<string, StatusKehadiran> = {};
    absensi.filter(a => a.kelasId === selectedKelas && a.tanggal === tanggal)
      .forEach(a => { existing[a.siswaId] = a.status; });
    // Default to hadir
    siswaInKelas.forEach(s => {
      if (!existing[s.id]) existing[s.id] = 'hadir';
    });
    setLocalAttendance(existing);
  }, [selectedKelas, tanggal, siswaInKelas.length]);

  const toggleStatus = (siswaId: string) => {
    const order: StatusKehadiran[] = ['hadir', 'alfa', 'sakit', 'izin'];
    const current = localAttendance[siswaId] || 'hadir';
    const next = order[(order.indexOf(current) + 1) % order.length];
    setLocalAttendance(prev => ({ ...prev, [siswaId]: next }));
  };

  const saveAttendance = () => {
    // Remove old records for this kelas+tanggal
    let updated = absensi.filter(a => !(a.kelasId === selectedKelas && a.tanggal === tanggal));
    // Add new
    Object.entries(localAttendance).forEach(([siswaId, status]) => {
      updated.push({ id: generateId(), siswaId, kelasId: selectedKelas, tanggal, status });
    });
    setAbsensi(updated);
    setData('absensi', updated);
    toast({ title: 'Berhasil', description: 'Absensi berhasil disimpan' });
  };

  // Rekap
  const rekapKelas = useMemo(() => {
    if (!selectedKelas) return null;
    const records = absensi.filter(a => a.kelasId === selectedKelas);
    return {
      hadir: records.filter(r => r.status === 'hadir').length,
      alfa: records.filter(r => r.status === 'alfa').length,
      sakit: records.filter(r => r.status === 'sakit').length,
      izin: records.filter(r => r.status === 'izin').length,
    };
  }, [selectedKelas, absensi]);

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
                <SelectContent>{assignedKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}</SelectContent>
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
              <Button size="sm" onClick={saveAttendance}><Save className="h-4 w-4 mr-1" />Simpan</Button>
            </CardHeader>
            <CardContent>
              {siswaInKelas.length === 0 ? (
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
                        <TableCell className="font-medium">{s.nama}</TableCell>
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
