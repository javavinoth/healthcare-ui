import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Settings, Briefcase } from 'lucide-react'
import WeeklyScheduleEditor from '@/components/provider/WeeklyScheduleEditor'
import TimeOffList from '@/components/provider/TimeOffList'
import ProviderSettingsForm from '@/components/provider/ProviderSettingsForm'

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('availability')

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your weekly availability, time-off requests, and appointment settings
        </p>
      </div>

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
