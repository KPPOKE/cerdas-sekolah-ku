import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, CheckCircle, XCircle, Search, Image, UserPlus } from 'lucide-react';
import api from '@/lib/axios';
import { isUnauthorizedError } from '@/lib/api-errors';
import type { PendaftarPPDB } from '@/types';

interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: number;
}

export default function PPDBManagement() {
  const [pendaftars, setPendaftars] = useState<PendaftarPPDB[]>([]);
  const [kelasData, setKelasData] = useState<Kelas[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [selectedPendaftar, setSelectedPendaftar] = useState<PendaftarPPDB | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [selectedKelasId, setSelectedKelasId] = useState('');

  // Preview Dialog
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const STORAGE_URL = '/storage';

  const openPreview = (path: string | null, title: string) => {
    if (!path) {
      toast.error('Berkas belum diunggah');
      return;
    }
    setPreviewTitle(title);
    setPreviewImage(`${STORAGE_URL}/${path}`);
  };

  const loadData = useCallback(async () => {
    try {
      const [ppdbRes, kelasRes] = await Promise.all([
        api.get('/ppdb'),
        api.get('/kelas'),
      ]);
      setPendaftars(Array.isArray(ppdbRes.data) ? ppdbRes.data : ppdbRes.data.data || []);
      // KelasResource::collection wraps in { data: [...] }
      setKelasData(Array.isArray(kelasRes.data) ? kelasRes.data : kelasRes.data.data || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (!isUnauthorizedError(err)) {
        toast.error(error.response?.data?.message || 'Gagal memuat data');
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (id: string, newStatus: string) => {
    const confirm = window.confirm(`Ubah status pendaftar menjadi ${newStatus}?`);
    if (!confirm) return;

    try {
      await api.put(`/ppdb/${id}/status`, { status: newStatus });
      toast.success('Status berhasil diperbarui');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (!isUnauthorizedError(err)) {
        toast.error(error.response?.data?.message || 'Gagal memperbarui status');
      }
    }
  };

  const handleTerimaSiswa = async () => {
    if (!selectedPendaftar || !selectedKelasId) {
      toast.error('Pilih kelas terlebih dahulu');
      return;
    }

    try {
      await api.post('/ppdb/terima-siswa', {
        pendaftar_id: selectedPendaftar.id,
        kelas_id: selectedKelasId,
      });
      
      setIsAcceptDialogOpen(false);
      setSelectedPendaftar(null);
      setSelectedKelasId('');
      toast.success('Siswa berhasil didaftarkan ke Daftar Akademik Aktif!');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (!isUnauthorizedError(err)) {
        toast.error(error.response?.data?.message || 'Gagal menerima siswa');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima': return <Badge className="bg-green-600">Diterima</Badge>;
      case 'ditolak': return <Badge variant="destructive">Ditolak</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredData = pendaftars.filter(p => 
    p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nik.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen PPDB</h2>
          <p className="text-muted-foreground">Kelola penerimaan peserta didik baru dan verifikasi berkas.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Pendaftar (PPDB)</CardTitle>
              <CardDescription>Review pendaftar, cek berkas, dan tetapkan kelas untuk siswa yang lulus.</CardDescription>
            </div>
            <div className="w-72 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari NIK / Nama..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Tanggal Daftar</th>
                  <th className="p-3 font-medium">Data Calon Siswa</th>
                  <th className="p-3 font-medium">Berkas</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      Tidak ada data pendaftar.
                    </td>
                  </tr>
                ) : filteredData.map((pendaftar) => (
                  <tr key={pendaftar.id} className="hover:bg-muted/50">
                    <td className="p-3">
                      <div className="text-xs text-muted-foreground">
                        {new Date(pendaftar.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{pendaftar.namaLengkap}</div>
                      <div className="text-xs text-muted-foreground">NIK: {pendaftar.nik} | JK: {pendaftar.jenisKelamin}</div>
                      <div className="text-xs text-muted-foreground">Lahir: {pendaftar.tempatLahir}, {pendaftar.tanggalLahir}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Pas Foto" onClick={() => openPreview(pendaftar.berkasPasFoto ?? null, 'Pas Foto - ' + pendaftar.namaLengkap)}>
                          <Image className="w-3 h-3 mr-1" /> Foto
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Kartu Keluarga" onClick={() => openPreview(pendaftar.berkasKk ?? null, 'Kartu Keluarga - ' + pendaftar.namaLengkap)}>
                          <FileText className="w-3 h-3 mr-1" /> KK
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Akta Kelahiran" onClick={() => openPreview(pendaftar.berkasAktaKelahiran ?? null, 'Akta Kelahiran - ' + pendaftar.namaLengkap)}>
                          <FileText className="w-3 h-3 mr-1" /> Akta
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(pendaftar.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {pendaftar.status === 'pending' && (
                          <>
                            <Button 
                              variant="default" size="sm" className="h-8"
                              onClick={() => updateStatus(pendaftar.id, 'diterima')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Verifikasi
                            </Button>
                            <Button 
                              variant="destructive" size="sm" className="h-8"
                              onClick={() => updateStatus(pendaftar.id, 'ditolak')}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Tolak
                            </Button>
                          </>
                        )}
                        
                        {pendaftar.status === 'diterima' && (
                          <Button 
                            variant="secondary" size="sm" className="h-8 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                            onClick={() => {
                              setSelectedPendaftar(pendaftar);
                              setIsAcceptDialogOpen(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" /> Set Kelas
                          </Button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Siswa & Penempatan Kelas</DialogTitle>
            <DialogDescription>
              Menyalin data <strong>{selectedPendaftar?.namaLengkap}</strong> (NIK: {selectedPendaftar?.nik}) ke Data Akademik Aktif.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Pilih Kelas Penempatan</Label>
              <Select value={selectedKelasId} onValueChange={setSelectedKelasId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas (Contoh: 1A)" />
                </SelectTrigger>
                <SelectContent>
                  {kelasData.length === 0 ? (
                    <div className="p-2 text-sm text-center text-muted-foreground">Data kelas kosong.</div>
                  ) : (
                    kelasData.map(kelas => (
                      <SelectItem key={kelas.id} value={kelas.id}>Kelas {kelas.namaKelas} (Tingkat {kelas.tingkat})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
              *Setelah dikonfirmasi, siswa akan masuk ke Data Siswa Aktif dan dapat melakukan aktivitas akademik, absensi, ekskul, dll.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>Batal</Button>
            <Button onClick={handleTerimaSiswa} disabled={!selectedKelasId}>Konfirmasi Mutasi Siswa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 bg-black/95 text-white border-muted">
          <DialogHeader>
            <DialogTitle className="text-white text-center font-normal">{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center min-h-[50vh] overflow-auto">
            {previewImage && (
              <img 
                src={previewImage} 
                alt={previewTitle} 
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            {previewImage && (
              <Button variant="secondary" size="sm" asChild>
                <a href={previewImage} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
