import { Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pelatihMenuItems = [
  { title: 'Dashboard', url: '/pelatih', icon: LayoutDashboard },
];

function PelatihSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <img
            src="/Madrasah Ibtidaiyah Al-Haq emblem.png"
            alt="Logo MI Al-Haq"
            className={`object-contain flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-8 h-8' : 'w-10 h-10'}`}
          />
          {!collapsed && (
            <div>
              <p className="text-base font-heading font-bold text-sidebar-foreground leading-tight">SIA MI Al-Haq</p>
              <p className="text-sm text-sidebar-foreground/70">Panel Pelatih</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu Pelatih</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pelatihMenuItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/pelatih'}
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

export default function PelatihLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PelatihSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">Selamat datang, Coach {user?.nama}</span>
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
    </SidebarProvider>
  );
}
