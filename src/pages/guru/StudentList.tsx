import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getData, mockPengajaran, mockKelas, mockSiswa } from '@/lib/mock-data';
import type { PengajaranGuru, Kelas, Siswa } from '@/types';
import { Eye, Inbox } from 'lucide-react';

export default function StudentList() {
  const { guruId } = useAuth();
  const pengajaran = getData<PengajaranGuru>('pengajaran', mockPengajaran).filter(p => p.guruId === guruId);
  const kelas = getData<Kelas>('kelas', mockKelas);
  const allSiswa = getData<Siswa>('siswa', mockSiswa);

  const kelasIds = [...new Set(pengajaran.map(p => p.kelasId))];
  const assignedKelas = kelas.filter(k => kelasIds.includes(k.id));

  const [selectedKelas, setSelectedKelas] = useState('');
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);

  const siswaInKelas = useMemo(() => allSiswa.filter(s => s.kelasId === selectedKelas), [selectedKelas, allSiswa]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Daftar Siswa</h1>
        <p className="text-muted-foreground">Lihat profil siswa di kelas yang Anda ampu</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="max-w-sm space-y-2">
            <Label>Pilih Kelas</Label>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
              <SelectContent>{assignedKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedKelas && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {kelas.find(k => k.id === selectedKelas)?.nama} — {siswaInKelas.length} Siswa
            </CardTitle>
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
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden sm:table-cell">JK</TableHead>
                    <TableHead className="text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswaInKelas.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{s.jenisKelamin === 'L' ? 'L' : 'P'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDetailSiswa(s)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!detailSiswa} onOpenChange={() => setDetailSiswa(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Profil Siswa</DialogTitle></DialogHeader>
          {detailSiswa && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">NIS:</span><p className="font-medium">{detailSiswa.nis}</p></div>
                <div><span className="text-muted-foreground">Nama:</span><p className="font-medium">{detailSiswa.nama}</p></div>
                <div><span className="text-muted-foreground">TTL:</span><p className="font-medium">{detailSiswa.tempatLahir}, {detailSiswa.tanggalLahir}</p></div>
                <div><span className="text-muted-foreground">JK:</span><p className="font-medium">{detailSiswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
                <div><span className="text-muted-foreground">Agama:</span><p className="font-medium">{detailSiswa.agama}</p></div>
                <div><span className="text-muted-foreground">Kelas:</span><p className="font-medium">{kelas.find(k => k.id === detailSiswa.kelasId)?.nama || '-'}</p></div>
              </div>
              <div><span className="text-muted-foreground">Alamat:</span><p className="font-medium">{detailSiswa.alamat}</p></div>
              <hr className="border-border" />
              <p className="font-heading font-semibold">Info Orang Tua</p>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Ayah:</span><p className="font-medium">{detailSiswa.namaAyah}</p></div>
                <div><span className="text-muted-foreground">Ibu:</span><p className="font-medium">{detailSiswa.namaIbu}</p></div>
                <div><span className="text-muted-foreground">Telepon:</span><p className="font-medium">{detailSiswa.teleponOrtu}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
