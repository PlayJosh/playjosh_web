'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export default function EditBioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [bio, setBio] = useState('')
  const maxLength = 500

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) throw new Error('User not found')

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('bio')
          .eq('email', user.email)
          .single()

        if (profileError) throw profileError

        if (data) {
          setBio(data.bio || '')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value
    if (newBio.length <= maxLength) {
      setBio(newBio)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not found')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1500)
    } catch (err) {
      console.error('Error updating bio:', err)
      setError(err instanceof Error ? err.message : 'Failed to update bio')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Bio</h1>
          <p className="mt-1 text-sm text-gray-600">Tell others about yourself, your experience, and what you&apos;re looking for.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Bio updated successfully! Redirecting back to profile...
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                About You
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={8}
                  value={bio}
                  onChange={handleBioChange}
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm resize-none"
                  placeholder="Share your story, experience, achievements, or what you're looking for in the sports community..."
                  maxLength={maxLength}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{bio.length}/{maxLength} characters</span>
                  <span>Max {maxLength} characters</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for a great bio:</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Mention your sports background and experience level</li>
                <li>List your achievements or milestones</li>
                <li>Share what you&apos;re looking for (training partners, teams, etc.)</li>
                <li>Be authentic and let your personality shine through</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto bg-white py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="-ml-1 mr-2 h-4 w-4" />
                    Save Bio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
