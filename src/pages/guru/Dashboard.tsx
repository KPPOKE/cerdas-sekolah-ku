import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getData, mockPengajaran, mockKelas, mockMataPelajaran, mockSiswa } from '@/lib/mock-data';
import type { PengajaranGuru, Kelas, MataPelajaran, Siswa } from '@/types';
import { BookOpen, Users, Clock } from 'lucide-react';

export default function GuruDashboard() {
  const { guruId, user } = useAuth();
  const pengajaran = getData<PengajaranGuru>('pengajaran', mockPengajaran).filter(p => p.guruId === guruId);
  const kelas = getData<Kelas>('kelas', mockKelas);
  const mapel = getData<MataPelajaran>('mapel', mockMataPelajaran);
  const siswa = getData<Siswa>('siswa', mockSiswa);

  const kelasIds = [...new Set(pengajaran.map(p => p.kelasId))];
  const assignedKelas = kelas.filter(k => kelasIds.includes(k.id));
  const totalSiswa = siswa.filter(s => kelasIds.includes(s.kelasId)).length;

  // Simulated schedule
  const jadwalHariIni = pengajaran.slice(0, 4).map((p, i) => ({
    jam: `${7 + i * 2}:00 - ${8 + i * 2}:30`,
    mapel: mapel.find(m => m.id === p.mataPelajaranId)?.nama || '-',
    kelas: kelas.find(k => k.id === p.kelasId)?.nama || '-',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard Guru</h1>
        <p className="text-muted-foreground">Selamat datang, {user?.nama}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kelas Diampu</p>
              <p className="text-2xl font-heading font-bold">{assignedKelas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Siswa</p>
              <p className="text-2xl font-heading font-bold">{totalSiswa}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
              <p className="text-2xl font-heading font-bold">{pengajaran.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Kelas yang Diampu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedKelas.map(k => {
                const jumlahSiswa = siswa.filter(s => s.kelasId === k.id).length;
                const mapelList = pengajaran.filter(p => p.kelasId === k.id).map(p => mapel.find(m => m.id === p.mataPelajaranId)?.nama).filter(Boolean);
                return (
                  <div key={k.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{k.nama}</p>
                      <Badge variant="secondary">{jumlahSiswa} siswa</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{mapelList.join(', ')}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Jadwal Hari Ini</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jadwalHariIni.map((j, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="text-xs font-mono text-muted-foreground w-24 flex-shrink-0">{j.jam}</div>
                  <div>
                    <p className="font-medium text-sm">{j.mapel}</p>
                    <p className="text-xs text-muted-foreground">{j.kelas}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
