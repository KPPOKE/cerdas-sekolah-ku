import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, School, Activity, Loader2 } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import type { Siswa, Guru, Kelas } from '@/types';

export default function AdminDashboard() {
  const { data: siswa, loading: loadS } = useApiData<Siswa>('/siswa');
  const { data: guru, loading: loadG } = useApiData<Guru>('/guru');
  const { data: kelas, loading: loadK } = useApiData<Kelas>('/kelas');

  const isLoading = loadS || loadG || loadK;

  const stats = [
    { label: 'Total Siswa', value: siswa.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Total Guru', value: guru.length, icon: GraduationCap, color: 'bg-info/10 text-info' },
    { label: 'Total Kelas', value: kelas.length, icon: School, color: 'bg-warning/10 text-warning' },
    { label: 'Tahun Ajaran Aktif', value: '2025/2026', icon: Activity, color: 'bg-success/10 text-success' },
  ];

  const recentActivities = [
    { text: 'Siswa baru Ahmad Rizki ditambahkan ke Kelas 1A', time: '2 jam lalu' },
    { text: 'Bu Siti Aminah ditugaskan sebagai wali Kelas 1A', time: '3 jam lalu' },
    { text: 'Mata pelajaran Matematika ditambahkan', time: '1 hari lalu' },
    { text: 'Tahun Ajaran 2025/2026 diaktifkan', time: '2 hari lalu' },
  ];

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
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Ringkasan data Sistem Informasi Akademik</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
