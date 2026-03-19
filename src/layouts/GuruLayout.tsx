import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, ClipboardList, BookOpen, Users, LogOut, GraduationCap, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const guruMenuItems = [
  { title: 'Dashboard', url: '/guru', icon: LayoutDashboard },
  { title: 'Absensi', url: '/guru/absensi', icon: ClipboardList },
  { title: 'Penilaian', url: '/guru/penilaian', icon: BookOpen },
  { title: 'Daftar Siswa', url: '/guru/siswa', icon: Users },
];

function GuruSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-heading font-bold text-sidebar-foreground">SIA SD Negeri 01</p>
              <p className="text-xs text-sidebar-foreground/70">Panel Guru</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {guruMenuItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/guru'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ChangePasswordDialog({ open, onSuccess }: { open: boolean; onSuccess: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setSaving(true);
    try {
      await api.post('/change-password', {
        currentPassword,
        newPassword,
        newPassword_confirmation: newPasswordConfirmation,
      });
      toast({ title: 'Berhasil', description: 'Password berhasil diubah!' });
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mengubah password';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <DialogTitle className="font-heading">Ubah Password</DialogTitle>
          </div>
          <DialogDescription>
            Anda menggunakan password default. Silakan ubah password Anda untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Password Lama</Label>
            <Input type="password" placeholder="Masukkan password lama" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <Input type="password" placeholder="Minimal 6 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <Input type="password" placeholder="Ulangi password baru" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full">
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan Password Baru
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GuruLayout() {
  const { user, logout, clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePasswordChanged = () => {
    clearMustChangePassword();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <GuruSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">Selamat datang, {user?.nama}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Keluar
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <ChangePasswordDialog
        open={!!user?.mustChangePassword}
        onSuccess={handlePasswordChanged}
      />
    </SidebarProvider>
  );
}
