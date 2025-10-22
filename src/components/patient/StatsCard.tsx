import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
  iconBgColor?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-neutral-blue-gray/70">{title}</p>
            <p className="text-2xl font-bold text-neutral-blue-gray">{value}</p>
            {description && (
              <p className="text-xs text-neutral-blue-gray/60">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={`font-medium ${
                    trend.isPositive ? 'text-wellness' : 'text-error'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-neutral-blue-gray/60">from last month</span>
              </div>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
