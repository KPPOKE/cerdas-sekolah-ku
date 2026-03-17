import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import AcademicSetup from "./pages/admin/AcademicSetup";
import DataMaster from "./pages/admin/DataMaster";
import GuruLayout from "./layouts/GuruLayout";
import GuruDashboard from "./pages/guru/Dashboard";
import Attendance from "./pages/guru/Attendance";
import Grading from "./pages/guru/Grading";
import StudentList from "./pages/guru/StudentList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'admin' | 'guru' }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/guru'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-muted-foreground">Memuat sesi...</p></div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/guru'} replace /> : <Login />} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="pengguna" element={<UserManagement />} />
        <Route path="akademik" element={<AcademicSetup />} />
        <Route path="data-master" element={<DataMaster />} />
      </Route>

      <Route path="/guru" element={<ProtectedRoute role="guru"><GuruLayout /></ProtectedRoute>}>
        <Route index element={<GuruDashboard />} />
        <Route path="absensi" element={<Attendance />} />
        <Route path="penilaian" element={<Grading />} />
        <Route path="siswa" element={<StudentList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
