import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { Search } from 'lucide-react';

interface PpdbResult {
  id: string;
  nik: string;
  nama_lengkap: string;
  status: string;
  created_at: string;
}

export default function PPDBAnnouncement() {
  const navigate = useNavigate();
  const [nik, setNik] = useState('');
  const [result, setResult] = useState<PpdbResult | null | 'NOT_FOUND'>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/ppdb/cek-status', { nik });
      setResult(response.data.data);
    } catch {
      setResult('NOT_FOUND');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima':
        return <Badge className="bg-green-600">Diterima</Badge>;
      case 'ditolak':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">Proses Verifikasi (Pending)</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex justify-center items-center">
      <Card className="w-full max-w-xl shadow-xl border-border">
        <CardHeader className="text-center space-y-3 bg-primary/5 rounded-t-xl pb-6 border-b">
          <img
            src="/Madrasah Ibtidaiyah Al-Haq emblem.png"
            alt="Logo MI Al-Haq Jakarta"
            className="mx-auto w-20 h-20 object-contain"
          />
          <CardTitle className="font-heading text-2xl text-primary">Cek Pengumuman PPDB</CardTitle>
          <CardDescription>Masukkan NIK calon siswa untuk melihat status kelulusan</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK Siswa (16 Digit)</Label>
              <div className="flex space-x-2">
                <Input 
                  id="nik" 
                  placeholder="Masukkan 16 digit NIK..." 
                  maxLength={16} 
                  value={nik} 
                  onChange={e => setNik(e.target.value)} 
                  required 
                />
                <Button type="submit" disabled={isLoading || nik.length < 16}>
                  <Search className="w-4 h-4 mr-2" />
                  Cek
                </Button>
              </div>
            </div>
          </form>

          {result === 'NOT_FOUND' && (
            <div className="mt-8 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-center">
              <h4 className="font-semibold mb-1">Data Tidak Ditemukan</h4>
              <p className="text-sm">Tidak ada pendaftar dengan NIK {nik}. Pastikan NIK yang Anda masukkan sudah benar.</p>
            </div>
          )}

          {result && result !== 'NOT_FOUND' && (
            <div className="mt-8 border rounded-lg p-6 space-y-4 bg-card shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">Hasil Seleksi</h3>
                {getStatusBadge(result.status)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                <span className="text-muted-foreground">Nama Siswa</span>
                <span className="col-span-2 font-medium">{result.nama_lengkap}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                <span className="text-muted-foreground">NIK</span>
                <span className="col-span-2 font-medium">{result.nik}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-muted-foreground">Tanggal Daftar</span>
                <span className="col-span-2 font-medium">
                  {new Date(result.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          <div className="pt-8 flex justify-center">
             <Button variant="link" onClick={() => navigate('/')}>Kembali ke Beranda</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
