import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-shell">
      <Topbar />
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
    </div>
  )
}
