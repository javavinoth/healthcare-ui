import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { twoFactorSchema, type TwoFactorFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { extractErrorMessage } from '@/lib/utils/apiError'

/**
 * Two-Factor Authentication Verification Page
 * HIPAA-compliant 2FA with accessibility features
 */
export default function Verify2FA() {
  const navigate = useNavigate()
  const { login, requires2FA, tempToken, isAuthenticated } = useAuthStore()
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Auto-focus refs for 6-digit code inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', ''])

  // Redirect if 2FA not required AND user is not authenticated
  // (If authenticated, it means verification succeeded, so don't redirect)
  useEffect(() => {
    if (!requires2FA && !isAuthenticated) {
      navigate('/login')
    }
  }, [requires2FA, isAuthenticated, navigate])

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  // 2FA verification mutation
  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: (response) => {
      setVerifyError(null)
      if (response.user) {
        // Use login() to atomically set all auth state
        login(response.user)
        navigate('/dashboard')
      }
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Invalid verification code. Please try again.')
      setVerifyError(message)
      // Clear code on error
      setCodeDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newDigits = [...codeDigits]
    newDigits[index] = value

    setCodeDigits(newDigits)

    // Update form value
    const fullCode = newDigits.join('')
    setValue('code', fullCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (fullCode.length === 6) {
      handleSubmit(onSubmit)()
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setCodeDigits(digits)
      setValue('code', pastedData)
      inputRefs.current[5]?.focus()
    }
  }

  // Form submit
  const onSubmit = async (data: TwoFactorFormData) => {
    setVerifyError(null)

    // Check if tempToken exists
    if (!tempToken) {
      setVerifyError('Session expired. Please log in again.')
      navigate('/login')
      return
    }

    // Include tempToken in the verification request
    verify2FAMutation.mutate({
      code: data.code,
      tempToken: tempToken,
    })
  }

  // Resend code (placeholder - implement backend endpoint)
  const handleResendCode = () => {
    setResendSuccess(true)
    setCountdown(30)

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setResendSuccess(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // TODO: Call backend to resend code
    console.log('Resending 2FA code...')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h1 mb-2">Two-Factor Authentication</h1>
          <p className="text-body text-neutral-blue-gray">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* 2FA Card */}
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              We've sent a verification code to your authentication app
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {verifyError && (
              <div className="alert alert-error mb-6" role="alert" aria-live="assertive">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                <strong>Error:</strong> {verifyError}
              </div>
            )}

            {/* Success Alert */}
            {resendSuccess && (
              <div className="alert alert-success mb-6" role="alert" aria-live="polite">
                ✓ New code sent! Please check your authenticator app.
              </div>
            )}

            {/* 2FA Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 6-Digit Code Input */}
              <div className="space-y-2">
                <Label htmlFor="code-0" className="text-center block">
                  Enter 6-Digit Code
                </Label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codeDigits[index]}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-h3 font-bold"
                      aria-label={`Digit ${index + 1}`}
                      autoFocus={index === 0}
                      autoComplete="off"
                    />
                  ))}
                </div>
                <input type="hidden" {...register('code')} />
                {errors.code && (
                  <p className="text-sm text-error text-center" role="alert">
                    {errors.code.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting || verify2FAMutation.isPending || codeDigits.join('').length !== 6
                }
              >
                {isSubmitting || verify2FAMutation.isPending ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-blue-gray mb-2">Didn't receive the code?</p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-sm"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-sm text-neutral-blue-gray hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-blue-gray">
            🔒 Two-factor authentication adds an extra layer of security
          </p>
        </div>
      </div>
    </div>
  )
}
