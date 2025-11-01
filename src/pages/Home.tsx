import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  Users,
  Stethoscope,
  ClipboardList,
  Lock,
  CheckCircle,
  UserCheck,
  ArrowRight,
  Activity,
  Building2,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-primary">Blyro Care</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="default" className="min-h-[44px] min-w-[44px]">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="default" className="min-h-[44px] min-w-[44px]">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Your Health Journey,{' '}
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600 sm:text-xl md:text-2xl">
            Connect with healthcare providers, manage appointments, access medical records, and
            communicate securely—all in one HIPAA-compliant platform.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full min-h-[44px] text-base sm:w-auto sm:text-lg">
                Get Started <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full min-h-[44px] text-base sm:w-auto sm:text-lg"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Comprehensive Healthcare Management
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for modern healthcare delivery and management
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature: Appointments */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Easy Appointment Booking</CardTitle>
              <CardDescription>
                Schedule, reschedule, and manage appointments with healthcare providers in just a
                few clicks.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature: Medical Records */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Digital Medical Records</CardTitle>
              <CardDescription>
                Access your complete medical history, lab results, prescriptions, and clinical
                notes anytime, anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature: Secure Messaging */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Secure Messaging</CardTitle>
              <CardDescription>
                Communicate directly with your healthcare team through encrypted,
                HIPAA-compliant messaging.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature: Patient Management */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-wellness/10">
                <Users className="h-6 w-6 text-wellness" aria-hidden="true" />
              </div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Providers can efficiently manage patient information, treatment plans, and care
                coordination.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature: Clinical Documentation */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-wellness/10">
                <ClipboardList className="h-6 w-6 text-wellness" aria-hidden="true" />
              </div>
              <CardTitle>Clinical Documentation</CardTitle>
              <CardDescription>
                Streamlined charting, progress notes, and documentation tools for healthcare
                professionals.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature: 24/7 Access */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-wellness/10">
                <Clock className="h-6 w-6 text-wellness" aria-hidden="true" />
              </div>
              <CardTitle>24/7 Access</CardTitle>
              <CardDescription>
                Access your health information and connect with your care team around the clock
                from any device.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="text-lg text-gray-600">
              Simple, secure, and designed for everyone in the healthcare ecosystem
            </p>
          </div>

          <Tabs defaultValue="patients" className="mx-auto max-w-4xl">
            <TabsList className="grid w-full grid-cols-3 min-h-[44px]">
              <TabsTrigger value="patients" className="min-h-[44px]">
                <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Patients</span>
                <span className="sm:hidden">Patients</span>
              </TabsTrigger>
              <TabsTrigger value="providers" className="min-h-[44px]">
                <Stethoscope className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Providers</span>
                <span className="sm:hidden">Providers</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="min-h-[44px]">
                <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Staff</span>
                <span className="sm:hidden">Staff</span>
              </TabsTrigger>
            </TabsList>

            {/* Patients Tab */}
            <TabsContent value="patients" className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      1
                    </div>
                    <CardTitle>Create Your Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sign up securely and complete your health profile with basic information.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      2
                    </div>
                    <CardTitle>Book an Appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Browse available providers, select a time that works for you, and book
                      instantly.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      3
                    </div>
                    <CardTitle>Receive Care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Attend your appointment and communicate with your provider through secure
                      messaging.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      4
                    </div>
                    <CardTitle>Access Your Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      View test results, prescriptions, and clinical notes—all in one secure
                      location.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Providers Tab */}
            <TabsContent value="providers" className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-wellness text-white">
                      1
                    </div>
                    <CardTitle>Access Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      View comprehensive patient records, medical history, and previous
                      consultations.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-wellness text-white">
                      2
                    </div>
                    <CardTitle>Manage Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Set availability, view upcoming appointments, and manage your calendar
                      efficiently.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-wellness text-white">
                      3
                    </div>
                    <CardTitle>Document Care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Create clinical notes, update treatment plans, and document patient
                      encounters.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-wellness text-white">
                      4
                    </div>
                    <CardTitle>Communicate Securely</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Message patients, collaborate with colleagues, and coordinate care through
                      encrypted channels.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      1
                    </div>
                    <CardTitle>Manage Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Handle patient registration, appointment scheduling, and administrative
                      tasks efficiently.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      2
                    </div>
                    <CardTitle>Coordinate Care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Facilitate communication between patients, providers, and support staff.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      3
                    </div>
                    <CardTitle>Process Billing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Handle insurance claims, payment processing, and billing inquiries
                      seamlessly.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      4
                    </div>
                    <CardTitle>Monitor System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Administrators can manage users, oversee operations, and ensure compliance.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Security & Compliance
          </h2>
          <p className="text-lg text-gray-600">
            Your health information is protected with enterprise-grade security
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">HIPAA Compliant</h3>
              <p className="text-sm text-gray-600">
                Full compliance with HIPAA regulations for protected health information
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">End-to-End Encryption</h3>
              <p className="text-sm text-gray-600">
                All data encrypted in transit and at rest with industry-standard protocols
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Audit Logging</h3>
              <p className="text-sm text-gray-600">
                Comprehensive audit trails for all access to protected health information
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">24/7 Monitoring</h3>
              <p className="text-sm text-gray-600">
                Continuous security monitoring and threat detection to protect your data
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-lg bg-primary/5 p-8 text-center">
            <p className="mb-4 text-lg font-medium text-gray-900">
              Ready to experience better healthcare management?
            </p>
            <Link to="/register">
              <Button size="lg" className="min-h-[44px]">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="text-lg font-bold text-primary">Blyro Care</span>
              </div>
              <p className="text-sm text-gray-600">
                Modern healthcare management platform designed for patients, providers, and
                healthcare organizations.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">For Patients</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/register" className="hover:text-primary">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary">
                    Patient Login
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">For Providers</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/login" className="hover:text-primary">
                    Provider Login
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-primary">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} Blyro Care. All rights reserved. HIPAA Compliant
              Healthcare Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
