import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);

    setIsLoading(false);
    if (success) {
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      navigate(stored.role === 'admin' ? '/admin' : stored.role === 'pelatih' ? '/pelatih' : '/guru');
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-3">
          <img
            src="/Madrasah Ibtidaiyah Al-Haq emblem.png"
            alt="Logo MI Al-Haq Jakarta"
            className="mx-auto w-20 h-20 object-contain"
          />
          <CardTitle className="font-heading text-2xl">Sistem Informasi Akademik</CardTitle>
          <CardDescription>MI Al-Haq Jakarta — Masuk ke akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="mt-4 pt-4 border-t text-center space-y-2">
              <p className="text-sm font-medium">Layanan Publik (PPDB)</p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link to="/ppdb/daftar" className="text-primary hover:underline">Pendaftaran Siswa Baru</Link>
                <Link to="/ppdb/pengumuman" className="text-primary hover:underline">Cek Kelulusan</Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
