'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  Anchor,
  FileText,
  CreditCard,
  Package,
  Lock,
  CheckCircle,
} from 'lucide-react'
import { MarineIllustration } from '@/components/ui/MarineIllustration'
import { LoginForm } from '@/components/auth/LoginForm'
import type { LoginFormData } from '@/lib/validations'

// ─── Animation Variants ──────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0, 0, 1] } },
}

// ─── Workflow steps shown on left panel ──────────────────────────
const WORKFLOW_STEPS = [
  { icon: FileText,  label: 'Quotation Sheet' },
  { icon: FileText,  label: 'Invoice' },
  { icon: CreditCard,label: 'Voucher' },
  { icon: CreditCard,label: 'Payment' },
  { icon: Package,   label: 'Shipment' },
]

// ─── Stats ───────────────────────────────────────────────────────
const STATS = [
  { value: '2', label: 'Divisions' },
  { value: '5',  label: 'Workflow Stages' },
  { value: '4',  label: 'Access Roles' },
]

// ─── LoginPage Component ─────────────────────────────────────────
export default function LoginPage() {
  const handleLogin = async (data: LoginFormData) => {
    // Auth will be wired to AuthContext.login() once backend is ready
    // Simulate network delay for now
    await new Promise((res) => setTimeout(res, 1200))
    console.log('Login attempt:', data.email)
    // throw new Error('Invalid credentials') // uncomment to test error state
  }

  return (
    <div className="min-h-screen w-full flex" style={{ background: '#f0f4f7' }}>

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — Marine Corporate Branding
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.40, ease: [0.2, 0, 0, 1] }}
        className="hidden lg:flex flex-col w-[520px] xl:w-[580px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #071e35 0%, #0d2d50 40%, #123d6b 75%, #174e87 100%)' }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(45, 119, 186, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 10%, rgba(93, 159, 209, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        {/* Top: Logo + Brand */}
        <div className="relative z-10 px-10 pt-10 pb-6">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.20)',
              }}
            >
              <Anchor size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-semibold text-[17px] leading-tight tracking-tight">
                PPMI Flow
              </p>
              <p
                className="text-[11px] leading-tight font-medium"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                Operational Management System
              </p>
            </div>
          </div>
        </div>

        {/* Marine Illustration */}
        <div className="relative z-10 px-6 flex-shrink-0">
          <MarineIllustration className="w-full h-auto max-h-[220px] xl:max-h-[260px] opacity-90" />
        </div>

        {/* Main Copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-10 py-6 flex-1"
        >
          <motion.h1
            variants={itemVariants}
            className="text-white text-[24px] xl:text-[26px] font-semibold leading-tight tracking-tight mb-2"
          >
            Marine Insurance<br />Operations Platform
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[13px] leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.60)' }}
          >
            Internal enterprise system for PT Pandi Proteksi Marine Indonesia —
            managing P&amp;I and H&amp;M division workflows from quotation to shipment.
          </motion.p>

          {/* Workflow pipeline indicator */}
          <motion.div variants={itemVariants} className="mb-8">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              Operational Workflow
            </p>
            <div className="flex items-center gap-0">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isLast = idx === WORKFLOW_STEPS.length - 1
                const labels = ['QS', 'Invoice', 'Voucher', 'Payment', 'Shipment']
                return (
                  <div key={step.label} className="flex items-center">
                    <div
                      className="flex flex-col items-center gap-1"
                      style={{ minWidth: 52 }}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: idx < 3
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        <step.icon
                          size={13}
                          style={{
                            color: idx < 3
                              ? 'rgba(255,255,255,0.90)'
                              : 'rgba(255,255,255,0.40)',
                          }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-medium text-center leading-tight"
                        style={{
                          color: idx < 3
                            ? 'rgba(255,255,255,0.70)'
                            : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {labels[idx]}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className="w-4 h-px flex-shrink-0 mb-4"
                        style={{
                          background: idx < 2
                            ? 'rgba(255,255,255,0.30)'
                            : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-6"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-xl font-semibold text-white leading-tight"
                >
                  {stat.value}
                </span>
                <span
                  className="text-[10px] font-medium leading-tight mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom: Company name */}
        <div
          className="relative z-10 px-10 py-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p
            className="text-[11px] font-medium"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            PT Pandi Proteksi Marine Indonesia
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Internal System · Authorized Personnel Only
          </p>
        </div>
      </motion.div>


      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">

        {/* Subtle top right badge — internal system */}
        <div className="absolute top-6 right-6 hidden sm:flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#4caf6e' }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: '#7a8fa3' }}
          >
            Internal Access
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1], delay: 0.10 }}
          className="w-full max-w-[400px]"
        >

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: '#123d6b' }}
            >
              <Anchor size={16} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#18273a] leading-tight">PPMI Flow</p>
              <p className="text-[11px] text-[#7a8fa3]">PT Pandi Proteksi Marine Indonesia</p>
            </div>
          </div>

          {/* Form card */}
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #d5e3ef',
              boxShadow: '0 4px 24px rgba(7,25,52,0.08), 0 1px 4px rgba(7,25,52,0.06)',
            }}
          >
            {/* Card header */}
            <div
              className="px-8 pt-8 pb-6"
              style={{ borderBottom: '1px solid #edf1f5' }}
            >
              <h2
                className="text-[20px] font-semibold leading-tight tracking-tight mb-1"
                style={{ color: '#18273a' }}
              >
                Sign in to your account
              </h2>
              <p className="text-[13px]" style={{ color: '#7a8fa3' }}>
                Enter your credentials to access PPMI Flow
              </p>
            </div>

            {/* Form body */}
            <div className="px-8 py-7">
              <LoginForm onSubmit={handleLogin} />
            </div>

            {/* Security notice */}
            <div
              className="px-8 py-5"
              style={{ background: '#f7f9fb', borderTop: '1px solid #edf1f5' }}
            >
              <div className="flex items-start gap-2.5">
                <Shield
                  size={13}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: '#7a8fa3' }}
                />
                <p className="text-[11px] leading-relaxed" style={{ color: '#7a8fa3' }}>
                  This is a secure internal system. All access is logged and monitored.
                  Unauthorized access is strictly prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Below card — support link */}
          <div className="mt-5 flex items-center justify-center gap-1">
            <Lock size={11} style={{ color: '#b5cede' }} />
            <p className="text-[11px]" style={{ color: '#b5cede' }}>
              Need access?{' '}
              <a
                href="mailto:it@ppmi.co.id"
                className="font-medium hover:underline transition-colors duration-100"
                style={{ color: '#7a8fa3' }}
              >
                Contact IT Department
              </a>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {[
              { icon: Shield,       label: 'Secure login' },
              { icon: Lock,         label: 'Encrypted session' },
              { icon: CheckCircle,  label: 'Access controlled' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5"
              >
                <Icon size={11} style={{ color: '#b5cede' }} />
                <span className="text-[10px]" style={{ color: '#b5cede' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  )
}
