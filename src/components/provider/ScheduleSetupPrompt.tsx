import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface ScheduleSetupPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDismiss: () => void
}

/**
 * ScheduleSetupPrompt - Modal dialog prompting new providers to set up their availability
 * Shows on first login when schedule has not been configured
 */
export default function ScheduleSetupPrompt({
  open,
  onOpenChange,
  onDismiss,
}: ScheduleSetupPromptProps) {
  const navigate = useNavigate()

  const handleSetupNow = () => {
    onOpenChange(false)
    navigate('/provider/schedule')
  }

  const handleRemindLater = () => {
    onDismiss()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Welcome! Set Up Your Availability</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Before patients can book appointments with you, you need to configure your weekly
            availability schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Why it's important */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div className="text-sm text-info/90">
                <p className="font-semibold mb-2">Why is this important?</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Patients can only book appointments during your available hours</li>
                  <li>Your schedule controls which time slots appear in the booking system</li>
                  <li>You can update your availability anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick setup info */}
          <div className="bg-wellness/10 border border-wellness/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-wellness flex-shrink-0 mt-0.5" />
              <div className="text-sm text-wellness/90">
                <p className="font-semibold mb-2">Quick & Easy Setup</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Takes less than 2 minutes</li>
                  <li>Use quick templates like "Business Hours" (Mon-Fri 9-5)</li>
                  <li>Customize each day individually</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What you'll configure */}
          <div className="flex items-start gap-3 px-4">
            <Clock className="h-5 w-5 text-neutral-blue-gray/50 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-blue-gray/70">
              <p className="font-medium mb-1">You'll configure:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Which days of the week you're available</li>
                <li>Your working hours for each day</li>
                <li>Days you want to keep OFF</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleRemindLater}>
            Remind Me Later
          </Button>
          <Button onClick={handleSetupNow} className="gap-2">
            <Calendar className="h-4 w-4" />
            Set Up Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
