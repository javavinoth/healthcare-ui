import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle, User, Stethoscope } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  registrationSchema,
  providerRegistrationSchema,
  type RegistrationFormData,
  type ProviderRegistrationFormData,
} from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import {
  extractErrorMessage,
  getValidationErrors,
  formatValidationErrors,
} from '@/lib/utils/apiError'

/**
 * Register Page Component
 * HIPAA-compliant registration with role-based forms (Patient/Provider)
 * WCAG 2.1 AA accessibility compliant
 */
export default function Register() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<'patient' | 'provider'>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  // Patient Registration Form
  const patientForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  })

  // Provider Registration Form
  const providerForm = useForm<ProviderRegistrationFormData>({
    resolver: zodResolver(providerRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      specialty: '',
      npi: '',
      title: '',
      licenseNumber: '',
      licenseState: '',
    },
  })

  // Patient registration mutation
  const patientRegisterMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setRegisterError(null)
      setRegisterSuccess(true)
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Account created successfully! Please sign in.' },
        })
      }, 2000)
    },
    onError: (error: unknown) => {
      // Check for validation errors first
      const validationErrors = getValidationErrors(error)
      if (Object.keys(validationErrors).length > 0) {
        const formattedErrors = formatValidationErrors(error)
        setRegisterError(formattedErrors)
      } else {
        const message = extractErrorMessage(error, 'Registration failed. Please try again.')
        setRegisterError(message)
      }
    },
  })

  // Provider registration mutation
  const providerRegisterMutation = useMutation({
    mutationFn: authApi.registerProvider,
    onSuccess: () => {
      setRegisterError(null)
      setRegisterSuccess(true)
      setTimeout(() => {
        navigate('/login', {
          state: {
            message:
              'Application submitted! Your account will be activated once approved by an administrator.',
          },
        })
      }, 3000)
    },
    onError: (error: unknown) => {
      // Check for validation errors first
      const validationErrors = getValidationErrors(error)
      if (Object.keys(validationErrors).length > 0) {
        const formattedErrors = formatValidationErrors(error)
        setRegisterError(formattedErrors)
      } else {
        const message = extractErrorMessage(error, 'Registration failed. Please try again.')
        setRegisterError(message)
      }
    },
  })

  // Form submit handlers
  const onPatientSubmit = async (data: RegistrationFormData) => {
    setRegisterError(null)
    setRegisterSuccess(false)
    patientRegisterMutation.mutate(data)
  }

  const onProviderSubmit = async (data: ProviderRegistrationFormData) => {
    setRegisterError(null)
    setRegisterSuccess(false)
    providerRegisterMutation.mutate(data)
  }

  // Check if either form is submitting
  const isSubmitting =
    patientForm.formState.isSubmitting ||
    providerForm.formState.isSubmitting ||
    patientRegisterMutation.isPending ||
    providerRegisterMutation.isPending

  // US States for license dropdown
  const US_STATES = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
    'DC',
  ]

  // Medical Titles/Credentials
  const MEDICAL_TITLES = [
    { value: 'MD', label: 'MD - Doctor of Medicine' },
    { value: 'DO', label: 'DO - Doctor of Osteopathic Medicine' },
    { value: 'NP', label: 'NP - Nurse Practitioner' },
    { value: 'PA', label: 'PA - Physician Assistant' },
    { value: 'RN', label: 'RN - Registered Nurse' },
    { value: 'LPN', label: 'LPN - Licensed Practical Nurse' },
    { value: 'PharmD', label: 'PharmD - Doctor of Pharmacy' },
    { value: 'DDS', label: 'DDS - Doctor of Dental Surgery' },
    { value: 'DMD', label: 'DMD - Doctor of Dental Medicine' },
    { value: 'DPM', label: 'DPM - Doctor of Podiatric Medicine' },
    { value: 'DC', label: 'DC - Doctor of Chiropractic' },
    { value: 'OD', label: 'OD - Doctor of Optometry' },
    { value: 'PhD', label: 'PhD - Doctor of Philosophy' },
    { value: 'PsyD', label: 'PsyD - Doctor of Psychology' },
    { value: 'LCSW', label: 'LCSW - Licensed Clinical Social Worker' },
    { value: 'LPC', label: 'LPC - Licensed Professional Counselor' },
    { value: 'DPT', label: 'DPT - Doctor of Physical Therapy' },
    { value: 'OT', label: 'OT - Occupational Therapist' },
    { value: 'SLP', label: 'SLP - Speech-Language Pathologist' },
  ]

  // Medical Specialties
  const SPECIALTIES = [
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'General Practice',
    'Geriatrics',
    'Hematology',
    'Infectious Disease',
    'Internal Medicine',
    'Nephrology',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology',
    'Pediatrics',
    'Physical Medicine and Rehabilitation',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Rheumatology',
    'Surgery',
    'Urology',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      <a href="#register-form" className="skip-to-main">
        Skip to registration form
      </a>

      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Healthcare Portal</h1>
          <p className="text-body text-neutral-blue-gray">Create your account</p>
        </div>

        {/* Register Card */}
        <Card id="register-form">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Choose your role and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Alert */}
            {registerSuccess && (
              <div className="alert alert-success mb-6" role="alert" aria-live="polite">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                <strong>Success!</strong>{' '}
                {selectedRole === 'patient'
                  ? 'Account created. Redirecting to login...'
                  : 'Application submitted! Awaiting admin approval...'}
              </div>
            )}

            {/* Error Alert */}
            {registerError && (
              <div className="alert alert-error mb-6" role="alert" aria-live="assertive">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                <strong>Error:</strong> {registerError}
              </div>
            )}

            {/* Role Selection Tabs */}
            <Tabs
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as 'patient' | 'provider')}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient" className="min-h-[44px]">
                  <User className="mr-2 h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="provider" className="min-h-[44px]">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Healthcare Provider
                </TabsTrigger>
              </TabsList>

              {/* Patient Registration Form */}
              <TabsContent value="patient">
                <form
                  onSubmit={patientForm.handleSubmit(onPatientSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-firstName">
                        First Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="patient-firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="John"
                        {...patientForm.register('firstName')}
                        className={patientForm.formState.errors.firstName ? 'border-error' : ''}
                      />
                      {patientForm.formState.errors.firstName && (
                        <p className="text-sm text-error">
                          {patientForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-lastName">
                        Last Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="patient-lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Doe"
                        {...patientForm.register('lastName')}
                        className={patientForm.formState.errors.lastName ? 'border-error' : ''}
                      />
                      {patientForm.formState.errors.lastName && (
                        <p className="text-sm text-error">
                          {patientForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">
                      Email Address <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="patient-email"
                      type="email"
                      autoComplete="email"
                      placeholder="john.doe@example.com"
                      {...patientForm.register('email')}
                      className={patientForm.formState.errors.email ? 'border-error' : ''}
                    />
                    {patientForm.formState.errors.email && (
                      <p className="text-sm text-error">
                        {patientForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="patient-phoneNumber">
                      Phone Number{' '}
                      <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="patient-phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="+91-1234567890"
                      {...patientForm.register('phoneNumber')}
                    />
                    {patientForm.formState.errors.phoneNumber && (
                      <p className="text-sm text-error">
                        {patientForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">
                      Password <span className="text-error">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="patient-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...patientForm.register('password')}
                        className={
                          patientForm.formState.errors.password ? 'border-error pr-12' : 'pr-12'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {patientForm.formState.errors.password && (
                      <p className="text-sm text-error">
                        {patientForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="patient-confirmPassword">
                      Confirm Password <span className="text-error">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="patient-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...patientForm.register('confirmPassword')}
                        className={
                          patientForm.formState.errors.confirmPassword
                            ? 'border-error pr-12'
                            : 'pr-12'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {patientForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-error">
                        {patientForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || registerSuccess}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Patient Account'}
                  </Button>
                </form>
              </TabsContent>

              {/* Provider Registration Form */}
              <TabsContent value="provider">
                <form
                  onSubmit={providerForm.handleSubmit(onProviderSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  {/* Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="text-blue-900 font-medium mb-1">Provider Registration</p>
                    <p className="text-blue-700">
                      Your account will be reviewed by our administrators before activation. You'll
                      receive an email once approved.
                    </p>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider-firstName">
                        First Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="provider-firstName"
                        {...providerForm.register('firstName')}
                        className={providerForm.formState.errors.firstName ? 'border-error' : ''}
                      />
                      {providerForm.formState.errors.firstName && (
                        <p className="text-sm text-error">
                          {providerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider-lastName">
                        Last Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="provider-lastName"
                        {...providerForm.register('lastName')}
                        className={providerForm.formState.errors.lastName ? 'border-error' : ''}
                      />
                      {providerForm.formState.errors.lastName && (
                        <p className="text-sm text-error">
                          {providerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider-email">
                        Email Address <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="provider-email"
                        type="email"
                        {...providerForm.register('email')}
                        className={providerForm.formState.errors.email ? 'border-error' : ''}
                      />
                      {providerForm.formState.errors.email && (
                        <p className="text-sm text-error">
                          {providerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider-phoneNumber">Phone Number</Label>
                      <Input
                        id="provider-phoneNumber"
                        type="tel"
                        {...providerForm.register('phoneNumber')}
                      />
                      {providerForm.formState.errors.phoneNumber && (
                        <p className="text-sm text-error">
                          {providerForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Professional Credentials */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Professional Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="provider-title">
                          Title/Credentials <span className="text-error">*</span>
                        </Label>
                        <Select onValueChange={(value) => providerForm.setValue('title', value)}>
                          <SelectTrigger id="provider-title">
                            <SelectValue placeholder="Select credential" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICAL_TITLES.map((title) => (
                              <SelectItem key={title.value} value={title.value}>
                                {title.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {providerForm.formState.errors.title && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* Specialty */}
                      <div className="space-y-2">
                        <Label htmlFor="provider-specialty">
                          Specialty <span className="text-error">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) => providerForm.setValue('specialty', value)}
                        >
                          <SelectTrigger id="provider-specialty">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPECIALTIES.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {providerForm.formState.errors.specialty && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.specialty.message}
                          </p>
                        )}
                      </div>

                      {/* NPI */}
                      <div className="space-y-2">
                        <Label htmlFor="provider-npi">
                          NPI Number <span className="text-error">*</span>
                        </Label>
                        <Input
                          id="provider-npi"
                          placeholder="1234567890"
                          maxLength={10}
                          {...providerForm.register('npi')}
                          className={providerForm.formState.errors.npi ? 'border-error' : ''}
                        />
                        {providerForm.formState.errors.npi && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.npi.message}
                          </p>
                        )}
                      </div>

                      {/* License Number */}
                      <div className="space-y-2">
                        <Label htmlFor="provider-licenseNumber">
                          License Number <span className="text-error">*</span>
                        </Label>
                        <Input
                          id="provider-licenseNumber"
                          {...providerForm.register('licenseNumber')}
                          className={
                            providerForm.formState.errors.licenseNumber ? 'border-error' : ''
                          }
                        />
                        {providerForm.formState.errors.licenseNumber && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.licenseNumber.message}
                          </p>
                        )}
                      </div>

                      {/* License State */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="provider-licenseState">
                          License State <span className="text-error">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) => providerForm.setValue('licenseState', value)}
                        >
                          <SelectTrigger id="provider-licenseState">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {providerForm.formState.errors.licenseState && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.licenseState.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Account Security</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider-password">
                          Password <span className="text-error">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="provider-password"
                            type={showPassword ? 'text' : 'password'}
                            {...providerForm.register('password')}
                            className={
                              providerForm.formState.errors.password
                                ? 'border-error pr-12'
                                : 'pr-12'
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {providerForm.formState.errors.password && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="provider-confirmPassword">
                          Confirm Password <span className="text-error">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="provider-confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...providerForm.register('confirmPassword')}
                            className={
                              providerForm.formState.errors.confirmPassword
                                ? 'border-error pr-12'
                                : 'pr-12'
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {providerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-error">
                            {providerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || registerSuccess}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Provider Application'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Additional Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-neutral-blue-gray">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-blue-gray">🔒 Secure HIPAA-compliant registration</p>
          <p className="text-xs text-neutral-blue-gray mt-1">
            Your data is encrypted and protected
          </p>
        </div>
      </div>
    </div>
  )
}
