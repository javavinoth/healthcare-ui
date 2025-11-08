import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Shield, AlertCircle, Pill } from 'lucide-react'
import type { PatientDetail } from '@/types'
import { format } from 'date-fns'

interface PatientOverviewProps {
  patient: PatientDetail
}

export default function PatientOverview({ patient }: PatientOverviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    try {
      return format(new Date(dateString), 'MMMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'Not specified'
    const labels: Record<string, string> = {
      MALE: 'Male',
      FEMALE: 'Female',
      OTHER: 'Other',
      PREFER_NOT_TO_SAY: 'Prefer not to say',
    }
    return labels[gender] || gender
  }

  const formatAddress = () => {
    const { address } = patient
    if (!address?.line1) return 'Not provided'

    const parts = [
      address.line1,
      address.line2,
      address.city && address.state
        ? `${address.city}, ${address.state} ${address.zipCode || ''}`.trim()
        : address.city || address.state,
    ].filter(Boolean)

    return parts.join(', ')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demographics & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Demographics & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="mt-1">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Medical Record Number
              </label>
              <p className="mt-1 font-mono">{patient.medicalRecordNumber || 'Not assigned'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <p className="mt-1">{formatDate(patient.dateOfBirth)}</p>
              {patient.age && (
                <p className="text-sm text-muted-foreground">{patient.age} years old</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="mt-1">{getGenderLabel(patient.gender)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <p className="mt-1">{patient.email || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            <p className="mt-1">{patient.phoneNumber || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </label>
            <p className="mt-1 text-sm">{formatAddress()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Emergency Contact */}
      <div className="space-y-6">
        {/* Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Provider</label>
              <p className="mt-1">{patient.insurance?.provider || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                <p className="mt-1 font-mono text-sm">{patient.insurance?.policyNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Group Number</label>
                <p className="mt-1 font-mono text-sm">{patient.insurance?.groupNumber || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="mt-1">{patient.emergencyContact?.name || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="mt-1">{patient.emergencyContact?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                <p className="mt-1 capitalize">{patient.emergencyContact?.relationship || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Allergies
            </label>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="font-normal">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Current Medications
            </label>
            {patient.currentMedications && patient.currentMedications.length > 0 ? (
              <ul className="space-y-1">
                {patient.currentMedications.map((medication, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{medication}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No current medications</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
