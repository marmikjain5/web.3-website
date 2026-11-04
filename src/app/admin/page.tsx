import { checkAdminSession } from '@/app/actions/admin'
import AdminDashboard from './AdminDashboard'
import AdminGate from './AdminGate'

export default async function AdminPage() {
  const isAuthenticated = await checkAdminSession();

  return (
    <main className="min-h-screen bg-background text-foreground pt-20 sm:pt-24 px-4 sm:px-6 md:px-12 pb-16 relative overflow-hidden lab-grid-bg">
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,85,0,0.06),transparent_50%)] pointer-events-none" />

      {isAuthenticated ? <AdminDashboard /> : <AdminGate />}
    </main>
  );
}
