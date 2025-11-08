import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Smartphone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppHeader from '@/components/shared/AppHeader'
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
} from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Profile & Settings Page
 * User profile management, password change, and 2FA configuration
 */
export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phone || '',
    },
  })

  // Change password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setProfileSuccess(true)
      setProfileError(null)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (error: any) => {
      setProfileError(error.response?.data?.message || 'Failed to update profile')
      setProfileSuccess(false)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError(null)
      resetPasswordForm()
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Failed to change password')
      setPasswordSuccess(false)
    },
  })

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: async (response) => {
      setQrCodeUrl(response.qrCodeDataUrl)
      setTwoFactorError(null)
      // Refresh user data to get the temporary secret stored on backend
      try {
        const updatedUser = await authApi.getCurrentUser()
        setUser(updatedUser)
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    },
    onError: (error: any) => {
      setTwoFactorError(error.response?.data?.message || 'Failed to enable 2FA')
    },
  })

  // Verify 2FA setup mutation
  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2FASetup,
    onSuccess: () => {
      if (user) {
        setUser({ ...user, twoFactorEnabled: true })
      }
      setQrCodeUrl(null)
      setTwoFactorCode('')
      setTwoFactorError(null)
    },
    onError: (error: any) => {
      setTwoFactorError(error.response?.data?.message || 'Invalid verification code')
    },
  })

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: () => {
      if (user) {
        setUser({ ...user, twoFactorEnabled: false })
      }
      setTwoFactorError(null)
    },
    onError: (error: any) => {
      setTwoFactorError(error.response?.data?.message || 'Failed to disable 2FA')
    },
  })

  // Form handlers
  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileSuccess(false)
    setProfileError(null)
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordSuccess(false)
    setPasswordError(null)
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  const handleEnable2FA = () => {
    setTwoFactorError(null)
    enable2FAMutation.mutate()
  }

  const handleVerify2FA = () => {
    if (twoFactorCode.length === 6) {
      verify2FAMutation.mutate(twoFactorCode)
    }
  }

  const handleDisable2FA = () => {
    const code = prompt('Enter your 2FA code to disable:')
    if (code) {
      disable2FAMutation.mutate(code)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  // Smart back navigation based on user role
  const getBackPath = () => {
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard'
      case 'doctor':
      case 'nurse':
        return '/provider/dashboard'
      case 'admin':
        return '/admin/dashboard'
      case 'receptionist':
        return '/receptionist/dashboard'
      case 'billing_staff':
        return '/billing/dashboard'
      default:
        return '/dashboard'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Profile & Settings" showBackButton backPath={getBackPath()} />

      <div className="flex-1 overflow-auto">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  {profileSuccess && (
                    <div className="alert alert-success mb-6" role="alert">
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Profile updated successfully!
                    </div>
                  )}

                  {profileError && (
                    <div className="alert alert-error mb-6" role="alert">
                      <AlertCircle className="h-5 w-5 inline mr-2" />
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-neutral-light"
                      />
                      <p className="text-xs text-neutral-blue-gray">Email cannot be changed</p>
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        {...registerProfile('firstName')}
                        className={profileErrors.firstName ? 'border-error' : ''}
                      />
                      {profileErrors.firstName && (
                        <p className="text-sm text-error">{profileErrors.firstName.message}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        {...registerProfile('lastName')}
                        className={profileErrors.lastName ? 'border-error' : ''}
                      />
                      {profileErrors.lastName && (
                        <p className="text-sm text-error">{profileErrors.lastName.message}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1234567890"
                        {...registerProfile('phoneNumber')}
                        className={profileErrors.phoneNumber ? 'border-error' : ''}
                      />
                      {profileErrors.phoneNumber && (
                        <p className="text-sm text-error">{profileErrors.phoneNumber.message}</p>
                      )}
                      <p className="text-xs text-neutral-blue-gray">
                        Format: +[country code][number]
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isProfileSubmitting || updateProfileMutation.isPending}
                    >
                      {isProfileSubmitting || updateProfileMutation.isPending
                        ? 'Saving...'
                        : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6 space-y-6">
              {/* Change Password Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  {passwordSuccess && (
                    <div className="alert alert-success mb-6" role="alert">
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Password changed successfully!
                    </div>
                  )}

                  {passwordError && (
                    <div className="alert alert-error mb-6" role="alert">
                      <AlertCircle className="h-5 w-5 inline mr-2" />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">
                        Current Password <span className="text-error">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword')}
                          className={
                            passwordErrors.currentPassword ? 'border-error pr-12' : 'pr-12'
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-error">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        New Password <span className="text-error">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword')}
                          className={passwordErrors.newPassword ? 'border-error pr-12' : 'pr-12'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-error">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">
                        Confirm New Password <span className="text-error">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerPassword('confirmNewPassword')}
                          className={
                            passwordErrors.confirmNewPassword ? 'border-error pr-12' : 'pr-12'
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-blue-gray"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmNewPassword && (
                        <p className="text-sm text-error">
                          {passwordErrors.confirmNewPassword.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPasswordSubmitting || changePasswordMutation.isPending}
                    >
                      {isPasswordSubmitting || changePasswordMutation.isPending
                        ? 'Changing...'
                        : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  {twoFactorError && (
                    <div className="alert alert-error mb-6" role="alert">
                      <AlertCircle className="h-5 w-5 inline mr-2" />
                      {twoFactorError}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-neutral-light rounded-lg">
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-neutral-blue-gray">
                          {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div className={user.twoFactorEnabled ? 'badge-success' : 'badge-error'}>
                        {user.twoFactorEnabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Enable 2FA */}
                    {!user.twoFactorEnabled && !qrCodeUrl && (
                      <Button
                        onClick={handleEnable2FA}
                        className="w-full"
                        disabled={enable2FAMutation.isPending}
                      >
                        {enable2FAMutation.isPending ? 'Setting up...' : 'Enable 2FA'}
                      </Button>
                    )}

                    {/* QR Code Setup */}
                    {qrCodeUrl && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm mb-4">
                            Scan this QR code with Google Authenticator:
                          </p>
                          <img
                            src={qrCodeUrl}
                            alt="2FA QR Code"
                            className="mx-auto border rounded-lg"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twoFactorCode">Enter verification code</Label>
                          <Input
                            id="twoFactorCode"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                          />
                        </div>

                        <Button
                          onClick={handleVerify2FA}
                          className="w-full"
                          disabled={twoFactorCode.length !== 6 || verify2FAMutation.isPending}
                        >
                          {verify2FAMutation.isPending ? 'Verifying...' : 'Verify and Enable'}
                        </Button>
                      </div>
                    )}

                    {/* Disable 2FA */}
                    {user.twoFactorEnabled && (
                      <Button
                        variant="destructive"
                        onClick={handleDisable2FA}
                        className="w-full"
                        disabled={disable2FAMutation.isPending}
                      >
                        {disable2FAMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
