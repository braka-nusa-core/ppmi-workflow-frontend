import Link from 'next/link'
import { FileX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f5]">
      <div className="text-center">
        <FileX size={40} className="text-[#ced3d9] mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-[#232b34] mb-2">Page Not Found</h1>
        <p className="text-sm text-[#9aa3ad] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          href="/dashboard/overview"
          className="btn btn-primary"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
