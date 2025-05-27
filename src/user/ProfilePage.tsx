import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AuthUser } from 'wasp/auth'
import { updateUserSummaryEnabled } from 'wasp/client/operations'

export function ProfilePage({ user }: { user: AuthUser }) {
  const navigate = useNavigate()
  const [isSummaryEnabled, setIsSummaryEnabled] = useState(
    user.isSummaryEnabled
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleSummary = async (enabled: boolean) => {
    setIsUpdating(true)
    try {
      await updateUserSummaryEnabled({ isSummaryEnabled: enabled })
      setIsSummaryEnabled(enabled)
    } catch (error) {
      console.error('Failed to update summary settings:', error)
      toast.error('Failed to update settings. Please try again.')
      // Revert the state if update failed
      setIsSummaryEnabled(!enabled)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#1B2838] transition-colors hover:text-[#2E5A27]"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-2xl font-bold text-[#1B2838]">Profile</h1>
        </div>

        {/* Profile Content */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          {/* User Info Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-navy">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Email
                </span>
                <p className="mt-1 text-gray-900">{user.email || 'No email'}</p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-navy">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Email Summaries
                  </span>
                  <p className="text-sm text-gray-500">
                    Receive daily email summaries of your tennis matches
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleToggleSummary(!isSummaryEnabled)}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:opacity-50 ${
                      isSummaryEnabled ? 'bg-forest' : 'bg-gray-200'
                    } `}
                    role="switch"
                    aria-checked={isSummaryEnabled}
                    aria-describedby="email-summary-description"
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isSummaryEnabled ? 'translate-x-5' : 'translate-x-0'
                      } `}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
