import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordResetRequestSchema, type PasswordResetRequestFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'

/**
 * Forgot Password Page
 * Request password reset link via email
 */
export default function ForgotPassword() {
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  // Password reset request mutation
  const resetRequestMutation = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: () => {
      setResetError(null)
      setResetSuccess(true)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.'
      setResetError(message)
    },
  })

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setResetError(null)
    setResetSuccess(false)
    resetRequestMutation.mutate(data.email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Reset Password</h1>
          <p className="text-body text-neutral-blue-gray">
            {resetSuccess
              ? 'Check your email for reset instructions'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {/* Password Reset Card */}
        <Card>
          <CardHeader>
            <CardTitle>{resetSuccess ? 'Check Your Email' : 'Forgot Password?'}</CardTitle>
            <CardDescription>
              {resetSuccess
                ? 'We sent a password reset link to your email address'
                : "Don't worry, it happens to the best of us"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              /* Success State */
              <div className="space-y-6">
                {/* Success Alert */}
                <div className="alert alert-success" role="alert" aria-live="polite">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  <strong>Email sent!</strong> Check your inbox for reset instructions.
                </div>

                {/* Email Reminder */}
                <div className="bg-neutral-light rounded-lg p-4">
                  <p className="text-sm text-neutral-blue-gray">
                    <strong>Email sent to:</strong> {getValues('email')}
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3 text-sm text-neutral-blue-gray">
                  <p className="font-medium">What's next?</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new secure password</li>
                    <li>Sign in with your new password</li>
                  </ol>
                </div>

                {/* Didn't receive email? */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-neutral-blue-gray mb-2">Didn't receive the email?</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setResetSuccess(false)}
                    className="text-sm"
                  >
                    Try a different email
                  </Button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <>
                {/* Error Alert */}
                {resetError && (
                  <div className="alert alert-error mb-6" role="alert" aria-live="assertive">
                    <AlertCircle className="h-5 w-5 inline mr-2" />
                    <strong>Error:</strong> {resetError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-error" aria-label="required">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-blue-gray" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="your.email@example.com"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email')}
                        className={`pl-10 ${errors.email ? 'border-error' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-sm text-error" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || resetRequestMutation.isPending}
                  >
                    {isSubmitting || resetRequestMutation.isPending
                      ? 'Sending...'
                      : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-neutral-blue-gray hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-blue-gray">
            🔒 Password reset links expire after 1 hour for security
          </p>
        </div>
      </div>
    </div>
  )
}
