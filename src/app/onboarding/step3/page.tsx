'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'


type Purpose = 'improve_skills' | 'find_teammates' | 'get_noticed' | 'have_fun'

const purposeOptions = [
  { id: 'improve_skills' as const, label: 'Improve Skills', emoji: '🚀' },
  { id: 'find_teammates' as const, label: 'Find Teammates', emoji: '👥' },
  { id: 'get_noticed' as const, label: 'Get Noticed by Coaches', emoji: '👀' },
  { id: 'have_fun' as const, label: 'Have Fun', emoji: '⚽' }
] as const

const hearAboutUsOptions = [
  { id: 'social_media' as const, label: 'Social Media', emoji: '📱' },
  { id: 'friend' as const, label: 'Friend or Family', emoji: '👥' },
  { id: 'search' as const, label: 'Search Engine', emoji: '🔍' },
  { id: 'other' as const, label: 'Other', emoji: '💡' }
]


export default function Step3() {
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [purposes, setPurposes] = useState<Purpose[]>([])
  const [hearAboutUs, setHearAboutUs] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.replace('/login')
          return
        }

        // Check if onboarding is already completed
        if (user.user_metadata?.onboarding_completed === true) {
          router.replace('/Home')
          return
        }

        // User ID is available in user.id if needed
      } catch {
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])


 const handleComplete = async () => {
  if (purposes.length === 0) {
    setError('Please select at least one purpose')
    return
  }

  setIsSubmitting(true)
  setError(null)

  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user?.email) throw new Error('User email not found')

    
    const updateData = {
      purposes,
      onboarding_status: 'completed' as const,
      updated_at: new Date().toISOString(),
      ...(hearAboutUs && { hear_about_us: hearAboutUs }),
    }

    const { error } = await supabase
      .from('profiles')
      
      .update(updateData as Record<string, unknown>)
      .eq('email', user.email)

    if (error) throw error

    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
      },
    })

    router.replace('/Home')
  } catch (error: unknown) {
    console.error('Error completing profile:', error)
    setError('Failed to save. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}


  const handleSkip = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
        },
      })
      router.replace('/Home')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      setError('Failed to skip. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-10">
        <button 
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiArrowLeft size={28} />
        </button>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2 px-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium
                    ${step === 3 ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'}
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`h-1.5 w-full mt-4 ${step < 3 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Help us know you better
        </h1>

        {/* Purpose Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you here for? 
          </label>
          <div className="space-y-3">
            {purposeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setPurposes(prev => 
                    prev.includes(option.id)
                      ? prev.filter(p => p !== option.id)
                      : [...prev, option.id]
                  )
                  setError(null)
                }}
                className={`flex items-center w-full p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  purposes.includes(option.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="text-2xl mr-3" role="img" aria-hidden="true">
                  {option.emoji}
                </span>
                <span className="font-medium text-gray-800">{option.label}</span>
                {purposes.includes(option.id) && (
                  <FiCheck className="ml-auto text-indigo-600 w-5 h-5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* How did you hear about us */}
       <div className="mb-8">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    How did you hear about PlayJosh?
  </label>
  <div className="grid grid-cols-2 gap-3">
    {hearAboutUsOptions.map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => {
          setHearAboutUs(option.id)
          setError(null)
        }}
        className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
          hearAboutUs === option.id
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <span className="text-2xl mr-3" role="img" aria-hidden="true">
          {option.emoji}
        </span>
        <span className="font-medium text-gray-800">{option.label}</span>
        {hearAboutUs === option.id && (
          <FiCheck className="ml-auto text-indigo-600 w-5 h-5" />
        )}
      </button>
    ))}
  </div>
</div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full text-center text-sm font-medium text-indigo-500 hover:text-indigo-600 cursor-pointer"
          >
            {isSubmitting ? 'Skipping...' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  )
}
