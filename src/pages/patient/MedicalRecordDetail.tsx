import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  User,
  Download,
  Paperclip,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { medicalRecordsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import type { MedicalRecordType } from '@/types'

const recordTypeConfig: Record<MedicalRecordType, { label: string; color: string }> = {
  lab_result: { label: 'Lab Result', color: 'text-info' },
  imaging: { label: 'Imaging', color: 'text-primary' },
  visit_note: { label: 'Visit Note', color: 'text-neutral-blue-gray' },
  prescription: { label: 'Prescription', color: 'text-wellness' },
  immunization: { label: 'Immunization', color: 'text-success' },
  procedure_note: { label: 'Procedure', color: 'text-warning' },
  discharge_summary: { label: 'Discharge Summary', color: 'text-primary' },
}

/**
 * Medical Record Detail Page
 * View detailed information about a medical record
 */
export default function MedicalRecordDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Fetch medical record details
  const {
    data: medicalRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['medical-record', id],
    queryFn: async () => {
      if (!id) throw new Error('Medical record ID is required')
      const record = await medicalRecordsApi.getById(id)
      // Mark as read when viewing
      medicalRecordsApi.markAsRead(id).catch(() => {
        // Ignore errors for marking as read
      })
      return record
    },
    enabled: !!id,
  })

  const handleDownload = async () => {
    if (!id) return

    try {
      const blob = await medicalRecordsApi.download(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medical-record-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download started',
        description: 'Your medical record is being downloaded.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download medical record. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDownloadAttachment = (url: string, name: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: 'Download started',
      description: `Downloading ${name}`,
      variant: 'success',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !medicalRecord) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-error mb-4">Failed to load medical record details.</p>
            <Button onClick={() => navigate('/patient/medical-records')}>
              Back to Medical Records
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const recordDate = new Date(medicalRecord.date)
  const typeConfig = recordTypeConfig[medicalRecord.type]

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="bg-white border-b border-neutral-blue-gray/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/medical-records')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-h1 text-neutral-blue-gray">Medical Record</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-h2">{medicalRecord.title}</CardTitle>
                  {medicalRecord.isNew && (
                    <Badge variant="info" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-blue-gray/70">
                  <span className={typeConfig.color}>{typeConfig.label}</span>
                  <span>•</span>
                  <span>{medicalRecord.category}</span>
                </div>
              </div>
              <Badge
                variant={
                  medicalRecord.status === 'final'
                    ? 'success'
                    : medicalRecord.status === 'preliminary'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {medicalRecord.status.charAt(0).toUpperCase() + medicalRecord.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Record Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-blue-gray/70">Date</p>
                    <p className="text-base text-neutral-blue-gray">
                      {format(recordDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-blue-gray/70">Provider</p>
                    <p className="text-base text-neutral-blue-gray">Dr. {medicalRecord.provider}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {medicalRecord.summary && (
              <div className="pt-4 border-t">
                <h3 className="text-h4 text-neutral-blue-gray mb-2">Summary</h3>
                <p className="text-base text-neutral-blue-gray/80 whitespace-pre-wrap">
                  {medicalRecord.summary}
                </p>
              </div>
            )}

            {/* Content */}
            {medicalRecord.content && (
              <div className="pt-4 border-t">
                <h3 className="text-h4 text-neutral-blue-gray mb-2">Details</h3>
                <div className="text-base text-neutral-blue-gray/80 whitespace-pre-wrap">
                  {medicalRecord.content}
                </div>
              </div>
            )}

            {/* Attachments */}
            {medicalRecord.attachments && medicalRecord.attachments.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-h4 text-neutral-blue-gray mb-3">Attachments</h3>
                <div className="space-y-2">
                  {medicalRecord.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-neutral-light rounded-lg border border-neutral-blue-gray/10"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-neutral-blue-gray/70" />
                        <div>
                          <p className="text-sm font-medium text-neutral-blue-gray">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-neutral-blue-gray/60">
                            {(attachment.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDownloadAttachment(attachment.url, attachment.name)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
