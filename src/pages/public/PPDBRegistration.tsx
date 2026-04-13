import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { differenceInYears, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PPDBRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const pasFotoRef = useRef<HTMLInputElement>(null);
  const kkRef = useRef<HTMLInputElement>(null);
  const aktaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    nama_ayah: '',
    nama_ibu: '',
    pekerjaan_ayah: '',
    pekerjaan_ibu: '',
    no_wa: '',
  });

  // Calculate age dynamically
  const umur = useMemo(() => {
    if (!formData.tanggal_lahir) return null;
    const birthDate = parseISO(formData.tanggal_lahir);
    const currentDate = new Date();
    // In actual rule, age is calculated as of July 1st of the application year.
    const july1st = new Date(currentDate.getFullYear(), 6, 1);
    return differenceInYears(july1st, birthDate);
  }, [formData.tanggal_lahir]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (umur !== null && umur < 6) {
      toast.error('Gagal: Usia minimum pendaftar adalah 6 tahun pada 1 Juli tahun ini.');
      return;
    }

    setIsLoading(true);

    try {
      // Use FormData to support file uploads
      const payload = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      // Append files
      if (pasFotoRef.current?.files?.[0]) {
        payload.append('berkas_pas_foto', pasFotoRef.current.files[0]);
      }
      if (kkRef.current?.files?.[0]) {
        payload.append('berkas_kk', kkRef.current.files[0]);
      }
      if (aktaRef.current?.files?.[0]) {
        payload.append('berkas_akta_kelahiran', aktaRef.current.files[0]);
      }

      const response = await api.post('/ppdb/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Pendaftaran Berhasil!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Terjadi kesalahan saat mengirim pendaftaran';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex justify-center items-center">
      <Card className="w-full max-w-3xl shadow-xl border-border">
        <CardHeader className="text-center space-y-3 bg-primary/5 rounded-t-xl pb-6 border-b">
          <img
            src="/Madrasah Ibtidaiyah Al-Haq emblem.png"
            alt="Logo MI Al-Haq Jakarta"
            className="mx-auto w-20 h-20 object-contain"
          />
          <CardTitle className="font-heading text-3xl text-primary">Pendaftaran Peserta Didik Baru</CardTitle>
          <CardDescription className="text-base">MI Al-Haq Jakarta — Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama_lengkap">Nama Lengkap Siswa</Label>
                <Input id="nama_lengkap" name="nama_lengkap" placeholder="Contoh: Budi Santoso" value={formData.nama_lengkap} onChange={handleChange} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nik">NIK Siswa (Dari Kartu Keluarga)</Label>
                <Input id="nik" name="nik" placeholder="16 Digit NIK" maxLength={16} value={formData.nik} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input id="tempat_lahir" name="tempat_lahir" placeholder="Kota Kelahiran" value={formData.tempat_lahir} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <Input id="tanggal_lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} required />
                {umur !== null && (
                  <p className={`text-xs mt-1 ${umur < 6 ? 'text-destructive font-semibold' : 'text-green-600'}`}>
                     Usia per 1 Juli: {umur} Tahun {umur < 6 ? '(Minimal 6 Tahun)' : '(Memenuhi Syarat)'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                <Select value={formData.jenis_kelamin} onValueChange={(val) => handleSelectChange('jenis_kelamin', val)} required>
                  <SelectTrigger id="jenis_kelamin">
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-Laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat">Alamat Lengkap (Sesuai KK)</Label>
                <Input id="alamat" name="alamat" placeholder="Jl. Raya No. 1 RT/RW" value={formData.alamat} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_ayah">Nama Ayah Kandung</Label>
                <Input id="nama_ayah" name="nama_ayah" value={formData.nama_ayah} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_ibu">Nama Ibu Kandung</Label>
                <Input id="nama_ibu" name="nama_ibu" value={formData.nama_ibu} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pekerjaan_ayah">Pekerjaan Ayah</Label>
                <Input id="pekerjaan_ayah" name="pekerjaan_ayah" placeholder="Contoh: Wiraswasta" value={formData.pekerjaan_ayah} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pekerjaan_ibu">Pekerjaan Ibu</Label>
                <Input id="pekerjaan_ibu" name="pekerjaan_ibu" placeholder="Contoh: Ibu Rumah Tangga" value={formData.pekerjaan_ibu} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_wa">Nomor Telepon / WhatsApp (Aktif)</Label>
                <Input id="no_wa" name="no_wa" placeholder="081234567890" value={formData.no_wa} onChange={handleChange} required />
              </div>
            </div>

            <hr className="my-6" />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Upload Berkas Pendukung (Wajib Foto)</h3>
              <p className="text-sm text-muted-foreground mb-4">Mohon siapkan file berformat JPG/PNG untuk diunggah.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pasFoto">Pas Foto Siswa (Latar Merah)</Label>
                  <Input id="pasFoto" ref={pasFotoRef} type="file" accept="image/jpeg, image/png" className="cursor-pointer" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="kk">Foto Kartu Keluarga (KK)</Label>
                  <Input id="kk" ref={kkRef} type="file" accept="image/jpeg, image/png" className="cursor-pointer" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="akta">Foto Akta Kelahiran</Label>
                  <Input id="akta" ref={aktaRef} type="file" accept="image/jpeg, image/png" className="cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>Kembali ke Beranda</Button>
              <Button type="submit" size="lg" disabled={isLoading || (umur !== null && umur < 6)}>
                {isLoading ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
