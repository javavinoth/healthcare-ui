import { Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  label: string
  completed: boolean
  required: boolean
}

interface HospitalCompletionChecklistProps {
  hasLocation: boolean
  hasDepartments: boolean
  hasContactEmail: boolean
  hasWebsite: boolean
  className?: string
}

/**
 * Hospital Completion Checklist Component
 * Displays a checklist of requirements for hospital admin to complete before marking ready for review
 *
 * Required items:
 * - Location details (must be present)
 * - At least 1 department (must be present)
 *
 * Optional items:
 * - Contact email
 * - Website
 *
 * @example
 * <HospitalCompletionChecklist
 *   hasLocation={true}
 *   hasDepartments={false}
 *   hasContactEmail={true}
 *   hasWebsite={false}
 * />
 */
export function HospitalCompletionChecklist({
  hasLocation,
  hasDepartments,
  hasContactEmail,
  hasWebsite,
  className,
}: HospitalCompletionChecklistProps) {
  const checklistItems: ChecklistItem[] = [
    {
      label: 'Basic Information',
      completed: true, // Always complete after hospital creation
      required: true,
    },
    {
      label: 'Location Details',
      completed: hasLocation,
      required: true,
    },
    {
      label: 'At least 1 Department',
      completed: hasDepartments,
      required: true,
    },
    {
      label: 'Contact Email',
      completed: hasContactEmail,
      required: false,
    },
    {
      label: 'Website',
      completed: hasWebsite,
      required: false,
    },
  ]

  const requiredItems = checklistItems.filter((item) => item.required)
  const completedRequired = requiredItems.filter((item) => item.completed).length
  const totalRequired = requiredItems.length
  const allRequiredComplete = completedRequired === totalRequired

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Completion Checklist</CardTitle>
        <CardDescription>
          {allRequiredComplete ? (
            <span className="text-wellness font-medium">
              All required items completed! Ready to mark for review.
            </span>
          ) : (
            <span>
              Complete all required items before marking hospital ready for review (
              {completedRequired}/{totalRequired})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0',
                  item.completed
                    ? 'bg-wellness text-white'
                    : item.required
                      ? 'bg-neutral-blue-gray/20 text-neutral-blue-gray'
                      : 'bg-neutral-blue-gray/10 text-neutral-blue-gray/50'
                )}
                aria-label={item.completed ? 'Completed' : 'Not completed'}
              >
                {item.completed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.completed ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                  {!item.required && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!allRequiredComplete && (
          <div className="mt-4 rounded-md bg-warning/10 p-3 border border-warning/20">
            <p className="text-sm text-warning-foreground">
              <span className="font-semibold">Note:</span> You must complete all required items
              before you can mark the hospital as ready for review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
