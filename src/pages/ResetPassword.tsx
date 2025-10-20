import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordResetConfirmSchema, type PasswordResetConfirmFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'

/**
 * Reset Password Page
 * Confirm password reset with new password
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  // Password reset confirm mutation
  const resetConfirmMutation = useMutation({
    mutationFn: ({ password }: { password: string }) => {
      if (!token) throw new Error('Invalid reset token')
      return authApi.resetPassword(token, password)
    },
    onSuccess: () => {
      setResetError(null)
      setResetSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Failed to reset password. The link may have expired. Please request a new one.'
      setResetError(message)
    },
  })

  const onSubmit = async (data: PasswordResetConfirmFormData) => {
    setResetError(null)
    resetConfirmMutation.mutate({ password: data.password })
  }

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[@$!%*?&]/.test(pwd)) strength++

    if (strength <= 2) return { label: 'Weak', color: 'bg-error', width: '33%' }
    if (strength <= 3) return { label: 'Medium', color: 'bg-warning', width: '66%' }
    return { label: 'Strong', color: 'bg-wellness', width: '100%' }
  }

  const passwordStrength = getPasswordStrength(password)

  // Invalid token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>This password reset link is invalid or has expired</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="alert alert-error">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                <strong>Error:</strong> Invalid or expired reset token
              </div>
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Request New Reset Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Create New Password</h1>
          <p className="text-body text-neutral-blue-gray">
            {resetSuccess
              ? 'Your password has been reset successfully!'
              : 'Enter your new password below'}
          </p>
        </div>

        {/* Reset Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>{resetSuccess ? 'Password Reset Complete' : 'Set New Password'}</CardTitle>
            <CardDescription>
              {resetSuccess
                ? 'You can now sign in with your new password'
                : 'Choose a strong password to protect your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              /* Success State */
              <div className="space-y-6">
                <div className="alert alert-success" role="alert" aria-live="polite">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  <strong>Success!</strong> Your password has been reset.
                </div>

                <p className="text-sm text-neutral-blue-gray text-center">
                  Redirecting you to login in 3 seconds...
                </p>

                <Button onClick={() => navigate('/login')} className="w-full">
                  Go to Login Now
                </Button>
              </div>
            ) : (
              /* Reset Form */
              <>
                {/* Error Alert */}
                {resetError && (
                  <div className="alert alert-error mb-6" role="alert" aria-live="assertive">
                    <AlertCircle className="h-5 w-5 inline mr-2" />
                    <strong>Error:</strong> {resetError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      New Password <span className="text-error" aria-label="required">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : 'password-strength'}
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div id="password-strength" className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-blue-gray">Password strength:</span>
                          <span className={`font-medium ${passwordStrength.label === 'Strong' ? 'text-wellness' : passwordStrength.label === 'Medium' ? 'text-warning' : 'text-error'}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p id="password-error" className="text-sm text-error" role="alert">
                        {errors.password.message}
                      </p>
                    )}

                    {/* Password Requirements */}
                    <div className="text-xs text-neutral-blue-gray space-y-1 mt-2">
                      <p className="font-medium">Password must contain:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li className={password.length >= 8 ? 'text-wellness' : ''}>At least 8 characters</li>
                        <li className={/[A-Z]/.test(password) ? 'text-wellness' : ''}>One uppercase letter</li>
                        <li className={/[a-z]/.test(password) ? 'text-wellness' : ''}>One lowercase letter</li>
                        <li className={/\d/.test(password) ? 'text-wellness' : ''}>One number</li>
                        <li className={/[@$!%*?&]/.test(password) ? 'text-wellness' : ''}>
                          One special character (@$!%*?&)
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password <span className="text-error" aria-label="required">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                        aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                        {...register('confirmPassword')}
                        className={errors.confirmPassword ? 'border-error pr-12' : 'pr-12'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray hover:text-primary transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirm-password-error" className="text-sm text-error" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || resetConfirmMutation.isPending}
                  >
                    {isSubmitting || resetConfirmMutation.isPending
                      ? 'Resetting Password...'
                      : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        {!resetSuccess && (
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-blue-gray">
              🔒 Your password is encrypted and cannot be recovered
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
