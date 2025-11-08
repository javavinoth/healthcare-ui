import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Calendar, FileText, MessageSquare, Activity, Shield } from 'lucide-react'

/**
 * Healthcare Application
 * Professional healthcare web application with industry-leading UI/UX
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-light">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        {/* Header */}
        <header className="bg-primary text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8" />
                <div>
                  <h1 className="text-h2 text-white font-bold">Healthcare Portal</h1>
                  <p className="text-sm text-primary-light">Your Health, Our Priority</p>
                </div>
              </div>
              <nav className="flex gap-4">
                <Button variant="ghost" className="text-white hover:bg-primary-dark">
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Patient Portal
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 py-12">
          {/* Welcome Section */}
          <section className="mb-12 text-center">
            <h2 className="text-h1 mb-4">Welcome to Your Healthcare Dashboard</h2>
            <p className="text-body text-neutral-blue-gray max-w-2xl mx-auto">
              Access your medical records, book appointments, and communicate with your healthcare
              providers - all in one secure platform designed with your privacy and accessibility in
              mind.
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
                <CardDescription>
                  Book, reschedule, or cancel appointments with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Schedule Appointment</Button>
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
                <CardDescription>View your lab results, imaging, and visit notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
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
                  <CardTitle>Secure Messaging</CardTitle>
                </div>
                <CardDescription>Communicate securely with your healthcare team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Status Indicators Demo */}
          <section className="mb-12">
            <h3 className="text-h3 mb-6">Design System Showcase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Metrics */}
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

              {/* Security Status */}
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

              {/* Alert Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-body">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="badge-info">Lab results ready</div>
                  <div className="badge-warning">Appointment reminder</div>
                </CardContent>
              </Card>

              {/* Button Variants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-body">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" className="w-full">
                    Primary
                  </Button>
                  <Button size="sm" variant="success" className="w-full">
                    Success
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Outline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Alert Examples */}
          <section className="space-y-4">
            <h3 className="text-h3 mb-4">Alert Components</h3>
            <div className="alert alert-success">
              <strong>Success!</strong> Your appointment has been confirmed for October 25, 2025 at
              2:00 PM.
            </div>
            <div className="alert alert-info">
              <strong>Information:</strong> Your lab results are now available in your medical
              records.
            </div>
            <div className="alert alert-warning">
              <strong>Reminder:</strong> You have an upcoming appointment in 24 hours.
            </div>
          </section>

          {/* Accessibility Features */}
          <section className="mt-12 p-8 bg-white rounded-lg border border-neutral-light">
            <h3 className="text-h3 mb-4">Accessibility & Compliance Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-h4 mb-2">✓ WCAG 2.1 AA Compliant</h4>
                <ul className="list-disc list-inside space-y-2 text-body text-neutral-blue-gray">
                  <li>4.5:1 minimum color contrast</li>
                  <li>Keyboard navigation support</li>
                  <li>Screen reader compatible</li>
                  <li>44x44px minimum touch targets</li>
                  <li>Skip to content links</li>
                </ul>
              </div>
              <div>
                <h4 className="text-h4 mb-2">✓ HIPAA Security Ready</h4>
                <ul className="list-disc list-inside space-y-2 text-body text-neutral-blue-gray">
                  <li>HTTPS-only in production</li>
                  <li>HTTP-only cookie authentication</li>
                  <li>CSRF token protection</li>
                  <li>15-minute session timeout</li>
                  <li>PHI access audit logging</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-neutral-navy text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-small">
              © 2025 Healthcare Portal. HIPAA Compliant • WCAG 2.1 AA Accessible
            </p>
            <p className="text-small text-neutral-light mt-2">
              Built with React 19 + TypeScript + Tailwind CSS
            </p>
          </div>
        </footer>
      </div>

      {/* React Query Devtools (Development Only) */}
      {import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App
