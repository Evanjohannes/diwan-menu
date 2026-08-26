'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Key, 
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'security'>('profile')
  
  const router = useRouter()

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('📧 Check your new email to confirm the change.')
    setEmail('')
    setLoading(false)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('✅ Display name updated successfully!')
    setDisplayName('')
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      setLoading(false)
      return
    }

    // Step 1: verify the current password is correct
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      setError('Could not verify your account. Please log in again.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (verifyError) {
      setError('Current password is incorrect.')
      setLoading(false)
      return
    }

    // Step 2: current password confirmed, now update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setMessage('🔒 Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Top Border */}
      <div className="h-1 bg-gradient-to-r from-[#c9a24b] via-[#e8d5b5] to-[#c9a24b]" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="group flex items-center gap-2 text-[#8a7a5a] hover:text-[#2f3b2f] transition-all mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2f3b2f] flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-[#faf7f2]" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#2f3b2f]">Settings</h1>
              <p className="text-sm text-[#8a7a5a]">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Message & Error */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-[#f0ebe3] shadow-sm">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 ${
              activeSection === 'profile'
                ? 'bg-[#2f3b2f] text-white shadow-md'
                : 'text-[#8a7a5a] hover:bg-[#faf7f2]'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 ${
              activeSection === 'security'
                ? 'bg-[#2f3b2f] text-white shadow-md'
                : 'text-[#8a7a5a] hover:bg-[#faf7f2]'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            {/* Display Name */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#c9a24b]" />
                <h2 className="font-semibold text-[#2f3b2f]">Display Name</h2>
              </div>
              <form onSubmit={handleUpdateDisplayName} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Diwan Coffee"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-[#e8e0d5] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2f3b2f] text-white rounded-lg px-6 py-2.5 hover:bg-[#3f4f3f] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Display Name
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Update Email */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-[#c9a24b]" />
                <h2 className="font-semibold text-[#2f3b2f]">Login Email</h2>
              </div>
              <form onSubmit={handleUpdateEmail} className="space-y-3">
                <input
                  type="email"
                  placeholder="New email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#e8e0d5] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2f3b2f] text-white rounded-lg px-6 py-2.5 hover:bg-[#3f4f3f] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Update Email
                    </>
                  )}
                </button>
                <p className="text-xs text-[#8a7a5a] mt-2">
                  ⚠️ You will receive a confirmation email at the new address.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-[#c9a24b]" />
              <h2 className="font-semibold text-[#2f3b2f]">Change Password</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#8a7a5a] block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-[#e8e0d5] rounded-lg px-4 py-2.5 pr-12 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a5a] hover:text-[#2f3b2f] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#8a7a5a] block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-[#e8e0d5] rounded-lg px-4 py-2.5 pr-12 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#8a7a5a] block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[#e8e0d5] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2f3b2f] text-white rounded-lg px-6 py-2.5 hover:bg-[#3f4f3f] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-[#c9a24b]" />
                <p className="text-xs text-[#8a7a5a]">
                  Your password must be at least 6 characters long.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#b8a88a]">
            Secure &bull; Private &bull; Protected
          </p>
        </div>
      </div>
    </div>
  )
}