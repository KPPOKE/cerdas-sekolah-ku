import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/axios';
import type { PengajaranGuru, Kelas, Siswa, MataPelajaran } from '@/types';
import { Save, FileDown, FileSpreadsheet, Inbox, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Grading() {
  const { guruId } = useAuth();
  const { toast } = useToast();
  const { data: pengajaranAll, loading: loadP } = useApiData<PengajaranGuru>('/pengajaran');
  const { data: kelas, loading: loadK } = useApiData<Kelas>('/kelas');
  const { data: allSiswa, loading: loadS } = useApiData<Siswa>('/siswa');
  const { data: mapel } = useApiData<MataPelajaran>('/mata-pelajaran');

  const isLoading = loadP || loadK || loadS;

  const pengajaran = pengajaranAll.filter(p => p.guruId === guruId);
  const kelasIds = [...new Set(pengajaran.map(p => p.kelasId))];
  const assignedKelas = kelas.filter(k => kelasIds.includes(k.id));

  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');

  const availableMapel = useMemo(() => {
    return pengajaran.filter(p => p.kelasId === selectedKelas).map(p => mapel.find(m => m.id === p.mataPelajaranId)).filter(Boolean) as MataPelajaran[];
  }, [selectedKelas, pengajaran, mapel]);

  const siswaInKelas = useMemo(() => allSiswa.filter(s => s.kelasId === selectedKelas), [selectedKelas, allSiswa]);

  const [localGrades, setLocalGrades] = useState<Record<string, { tugas: number | string; uts: number | string; uas: number | string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  // Load existing grades
  useEffect(() => {
    if (!selectedKelas || !selectedMapel) return;
    
    let isMounted = true;
    const fetchGrades = async () => {
      setIsLoadingGrades(true);
      try {
        const response = await api.get(`/nilai`, {
          params: {
            kelas_id: selectedKelas,
            mata_pelajaran_id: selectedMapel
          }
        });
        
        if (isMounted) {
          const grades: Record<string, { tugas: number | string; uts: number | string; uas: number | string }> = {};
          
          // Set initial 0
          siswaInKelas.forEach(s => {
            grades[s.id] = { tugas: 0, uts: 0, uas: 0 };
          });

          // Overlay saved data
          const savedData = response.data.data || [];
          savedData.forEach((g: any) => {
            if (grades[g.siswa_id]) {
              grades[g.siswa_id] = {
                tugas: g.tugas || 0,
                uts: g.uts || 0,
                uas: g.uas || 0
              };
            }
          });
          
          setLocalGrades(grades);
        }
      } catch (err) {
        console.error("Failed to fetch grades", err);
      } finally {
        if (isMounted) setIsLoadingGrades(false);
      }
    };
    
    fetchGrades();

    return () => { isMounted = false; };
  }, [selectedKelas, selectedMapel, siswaInKelas]);

  const updateGrade = (siswaId: string, field: 'tugas' | 'uts' | 'uas', value: string) => {
    let parsed: number | string = value.replace(/^0+(?=\d)/, ''); // Remove leading zeros except last one
    if (parsed !== '') {
      const num = parseInt(parsed);
      if (!isNaN(num)) {
        parsed = Math.min(100, Math.max(0, num));
      } else {
        parsed = '';
      }
    }
    setLocalGrades(prev => ({ ...prev, [siswaId]: { ...prev[siswaId], [field]: parsed } }));
  };

  const calculateAverage = (g: { tugas: number | string; uts: number | string; uas: number | string }) => {
    const t = Number(g.tugas) || 0;
    const ut = Number(g.uts) || 0;
    const ua = Number(g.uas) || 0;
    return Math.round((t * 0.3 + ut * 0.3 + ua * 0.4) * 100) / 100;
  };

  const saveGrades = async () => {
    setIsSaving(true);
    try {
      const payload = siswaInKelas.map(s => {
        const g = localGrades[s.id] || { tugas: 0, uts: 0, uas: 0 };
        return {
          siswa_id: s.id,
          tugas: Number(g.tugas) || 0,
          uts: Number(g.uts) || 0,
          uas: Number(g.uas) || 0,
          rata_rata: calculateAverage(g)
        };
      });

      await api.post('/nilai/batch', {
        kelas_id: selectedKelas,
        mata_pelajaran_id: selectedMapel,
        grades: payload
      });

      toast({ title: 'Berhasil', description: 'Nilai berhasil disimpan' });
    } catch (err: any) {
      toast({ 
        title: 'Gagal', 
        description: err.response?.data?.message || 'Gagal menyimpan nilai', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    const mapelNama = mapel.find(m => m.id === selectedMapel)?.nama || '';
    const kelasNama = kelas.find(k => k.id === selectedKelas)?.namaKelas || '';

    doc.setFontSize(16);
    doc.text('Laporan Nilai Siswa', 14, 20);
    doc.setFontSize(11);
    doc.text(`Kelas: ${kelasNama} | Mata Pelajaran: ${mapelNama}`, 14, 30);

    const rows = siswaInKelas.map((s, i) => {
      const g = localGrades[s.id] || { tugas: 0, uts: 0, uas: 0 };
      return [i + 1, s.namaLengkap, Number(g.tugas) || 0, Number(g.uts) || 0, Number(g.uas) || 0, calculateAverage(g)];
    });

    (doc as any).autoTable({
      startY: 35,
      head: [['No', 'Nama', 'Tugas', 'UTS', 'UAS', 'Rata-rata']],
      body: rows,
    });

    doc.save(`Nilai_${kelasNama}_${mapelNama}.pdf`);
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const mapelNama = mapel.find(m => m.id === selectedMapel)?.nama || '';
    const kelasNama = kelas.find(k => k.id === selectedKelas)?.namaKelas || '';

    const data = siswaInKelas.map((s, i) => {
      const g = localGrades[s.id] || { tugas: 0, uts: 0, uas: 0 };
      return { No: i + 1, Nama: s.namaLengkap, Tugas: Number(g.tugas) || 0, UTS: Number(g.uts) || 0, UAS: Number(g.uas) || 0, 'Rata-rata': calculateAverage(g) };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai');
    XLSX.writeFile(wb, `Nilai_${kelasNama}_${mapelNama}.xlsx`);
  };

  const showGrades = selectedKelas && selectedMapel;

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
        <h1 className="text-2xl font-heading font-bold">Penilaian Siswa</h1>
        <p className="text-muted-foreground">Input dan kelola nilai siswa per mata pelajaran</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>Pilih Kelas</Label>
              <Select value={selectedKelas} onValueChange={v => { setSelectedKelas(v); setSelectedMapel(''); }}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                <SelectContent>{assignedKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Pilih Mata Pelajaran</Label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel} disabled={!selectedKelas}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel..." /></SelectTrigger>
                <SelectContent>{availableMapel.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showGrades && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-wrap gap-2">
            <CardTitle className="font-heading text-lg">Input Nilai</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportPDF}><FileDown className="h-4 w-4 mr-1" />PDF</Button>
              <Button size="sm" variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button>
              <Button size="sm" onClick={saveGrades} disabled={isLoadingGrades || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingGrades ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
               </div>
            ) : siswaInKelas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">Tidak ada siswa di kelas ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="w-32 min-w-[120px] text-center">Tugas (30%)</TableHead>
                      <TableHead className="w-32 min-w-[120px] text-center">UTS (30%)</TableHead>
                      <TableHead className="w-32 min-w-[120px] text-center">UAS (40%)</TableHead>
                      <TableHead className="w-24 min-w-[100px] text-center">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siswaInKelas.map((s, i) => {
                      const g = localGrades[s.id] || { tugas: 0, uts: 0, uas: 0 };
                      const avg = calculateAverage(g);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{s.namaLengkap}</TableCell>
                          <TableCell><Input type="number" min="0" max="100" className="text-center h-10 w-full font-semibold" value={g.tugas} onChange={e => updateGrade(s.id, 'tugas', e.target.value)} /></TableCell>
                          <TableCell><Input type="number" min="0" max="100" className="text-center h-10 w-full font-semibold" value={g.uts} onChange={e => updateGrade(s.id, 'uts', e.target.value)} /></TableCell>
                          <TableCell><Input type="number" min="0" max="100" className="text-center h-10 w-full font-semibold" value={g.uas} onChange={e => updateGrade(s.id, 'uas', e.target.value)} /></TableCell>
                          <TableCell className="text-center font-heading font-bold text-lg">{avg}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
