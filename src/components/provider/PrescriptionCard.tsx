import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Prescription } from '@/types'
import { Pill, Calendar, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface PrescriptionCardProps {
  prescription: Prescription
  className?: string
}

const STATUS_STYLES = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  DISCONTINUED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

const ROUTE_LABELS: Record<string, string> = {
  ORAL: 'Oral',
  TOPICAL: 'Topical',
  INJECTION: 'Injection',
  INTRAVENOUS: 'Intravenous (IV)',
  SUBLINGUAL: 'Sublingual',
  RECTAL: 'Rectal',
  TRANSDERMAL: 'Transdermal',
  INHALATION: 'Inhalation',
  OPHTHALMIC: 'Ophthalmic (Eye)',
  OTIC: 'Otic (Ear)',
  NASAL: 'Nasal',
}

export default function PrescriptionCard({ prescription, className }: PrescriptionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{prescription.medicationName}</CardTitle>
          </div>
          <Badge className={STATUS_STYLES[prescription.status]}>{prescription.status.toLowerCase()}</Badge>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>
              Dr. {prescription.provider.firstName} {prescription.provider.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Prescribed {format(new Date(prescription.prescribedDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Discontinued Warning */}
        {prescription.status === 'DISCONTINUED' && prescription.discontinuedReason && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Discontinued</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">{prescription.discontinuedReason}</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dosage and Route */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Dosage</p>
            <p className="text-sm font-semibold text-foreground">{prescription.dosage}</p>
          </div>
          {prescription.route && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Route</p>
              <p className="text-sm font-semibold text-foreground">{ROUTE_LABELS[prescription.route] || prescription.route}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Frequency and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Frequency</p>
            <p className="text-sm text-foreground">{prescription.frequency}</p>
          </div>
          {prescription.duration && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
              <p className="text-sm text-foreground">{prescription.duration}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Quantity and Refills */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Quantity</p>
            <p className="text-sm text-foreground">{prescription.quantity}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Refills</p>
            <p className="text-sm text-foreground">{prescription.refills}</p>
          </div>
        </div>

        {/* Instructions */}
        {prescription.instructions && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Instructions</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{prescription.instructions}</p>
            </div>
          </>
        )}

        {/* Diagnosis */}
        {prescription.diagnosis && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Diagnosis / Indication</p>
              <p className="text-sm text-foreground">{prescription.diagnosis}</p>
            </div>
          </>
        )}

        {/* Expiration */}
        {prescription.expiresAt && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Expires</p>
              <p className="text-sm text-foreground">{format(new Date(prescription.expiresAt), 'MMM dd, yyyy')}</p>
            </div>
          </>
        )}

        {/* Pharmacy Notes */}
        {prescription.pharmacyNotes && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Pharmacy Notes</p>
              <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{prescription.pharmacyNotes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
