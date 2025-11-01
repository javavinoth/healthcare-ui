import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { VisitNote } from '@/types'
import { FileText, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

interface SOAPNoteCardProps {
  note: VisitNote
  className?: string
}

export default function SOAPNoteCard({ note, className }: SOAPNoteCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Visit Note</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {format(new Date(note.createdAt), 'MMM dd, yyyy')}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>
              Dr. {note.provider.firstName} {note.provider.lastName}
            </span>
          </div>
          {note.provider.specialty && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>{note.provider.specialty}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(note.createdAt), 'h:mm a')}</span>
          </div>
        </div>

        {/* Chief Complaint */}
        {note.chiefComplaint && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium text-foreground">Chief Complaint</p>
            <p className="text-sm text-muted-foreground mt-1">{note.chiefComplaint}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subjective */}
        {note.subjective && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                S
              </span>
              Subjective
            </h4>
            <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">{note.subjective}</p>
          </div>
        )}

        {/* Objective */}
        {note.objective && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  O
                </span>
                Objective
              </h4>
              <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">{note.objective}</p>
            </div>
          </>
        )}

        {/* Assessment */}
        <Separator />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
              A
            </span>
            Assessment
          </h4>
          <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">{note.assessment}</p>
        </div>

        {/* Plan */}
        <Separator />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
              P
            </span>
            Plan
          </h4>
          <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">{note.plan}</p>
        </div>

        {/* Diagnosis Codes */}
        {note.diagnosisCodes && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">ICD-10 Codes</p>
              <div className="flex flex-wrap gap-2 ml-0">
                {note.diagnosisCodes.split(',').map((code, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {code.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
