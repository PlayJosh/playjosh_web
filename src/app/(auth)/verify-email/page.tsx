'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

function VerifyEmailForm() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Verifying your email...')
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true)
        
        // Check if this is a verification request from email
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        
        if (token && type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) throw error
          
          setMessage('Email verified successfully! Redirecting to onboarding...')
          // Redirect to login with success message and redirect to onboarding
          setTimeout(() => {
            window.location.href = '/login?verified=true&redirectTo=/onboarding'
          }, 2000)
        } else {
          setMessage('Please check your email for a verification link.')
        }
      } catch (err: unknown) {
        console.error('Verification error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify email. The link may be invalid or expired.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {error ? (
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Link 
                href="/signup" 
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Back to Sign Up
              </Link>
            </div>
          ) : (
            <div className="text-center">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="text-green-600 mb-4">
                  <svg 
                    className="mx-auto h-12 w-12 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              )}
              <p className="text-gray-600 mb-6">{message}</p>
              {!loading && (
                <Link 
                  href="/login" 
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Go to Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}