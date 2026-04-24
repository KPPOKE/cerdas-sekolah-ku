import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Guru {
  id: string;
  nama: string;
  role?: string;
}

interface Ekskul {
  id: string;
  nama: string;
  hari: string;
  guru_id: string;
  deskripsi: string | null;
  guru?: Guru;
}

export default function ExtracurricularSetup() {
  const [ekstrakurikuler, setEkstrakurikuler] = useState<Ekskul[]>([]);
  const [gurus, setGurus] = useState<Guru[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddPelatihOpen, setIsAddPelatihOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPelatih, setNewPelatih] = useState({ nama: '', username: '' });
  
  const [newEkskul, setNewEkskul] = useState({
    nama: '',
    hari: 'Senin',
    guru_id: '',
    deskripsi: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ekskulRes, usersRes] = await Promise.all([
        api.get('/ekstrakurikuler'),
        api.get('/users-guru'),
      ]);
      setEkstrakurikuler(ekskulRes.data);
      setGurus(usersRes.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memuat data');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!newEkskul.nama || !newEkskul.guru_id) {
      toast.error('Nama ekskul dan guru pembina wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/ekstrakurikuler/${editingId}`, newEkskul);
        toast.success('Ekstrakurikuler berhasil diperbarui');
      } else {
        await api.post('/ekstrakurikuler', newEkskul);
        toast.success('Ekstrakurikuler berhasil ditambahkan');
      }
      setIsAddOpen(false);
      setEditingId(null);
      setNewEkskul({ nama: '', hari: 'Senin', guru_id: '', deskripsi: '' });
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (ekskul: Ekskul) => {
    setEditingId(ekskul.id);
    setNewEkskul({
      nama: ekskul.nama,
      hari: ekskul.hari,
      guru_id: ekskul.guru_id,
      deskripsi: ekskul.deskripsi || ''
    });
    setIsAddOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/ekstrakurikuler/${deleteId}`);
      toast.success('Ekstrakurikuler berhasil dihapus');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menghapus ekskul');
    } finally {
      setIsDeleteAlertOpen(false);
      setDeleteId(null);
    }
  };

  const handleAddPelatih = async () => {
    if (!newPelatih.nama || !newPelatih.username) {
      toast.error('Nama dan Username pelatih wajib diisi');
      return;
    }
    try {
      const response = await api.post('/pelatih', newPelatih);
      toast.success('Pelatih eksternal berhasil ditambahkan');
      setGurus([...gurus, response.data]);
      setNewEkskul({ ...newEkskul, guru_id: response.data.id });
      setIsAddPelatihOpen(false);
      setNewPelatih({ nama: '', username: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menambahkan pelatih');
    }
  };

  const getDayBadge = (hari: string) => {
    const colorMap: Record<string, string> = {
      Senin: 'bg-blue-500', Selasa: 'bg-green-500', Rabu: 'bg-yellow-500',
      Kamis: 'bg-orange-500', Jumat: 'bg-purple-500', Sabtu: 'bg-pink-500', Minggu: 'bg-red-500'
    };
    return <Badge className={`${colorMap[hari] || 'bg-gray-500'} hover:${colorMap[hari]} text-white`}>{hari}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Setup Ekstrakurikuler</h2>
          <p className="text-muted-foreground">Kelola master data ekstrakurikuler, jadwal hari, dan guru pembina.</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setNewEkskul({ nama: '', hari: 'Senin', guru_id: '', deskripsi: '' });
          setIsAddOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Ekskul
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Ekstrakurikuler</CardTitle>
          <CardDescription>Semua kegiatan ekstrakurikuler yang aktif di madrasah.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Nama Ekstrakurikuler</th>
                  <th className="p-3 font-medium">Jadwal (Hari)</th>
                  <th className="p-3 font-medium">Guru Pembina</th>
                  <th className="p-3 font-medium">Deskripsi</th>
                  <th className="p-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ekstrakurikuler.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      Tidak ada data ekstrakurikuler.
                    </td>
                  </tr>
                ) : ekstrakurikuler.map((ekskul) => (
                  <tr key={ekskul.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{ekskul.nama}</td>
                    <td className="p-3">{getDayBadge(ekskul.hari)}</td>
                    <td className="p-3">{ekskul.guru?.nama || '-'}</td>
                    <td className="p-3 text-muted-foreground">{ekskul.deskripsi || '-'}</td>
                    <td className="p-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEditClick(ekskul)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteClick(ekskul.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

       <Dialog open={isAddOpen} onOpenChange={(val) => {
          setIsAddOpen(val);
          if (!val) setEditingId(null);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Tambah'} Ekstrakurikuler</DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui detail kegiatan ekstrakurikuler ini.' : 'Masukkan detail kegiatan ekstrakurikuler baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Ekstrakurikuler</Label>
              <Input 
                placeholder="Contoh: Panahan" 
                value={newEkskul.nama} 
                onChange={e => setNewEkskul({...newEkskul, nama: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Hari Kegiatan</Label>
              <Select value={newEkskul.hari} onValueChange={(val) => setNewEkskul({...newEkskul, hari: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Hari" /></SelectTrigger>
                <SelectContent>
                  {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Guru / Pelatih Pembina</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setIsAddPelatihOpen(true)}>
                  + Tambah Pelatih Eksternal
                </Button>
              </div>
              <Select value={newEkskul.guru_id} onValueChange={(val) => setNewEkskul({...newEkskul, guru_id: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Guru / Pelatih" /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="max-h-64">
                  {gurus.map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{g.nama}</span>
                        <Badge variant="outline" className={`text-[10px] h-4 px-1 ${g.role === 'pelatih' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {g.role === 'pelatih' ? 'Pelatih' : 'Guru'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Lengkap (Opsional)</Label>
              <Input 
                placeholder="Deskripsi..." 
                value={newEkskul.deskripsi} 
                onChange={e => setNewEkskul({...newEkskul, deskripsi: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (editingId ? 'Perbarui' : 'Simpan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Pelatih Eksternal */}
      <Dialog open={isAddPelatihOpen} onOpenChange={setIsAddPelatihOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pelatih Eksternal</DialogTitle>
            <DialogDescription>Tambahkan akun pelatih dari luar sekolah.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lengkap Pelatih</Label>
              <Input 
                placeholder="Contoh: Coach Dika" 
                value={newPelatih.nama} 
                onChange={e => setNewPelatih({...newPelatih, nama: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Username Login (Tanpa Spasi)</Label>
              <Input 
                placeholder="Contoh: dika_futsal" 
                value={newPelatih.username} 
                onChange={e => setNewPelatih({...newPelatih, username: e.target.value.replace(/\s+/g, '')})} 
              />
              <p className="text-xs text-muted-foreground">Password default akun ini adalah: <b className="text-primary">password123</b></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPelatihOpen(false)}>Batal</Button>
            <Button onClick={handleAddPelatih}>Tambah Pelatih</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ekstrakurikuler?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ekstrakurikuler yang masih memiliki anggota tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
