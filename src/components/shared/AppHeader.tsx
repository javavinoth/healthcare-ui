import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Heart, LogOut, Settings, ChevronLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'
import { authApi } from '@/lib/api'

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  backPath?: string
}

/**
 * Shared Application Header Component
 * Displays user info, navigation, and logout functionality
 * Used across all authenticated pages for consistency
 */
export default function AppHeader({ title, showBackButton = false, backPath }: AppHeaderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout: logoutStore } = useAuthStore()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // Call backend logout API to revoke tokens
      await authApi.logout()
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API fails
    } finally {
      // Clear local state
      logoutStore()
      // Clear React Query cache
      queryClient.clear()
      // Navigate to login
      navigate('/login', { replace: true })

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      })
    }
  }

  // Navigate to role-specific dashboard when logo is clicked
  const handleLogoClick = () => {
    if (!user) return

    const role = user.role.toLowerCase()

    switch (role) {
      case 'patient':
        navigate('/patient/dashboard')
        break
      case 'doctor':
      case 'nurse':
        navigate('/provider/dashboard')
        break
      case 'admin':
        navigate('/admin/dashboard')
        break
      case 'receptionist':
        navigate('/receptionist/messages')
        break
      case 'billing_staff':
        navigate('/billing/messages')
        break
      default:
        navigate('/dashboard')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive'> = {
      ADMIN: 'destructive',
      DOCTOR: 'success',
      NURSE: 'info',
      PATIENT: 'default',
      BILLING_STAFF: 'warning',
      RECEPTIONIST: 'secondary',
    }
    return variants[role?.toUpperCase()] || 'default'
  }

  const getRoleDisplay = (role: string) => {
    return role?.replace('_', ' ').toUpperCase() || 'USER'
  }

  return (
    <header className="bg-white border-b border-neutral-blue-gray/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backPath || -1 as any)}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLogoClick()
                }
              }}
              aria-label="Go to dashboard"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-blue-gray">
                  {title || 'Healthcare Portal'}
                </h1>
                {user && (
                  <p className="text-xs text-neutral-blue-gray/60 hidden sm:block">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: User Info & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              {/* User Info - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 pr-3 border-r border-neutral-blue-gray/10">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-blue-gray">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xs text-neutral-blue-gray/60">{user.email}</p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleDisplay(user.role)}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Profile Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>

                {/* Mobile Profile Icon */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="sm:hidden"
                >
                  <User className="h-4 w-4" />
                </Button>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-error border-error hover:bg-error hover:text-white"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
