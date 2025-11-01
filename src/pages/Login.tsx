import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { getRoleDashboardPath } from '@/lib/utils/routing'

/**
 * Login Page Component
 * HIPAA-compliant authentication with WCAG 2.1 AA accessibility
 */
export default function Login() {
  const navigate = useNavigate()
  const { login, setRequires2FA, setTempToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setLoginError(null)

      if (response.requires2FA) {
        // User needs 2FA verification - store tempToken
        setRequires2FA(true)
        if (response.tempToken) {
          setTempToken(response.tempToken)
        }
        navigate('/verify-2fa')
      } else if (response.user) {
        // Login successful - start new session
        login(response.user)

        // Redirect to role-specific dashboard
        const dashboardPath = getRoleDashboardPath(response.user.role)
        navigate(dashboardPath)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid email or password. Please try again.'
      setLoginError(message)
    },
  })

  // Form submit handler
  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      {/* Skip to main content for accessibility */}
      <a href="#login-form" className="skip-to-main">
        Skip to login form
      </a>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Healthcare Portal</h1>
          <p className="text-body text-neutral-blue-gray">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <Card id="login-form">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {loginError && (
              <div className="alert alert-error mb-6" role="alert" aria-live="assertive">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                <strong>Error:</strong> {loginError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-error" aria-label="required">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className={errors.email ? 'border-error' : ''}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-error" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-error" aria-label="required">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                    className={errors.password ? 'border-error pr-12' : 'pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-error" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 rounded border-neutral-blue-gray text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                  <Label htmlFor="rememberMe" className="ml-2 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-neutral-blue-gray">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-blue-gray">
            🔒 Secure HIPAA-compliant login
          </p>
          <p className="text-xs text-neutral-blue-gray mt-1">
            Your data is encrypted and protected
          </p>
        </div>
      </div>
    </div>
  )
}
