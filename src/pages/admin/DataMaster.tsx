import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Inbox, Loader2 } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import type { Siswa, Guru, Kelas } from '@/types';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function DataMaster() {
  const { data: siswa, loading: loadS } = useApiData<Siswa>('/siswa');
  const { data: guru, loading: loadG } = useApiData<Guru>('/guru');
  const { data: kelas, loading: loadK } = useApiData<Kelas>('/kelas');

  const isLoading = loadS || loadG || loadK;

  const [searchSiswa, setSearchSiswa] = useState('');
  const [searchGuru, setSearchGuru] = useState('');
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);
  const [detailGuru, setDetailGuru] = useState<Guru | null>(null);

  const filteredSiswa = siswa.filter(s => s.nama.toLowerCase().includes(searchSiswa.toLowerCase()));
  const filteredGuru = guru.filter(g => g.nama.toLowerCase().includes(searchGuru.toLowerCase()));

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
        <h1 className="text-2xl font-heading font-bold">Data Master</h1>
        <p className="text-muted-foreground">Lihat data lengkap siswa dan guru</p>
      </div>

      <Tabs defaultValue="siswa">
        <TabsList>
          <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
          <TabsTrigger value="guru">Data Guru</TabsTrigger>
        </TabsList>

        <TabsContent value="siswa">
          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Data Lengkap Siswa</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari siswa..." className="pl-9" value={searchSiswa} onChange={e => setSearchSiswa(e.target.value)} />
              </div>
              {filteredSiswa.length === 0 ? <EmptyState message="Data siswa kosong" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">Kelas</TableHead><TableHead className="hidden sm:table-cell">JK</TableHead><TableHead className="text-right">Detail</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredSiswa.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                        <TableCell className="font-medium">{s.nama}</TableCell>
                        <TableCell className="hidden md:table-cell">{kelas.find(k => k.id === s.kelasId)?.nama || '-'}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{s.jenisKelamin === 'L' ? 'L' : 'P'}</Badge></TableCell>
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
        </TabsContent>

        <TabsContent value="guru">
          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Data Lengkap Guru</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari guru..." className="pl-9" value={searchGuru} onChange={e => setSearchGuru(e.target.value)} />
              </div>
              {filteredGuru.length === 0 ? <EmptyState message="Data guru kosong" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>NIP</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">Pendidikan</TableHead><TableHead className="text-right">Detail</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredGuru.map(g => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono text-xs">{g.nip}</TableCell>
                        <TableCell className="font-medium">{g.nama}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{g.pendidikan}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setDetailGuru(g)}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Siswa */}
      <Dialog open={!!detailSiswa} onOpenChange={() => setDetailSiswa(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Detail Siswa</DialogTitle></DialogHeader>
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

      {/* Detail Guru */}
      <Dialog open={!!detailGuru} onOpenChange={() => setDetailGuru(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Detail Guru</DialogTitle></DialogHeader>
          {detailGuru && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">NIP:</span><p className="font-medium">{detailGuru.nip}</p></div>
                <div><span className="text-muted-foreground">Nama:</span><p className="font-medium">{detailGuru.nama}</p></div>
                <div><span className="text-muted-foreground">TTL:</span><p className="font-medium">{detailGuru.tempatLahir}, {detailGuru.tanggalLahir}</p></div>
                <div><span className="text-muted-foreground">JK:</span><p className="font-medium">{detailGuru.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
                <div><span className="text-muted-foreground">Agama:</span><p className="font-medium">{detailGuru.agama}</p></div>
                <div><span className="text-muted-foreground">Pendidikan:</span><p className="font-medium">{detailGuru.pendidikan}</p></div>
              </div>
              <div><span className="text-muted-foreground">Alamat:</span><p className="font-medium">{detailGuru.alamat}</p></div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Telepon:</span><p className="font-medium">{detailGuru.telepon}</p></div>
                <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{detailGuru.email}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
