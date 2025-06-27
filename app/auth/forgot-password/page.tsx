'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../components/ui/Button'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // In development, show the reset URL
        if (data.resetUrl) {
          setResetUrl(data.resetUrl)
        }
      } else {
        setError(data.error || 'Failed to send reset link')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-2xl font-bold text-white">🔑</span>
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-red-200 bg-red-50/80 backdrop-blur-sm text-red-800 p-4 rounded-xl flex items-center gap-3"
              >
                <span className="text-red-500">⚠️</span>
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-green-200 bg-green-50/80 backdrop-blur-sm text-green-800 p-4 rounded-xl flex items-center gap-3"
              >
                <span className="text-green-500">✅</span>
                <p className="text-sm">{success}</p>
              </motion.div>
            )}

            {/* Development: Show reset URL */}
            {resetUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-blue-200 bg-blue-50/80 backdrop-blur-sm text-blue-800 p-4 rounded-xl"
              >
                <p className="text-sm">
                  <strong className="flex items-center gap-2 mb-2">
                    <span>🔧</span>
                    Development Mode:
                  </strong>
                  <a 
                    href={resetUrl} 
                    className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to reset password
                  </a>
                </p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-gray-50/50 text-gray-900"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              variant="success"
              disabled={isLoading || !email}
              loading={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              <span className="mr-2">←</span>
              Back to Login
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  )
}