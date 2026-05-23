import {
  FileText,
  Receipt,
  CreditCard,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import Link from 'next/link'

interface SummaryCard {
  label:       string
  value:       number
  subtext:     string
  icon:        React.ElementType
  href:        string
  accentColor: 'navy' | 'steel' | 'warning' | 'danger' | 'success'
  trend?:      { value: string; positive: boolean }
}

const CARDS: SummaryCard[] = [
  {
    label:       'Total Quotation Sheets',
    value:       142,
    subtext:     '18 active this month',
    icon:        FileText,
    href:        '/dashboard/pi/qs',
    accentColor: 'navy',
  },
  {
    label:       'Active Invoices',
    value:       38,
    subtext:     '8 pending approval',
    icon:        Receipt,
    href:        '/dashboard/pi/invoice',
    accentColor: 'steel',
    trend:       { value: '+4 this week', positive: true },
  },
  {
    label:       'Pending Payments',
    value:       21,
    subtext:     'IDR 7.94 B total value',
    icon:        CreditCard,
    href:        '/dashboard/finance',
    accentColor: 'warning',
  },
  {
    label:       'Overdue Payments',
    value:       6,
    subtext:     'Requires immediate action',
    icon:        AlertTriangle,
    href:        '/dashboard/finance/overdue',
    accentColor: 'danger',
    trend:       { value: '+1 since yesterday', positive: false },
  },
  {
    label:       'Completed Shipments',
    value:       87,
    subtext:     '94 total processed',
    icon:        Package,
    href:        '/dashboard/pi/shipment',
    accentColor: 'success',
    trend:       { value: '+3 this week', positive: true },
  },
]

const ACCENT_STYLES = {
  navy:    {
    iconBg:   'bg-[#e8f3fb]',
    iconText: 'text-[#123d6b]',
    bar:      'bg-[#123d6b]',
    valueTxt: 'text-[#18273a]',
  },
  steel:   {
    iconBg:   'bg-[#edf5fb]',
    iconText: 'text-[#2d6495]',
    bar:      'bg-[#2d6495]',
    valueTxt: 'text-[#18273a]',
  },
  warning: {
    iconBg:   'bg-[#fdf7ed]',
    iconText: 'text-[#7a5000]',
    bar:      'bg-[#e0a020]',
    valueTxt: 'text-[#18273a]',
  },
  danger:  {
    iconBg:   'bg-[#fdecea]',
    iconText: 'text-[#8c1f1f]',
    bar:      'bg-[#8c1f1f]',
    valueTxt: 'text-[#8c1f1f]',
  },
  success: {
    iconBg:   'bg-[#eaf6f0]',
    iconText: 'text-[#1a5c38]',
    bar:      'bg-[#1a5c38]',
    valueTxt: 'text-[#18273a]',
  },
}

interface SummaryCardsProps {
  data?: {
    totalQS:            number
    activeInvoices:     number
    pendingPayments:    number
    overduePayments:    number
    completedShipments: number
  }
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const values = [
    data?.totalQS            ?? 0,
    data?.activeInvoices     ?? 0,
    data?.pendingPayments    ?? 0,
    data?.overduePayments    ?? 0,
    data?.completedShipments ?? 0,
  ]

  return (
    <div className="grid grid-cols-5 gap-4">
      {CARDS.map((card, idx) => {
        const styles = ACCENT_STYLES[card.accentColor]
        const value  = data ? values[idx] : card.value
        const Icon   = card.icon

        return (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              'card card-body flex flex-col gap-3 group',
              'hover:shadow-md hover:border-[#b5cede]',
              'transition-all duration-150',
              'relative overflow-hidden'
            )}
          >
            {/* Top accent bar */}
            <div className={cn('absolute top-0 left-0 right-0 h-[2px]', styles.bar)} />

            {/* Icon + label */}
            <div className="flex items-start justify-between">
              <div className={cn('p-2 rounded-md', styles.iconBg)}>
                <Icon size={15} className={styles.iconText} strokeWidth={1.8} />
              </div>
              {card.accentColor === 'danger' && value > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8c1f1f] text-white text-[10px] font-semibold">
                  {value}
                </span>
              )}
            </div>

            {/* Value */}
            <div>
              <p className={cn('text-[26px] font-semibold leading-none mb-1', styles.valueTxt)}>
                {formatNumber(value)}
              </p>
              <p className="text-[11px] font-medium text-[#3a5068] leading-tight">
                {card.label}
              </p>
            </div>

            {/* Sub info */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#edf1f5]">
              <p className="text-[11px] text-[#7a8fa3]">{card.subtext}</p>
              {card.trend && (
                <span className={cn(
                  'flex items-center gap-0.5 text-[10px] font-medium',
                  card.trend.positive ? 'text-[#1a5c38]' : 'text-[#8c1f1f]'
                )}>
                  {card.trend.positive
                    ? <TrendingUp size={10} strokeWidth={2} />
                    : <TrendingDown size={10} strokeWidth={2} />
                  }
                  {card.trend.value}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
