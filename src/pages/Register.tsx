/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'

/**
 * Register Page Component
 * HIPAA-compliant patient registration with WCAG 2.1 AA accessibility
 */
export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
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

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setRegisterError(null)
      setRegisterSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } })
      }, 2000)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      setRegisterError(message)
    },
  })

  // Form submit handler
  const onSubmit = async (data: RegistrationFormData) => {
    setRegisterError(null)
    setRegisterSuccess(false)
    registerMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      {/* Skip to main content for accessibility */}
      <a href="#register-form" className="skip-to-main">
        Skip to registration form
      </a>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Healthcare Portal</h1>
          <p className="text-body text-neutral-blue-gray">
            Create your patient account
          </p>
        </div>

        {/* Register Card */}
        <Card id="register-form">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Alert */}
            {registerSuccess && (
              <div
                className="alert alert-success mb-6"
                role="alert"
                aria-live="polite"
              >
                <CheckCircle className="h-5 w-5 inline mr-2" />
                <strong>Success!</strong> Account created. Redirecting to
                login...
              </div>
            )}

            {/* Error Alert */}
            {registerError && (
              <div
                className="alert alert-error mb-6"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-5 w-5 inline mr-2" />
                <strong>Error:</strong> {registerError}
              </div>
            )}

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name{" "}
                    <span className="text-error" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    aria-invalid={errors.firstName ? "true" : "false"}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    {...register("firstName")}
                    className={errors.firstName ? "border-error" : ""}
                  />
                  {errors.firstName && (
                    <p
                      id="firstName-error"
                      className="text-sm text-error"
                      role="alert"
                    >
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name{" "}
                    <span className="text-error" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    aria-invalid={errors.lastName ? "true" : "false"}
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                    {...register("lastName")}
                    className={errors.lastName ? "border-error" : ""}
                  />
                  {errors.lastName && (
                    <p
                      id="lastName-error"
                      className="text-sm text-error"
                      role="alert"
                    >
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address{" "}
                  <span className="text-error" aria-label="required">
                    *
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john.doe@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                  className={errors.email ? "border-error" : ""}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-error"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number{" "}
                  <span className="text-error" aria-label="required">
                    *
                  </span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="+1234567890"
                  aria-invalid={errors.phoneNumber ? "true" : "false"}
                  aria-describedby={
                    errors.phoneNumber ? "phoneNumber-error" : undefined
                  }
                  {...register("phoneNumber")}
                  className={errors.phoneNumber ? "border-error" : ""}
                />
                {errors.phoneNumber && (
                  <p
                    id="phoneNumber-error"
                    className="text-sm text-error"
                    role="alert"
                  >
                    {errors.phoneNumber.message}
                  </p>
                )}
                <p className="text-xs text-neutral-blue-gray">
                  Format: +[country code][number]
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{" "}
                  <span className="text-error" aria-label="required">
                    *
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
                    className={errors.password ? "border-error pr-12" : "pr-12"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray hover:text-primary transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-error"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-neutral-blue-gray">
                  Must contain at least 8 characters, including uppercase,
                  lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password{" "}
                  <span className="text-error" aria-label="required">
                    *
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    {...register("confirmPassword")}
                    className={
                      errors.confirmPassword ? "border-error pr-12" : "pr-12"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray hover:text-primary transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-error"
                    role="alert"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting || registerMutation.isPending || registerSuccess
                }
              >
                {isSubmitting || registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-neutral-blue-gray">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-blue-gray">
            🔒 Secure HIPAA-compliant registration
          </p>
          <p className="text-xs text-neutral-blue-gray mt-1">
            Your data is encrypted and protected
          </p>
        </div>
      </div>
    </div>
  );
}
