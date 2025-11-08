import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppHeader from '@/components/shared/AppHeader'
import { Calendar, FileText, MessageSquare, Activity, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'

/**
 * Main Dashboard Component
 * Role-aware landing page after login
 */
export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Handle Manage Appointments button - role-aware navigation
  const handleManageAppointments = () => {
    if (user?.role === 'patient') {
      navigate('/patient/appointments')
    } else if (user?.role === 'doctor' || user?.role === 'nurse') {
      navigate('/provider/appointments')
    } else if (user?.role === 'admin') {
      toast({
        title: 'Coming Soon',
        description: 'Admin appointment management is coming soon!',
        variant: 'info',
      })
    } else {
      navigate('/patient/appointments')
    }
  }

  // Handle View Records button
  const handleViewRecords = () => {
    toast({
      title: 'Medical Records',
      description: 'Medical records viewer coming soon!',
      variant: 'info',
    })
  }

  // Handle View Messages button - role-aware navigation
  const handleViewMessages = () => {
    if (user?.role === 'patient') {
      navigate('/patient/messages')
    } else if (user?.role === 'doctor' || user?.role === 'nurse') {
      navigate('/provider/messages')
    } else if (user?.role === 'receptionist') {
      navigate('/receptionist/messages')
    } else if (user?.role === 'billing_staff') {
      navigate('/billing/messages')
    } else if (user?.role === 'admin') {
      // Admins can use any messaging interface, default to patient view
      navigate('/patient/messages')
    } else {
      toast({
        title: 'Messages',
        description: 'Messaging not available for your role',
        variant: 'info',
      })
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Healthcare Portal" />

      <div className="flex-1 overflow-auto">
        {/* Welcome Section */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="container mx-auto px-4 py-6">
            <div>
              <h1 className="text-h2 text-neutral-blue-gray font-bold">
                Welcome back, {user.firstName} {user.lastName}!
              </h1>
              <p className="text-sm text-neutral-blue-gray/70 mt-1 capitalize">
                Role: {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <section className="mb-12">
            <h2 className="text-h1 mb-4">Dashboard</h2>
            <p className="text-body text-neutral-blue-gray">
              Welcome to your personalized healthcare dashboard. Access your information securely.
            </p>
          </section>

          {/* Feature Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Appointments Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary-light/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Appointments</CardTitle>
                </div>
                <CardDescription>Book, reschedule, or cancel appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleManageAppointments}>
                  Manage Appointments
                </Button>
              </CardContent>
            </Card>

            {/* Medical Records Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-wellness/10 rounded-lg">
                    <FileText className="h-6 w-6 text-wellness" />
                  </div>
                  <CardTitle>Medical Records</CardTitle>
                </div>
                <CardDescription>View your lab results and visit notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={handleViewRecords}>
                  View Records
                </Button>
              </CardContent>
            </Card>

            {/* Messages Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-info/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-info" />
                  </div>
                  <CardTitle>Messages</CardTitle>
                </div>
                <CardDescription>Communicate with your healthcare team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={handleViewMessages}>
                  View Messages
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* User Info */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-body">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="badge-success">Active</div>
                <p className="text-small text-muted-foreground mt-2">Account verified</p>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-body">Security</CardTitle>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="badge-success">2FA Enabled</div>
                <p className="text-small text-muted-foreground mt-2">HIPAA Compliant</p>
              </CardContent>
            </Card>

            {/* Role Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-body">Your Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-h4 font-semibold capitalize text-primary">{user.role}</p>
                <p className="text-small text-muted-foreground mt-1">
                  {user.permissions?.length || 0} permissions
                </p>
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-body">Health Score</CardTitle>
                  <Activity className="h-5 w-5 text-wellness" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-h2 font-bold text-wellness">95%</div>
                <p className="text-small text-muted-foreground mt-1">Excellent</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
