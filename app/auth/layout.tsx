// Auth layout — no sidebar, no topbar
// LoginPage handles its own full-screen layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
