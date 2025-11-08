import { format } from 'date-fns'
import { FileText, Download, Eye, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MedicalRecord, MedicalRecordType } from '@/types'

interface MedicalRecordCardProps {
  record: MedicalRecord
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  compact?: boolean
}

const recordTypeConfig: Record<
  MedicalRecordType,
  { icon: typeof FileText; label: string; color: string }
> = {
  lab_result: { icon: FileText, label: 'Lab Result', color: 'text-info' },
  imaging: { icon: FileText, label: 'Imaging', color: 'text-primary' },
  visit_note: { icon: FileText, label: 'Visit Note', color: 'text-neutral-blue-gray' },
  prescription: { icon: FileText, label: 'Prescription', color: 'text-wellness' },
  immunization: { icon: FileText, label: 'Immunization', color: 'text-success' },
  procedure_note: { icon: FileText, label: 'Procedure', color: 'text-warning' },
  discharge_summary: { icon: FileText, label: 'Discharge Summary', color: 'text-primary' },
}

export default function MedicalRecordCard({
  record,
  onView,
  onDownload,
  compact = false,
}: MedicalRecordCardProps) {
  const recordDate = new Date(record.date)
  const typeConfig = recordTypeConfig[record.type]
  const IconComponent = typeConfig.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ${typeConfig.color}`}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          {/* Record Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-neutral-blue-gray">{record.title}</h3>
                  {record.isNew && (
                    <Badge variant="info" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-blue-gray/70">
                  {typeConfig.label} • {format(recordDate, 'MMM d, yyyy')}
                </p>
              </div>
              <Badge
                variant={
                  record.status === 'final'
                    ? 'success'
                    : record.status === 'preliminary'
                      ? 'warning'
                      : 'secondary'
                }
              >
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge>
            </div>

            {/* Provider */}
            <div className="flex items-center gap-2 text-sm text-neutral-blue-gray/80">
              <User className="h-4 w-4" />
              <span>Dr. {record.provider}</span>
            </div>

            {/* Summary */}
            {record.summary && !compact && (
              <p className="text-sm text-neutral-blue-gray/70 line-clamp-2 pt-1">
                {record.summary}
              </p>
            )}

            {/* Category */}
            {record.category && (
              <p className="text-xs text-neutral-blue-gray/60">Category: {record.category}</p>
            )}

            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
              <p className="text-xs text-neutral-blue-gray/60">
                {record.attachments.length} attachment{record.attachments.length > 1 ? 's' : ''}
              </p>
            )}

            {/* Actions */}
            {!compact && (onView || onDownload) && (
              <div className="flex gap-2 pt-2">
                {onView && (
                  <Button size="sm" variant="outline" onClick={() => onView(record.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                {onDownload && (
                  <Button size="sm" variant="outline" onClick={() => onDownload(record.id)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
