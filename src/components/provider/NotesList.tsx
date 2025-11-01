import { useQuery } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import SOAPNoteCard from './SOAPNoteCard'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, AlertCircle } from 'lucide-react'

interface NotesListProps {
  patientId: string
}

export default function NotesList({ patientId }: NotesListProps) {
  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ['provider', 'patients', patientId, 'notes'],
    queryFn: () => providerApi.getPatientVisitNotes(patientId),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Visit Notes</h3>
        <p className="text-sm text-muted-foreground">
          {(error as any)?.response?.data?.message || 'Failed to load visit notes. Please try again.'}
        </p>
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Visit Notes</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          No clinical visit notes have been created for this patient yet. Click "Add Visit Note" to create one.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <SOAPNoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}
