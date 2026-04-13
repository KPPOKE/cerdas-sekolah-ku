import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface Ekskul {
  id: string;
  nama: string;
}

interface Anggota {
  id: string;
  ekstrakurikuler_id: string;
  siswa_id: string;
  created_at: string;
  siswa?: { id: string; nama_lengkap: string; status: string };
  ekstrakurikuler?: { id: string; nama: string };
}

export default function ExtracurricularMembers() {
  const [ekstrakurikuler, setEkstrakurikuler] = useState<Ekskul[]>([]);
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [selectedEkskul, setSelectedEkskul] = useState<string>('all');

  const loadData = useCallback(async () => {
    try {
      const [ekskulRes, anggotaRes] = await Promise.all([
        api.get('/ekstrakurikuler'),
        api.get('/ekstrakurikuler-anggota'),
      ]);
      setEkstrakurikuler(ekskulRes.data);
      setAnggota(anggotaRes.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memuat data');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAnggota = selectedEkskul === 'all' 
    ? anggota 
    : anggota.filter(a => a.ekstrakurikuler_id === selectedEkskul);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Anggota Ekstrakurikuler</h2>
        <p className="text-muted-foreground">Lihat daftar siswa yang mengikuti kegiatan ekstrakurikuler tertentu.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Daftar Peserta</CardTitle>
              <CardDescription>Pilih ekstrakurikuler untuk memfilter daftar peserta.</CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedEkskul} onValueChange={setSelectedEkskul}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Ekskul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Ekstrakurikuler</SelectItem>
                  {ekstrakurikuler.map(ekskul => (
                    <SelectItem key={ekskul.id} value={ekskul.id}>{ekskul.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Nama Siswa</th>
                  <th className="p-3 font-medium">Ekstrakurikuler</th>
                  <th className="p-3 font-medium">Tanggal Daftar</th>
                  <th className="p-3 font-medium">Status Siswa</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAnggota.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      Belum ada siswa yang tergabung dalam ekstrakurikuler.
                    </td>
                  </tr>
                ) : filteredAnggota.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{a.siswa?.nama_lengkap || '-'}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="bg-primary/5">{a.ekstrakurikuler?.nama || '-'}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {a.siswa?.status || 'Aktif'}
                      </Badge>
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
