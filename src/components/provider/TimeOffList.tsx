import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Calendar, X, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import TimeOffRequestDialog from './TimeOffRequestDialog'

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  DENIED: {
    label: 'Denied',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: X,
  },
}

const REASON_LABELS: Record<string, string> = {
  VACATION: 'Vacation',
  SICK_LEAVE: 'Sick Leave',
  PERSONAL: 'Personal',
  CONFERENCE: 'Conference / Training',
  OTHER: 'Other',
}

export default function TimeOffList() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch time-off requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['provider', 'timeoff'],
    queryFn: providerApi.getTimeOffRequests,
  })

  // Cancel time-off request mutation
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => providerApi.cancelTimeOffRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'timeoff'] })
      toast({
        title: 'Request Cancelled',
        description: 'Your time-off request has been cancelled.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.response?.data?.message || 'Failed to cancel request. Please try again.',
        variant: 'destructive',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {requests?.length || 0} time-off {requests?.length === 1 ? 'request' : 'requests'}
        </p>
        <TimeOffRequestDialog />
      </div>

      {!requests || requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Time-Off Requests</h3>
          <p className="text-gray-600 mb-6">You haven't requested any time off yet.</p>
          <TimeOffRequestDialog />
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusConfig.icon
            const canCancel = request.status === 'PENDING'

            return (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {format(new Date(request.startDate), 'MMM dd, yyyy')} -{' '}
                            {format(new Date(request.endDate), 'MMM dd, yyyy')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {request.durationDays} {request.durationDays === 1 ? 'day' : 'days'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {REASON_LABELS[request.reason] || request.reason}
                        </p>
                        {request.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{request.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-8">
                      <Badge className={statusConfig.color + ' flex items-center gap-1 px-2 py-1'}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      {request.approvedByName && (
                        <span className="text-xs text-gray-500">by {request.approvedByName}</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 pl-8">
                      Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Time-Off Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this time-off request? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep it</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate(request.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {cancelMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Yes, cancel request
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
