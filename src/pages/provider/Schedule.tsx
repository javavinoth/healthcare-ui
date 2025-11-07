import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Settings, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react'
import WeeklyScheduleEditor from '@/components/provider/WeeklyScheduleEditor'
import TimeOffList from '@/components/provider/TimeOffList'
import ProviderSettingsForm from '@/components/provider/ProviderSettingsForm'
import { providerApi } from '@/lib/api'

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('availability')

  // Fetch provider settings to check schedule status
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: providerApi.getProviderSettings,
  })

  // Check if schedule is configured (at least one day is active)
  const isScheduleConfigured = settings?.availability?.some((day: any) => day.isActive) || false
  const activeDaysCount = settings?.availability?.filter((day: any) => day.isActive).length || 0

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your weekly availability, time-off requests, and appointment settings
        </p>
      </div>

      {/* Schedule Status Banners */}
      {!settingsLoading && (
        <div className="mb-6 space-y-3">
          {/* Warning: No schedule configured */}
          {!isScheduleConfigured && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-warning/90 mb-1">No Available Time Slots</p>
                <p className="text-sm text-warning/80">
                  You currently have no days enabled in your schedule. Patients will not be able to book
                  appointments with you. Use the "Quick Actions" below to quickly set up your availability.
                </p>
              </div>
            </div>
          )}

          {/* Success: Schedule is configured */}
          {isScheduleConfigured && (
            <div className="bg-wellness/10 border border-wellness/20 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-wellness flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-wellness/90 mb-1">Schedule Active</p>
                <p className="text-sm text-wellness/80">
                  You have <strong>{activeDaysCount}</strong> {activeDaysCount === 1 ? 'day' : 'days'} enabled.
                  Patients can book appointments during your available hours.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Weekly Availability</span>
            <span className="sm:hidden">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="timeoff" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Time Off</span>
            <span className="sm:hidden">Time Off</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Availability Schedule
              </CardTitle>
              <CardDescription>
                Set your working hours for each day of the week. Patients can only book appointments during your available hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyScheduleEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Time Off Requests
              </CardTitle>
              <CardDescription>
                Request time off for vacations, conferences, or personal days. Pending requests require admin approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeOffList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Appointment Settings
              </CardTitle>
              <CardDescription>
                Configure your appointment slot duration. This determines how long each appointment booking will be.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
