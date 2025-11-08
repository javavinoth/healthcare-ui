import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-blue-gray/10 mb-4">
        <Icon className="h-10 w-10 text-neutral-blue-gray/50" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-blue-gray mb-2">{title}</h3>
      <p className="text-sm text-neutral-blue-gray/70 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
