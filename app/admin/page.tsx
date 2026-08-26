'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
      {/* Decorative Top Border */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a24b] via-[#e8d5b5] to-[#c9a24b]" />

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-serif font-black tracking-wider text-[#2f3b2f] leading-none">
              DIWAN
            </h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent mt-1" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8a7a5a] mt-3 font-light">
            Coffee &bull; Dessert
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f0ebe3] p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#faf7f2] flex items-center justify-center mx-auto mb-4 border-2 border-[#c9a24b]/20">
              <Shield className="w-8 h-8 text-[#c9a24b]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2f3b2f]">Welcome Back</h2>
            <p className="text-sm text-[#8a7a5a] mt-1">
              Sign in to manage your menu
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Authentication Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#8a7a5a] block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b8a88a]" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#e8e0d5] rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#8a7a5a] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b8a88a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#e8e0d5] rounded-lg pl-11 pr-12 py-3 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f3b2f] text-white rounded-lg px-6 py-3 hover:bg-[#3f4f3f] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <a 
              href="/admin/forgot-password" 
              className="text-sm text-[#8a7a5a] hover:text-[#c9a24b] transition-colors font-medium"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-[#c9a24b]" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#b8a88a]">
              Secure &bull; Private
            </p>
          </div>
          <p className="text-[8px] text-[#d8c9a3] mt-2 tracking-widest">
            DIWAN COFFEE • SWEET MOMENTS, MADE FRESH
          </p>
        </div>
      </div>
    </div>
  )
}