import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

const ADMIN_GUARDS_DISABLED = false

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!ADMIN_GUARDS_DISABLED) {
    if (!user) {
      redirect('/')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      redirect('/')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 px-6 md:px-12 pb-16 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]" />

      <AdminDashboard />
    </main>
  )
}
