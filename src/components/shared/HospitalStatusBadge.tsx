import type { HospitalStatus } from '@/types'
import { Badge } from '@/components/ui/badge'

interface HospitalStatusBadgeProps {
  status: HospitalStatus
  className?: string
}

interface StatusConfig {
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'
  label: string
  icon: string
}

const statusConfigs: Record<HospitalStatus, StatusConfig> = {
  PENDING: {
    variant: 'warning',
    label: 'Pending',
    icon: '⏳',
  },
  READY_FOR_REVIEW: {
    variant: 'info',
    label: 'Ready for Review',
    icon: '📋',
  },
  ACTIVE: {
    variant: 'success',
    label: 'Active',
    icon: '✓',
  },
  INACTIVE: {
    variant: 'secondary',
    label: 'Inactive',
    icon: '○',
  },
  UNDER_CONSTRUCTION: {
    variant: 'default',
    label: 'Under Construction',
    icon: '🏗',
  },
  TEMPORARILY_CLOSED: {
    variant: 'destructive',
    label: 'Temporarily Closed',
    icon: '🚫',
  },
}

/**
 * Hospital Status Badge Component
 * Displays hospital status with appropriate color, icon, and label
 *
 * @example
 * <HospitalStatusBadge status="PENDING" />
 * <HospitalStatusBadge status="ACTIVE" />
 */
export function HospitalStatusBadge({ status, className }: HospitalStatusBadgeProps) {
  const config = statusConfigs[status]

  if (!config) {
    console.warn(`Unknown hospital status: ${status}`)
    return null
  }

  return (
    <Badge variant={config.variant} className={className}>
      <span className="mr-1" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </Badge>
  )
}
