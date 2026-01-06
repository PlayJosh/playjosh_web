'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiPlus, FiX } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'

export default function EditSportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sports, setSports] = useState<string[]>([])
  const [newSport, setNewSport] = useState('')

  useEffect(() => {
    const loadSports = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) throw new Error('User not found')

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('sports')
          .eq('email', user.email)
          .single()

        if (profileError) throw profileError

        if (data?.sports) {
          // Ensure we have an array of strings
          const sportsArray = Array.isArray(data.sports) 
            ? data.sports.filter(sport => typeof sport === 'string')
            : []
          setSports(sportsArray)
        }
      } catch (err) {
        console.error('Error loading sports:', err)
        setError('Failed to load sports interests')
      } finally {
        setLoading(false)
      }
    }

    loadSports()
  }, [])

  const addSport = () => {
    const trimmedSport = newSport.trim()
    if (trimmedSport && !sports.includes(trimmedSport)) {
      setSports([...sports, trimmedSport])
      setNewSport('')
    }
  }

  const removeSport = (sportToRemove: string) => {
    setSports(sports.filter(sport => sport !== sportToRemove))
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
          sports: sports.length > 0 ? sports : null,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1500)
    } catch (err) {
      console.error('Error updating sports:', err)
      setError(err instanceof Error ? err.message : 'Failed to update sports interests')
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Sports Interests</h1>
          <p className="mt-1 text-sm text-gray-600">Add or remove sports you&apos;re interested in</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Sports interests updated successfully! Redirecting back to profile...
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Add Sport */}
            <div>
              <label htmlFor="newSport" className="block text-sm font-medium text-gray-700 mb-1">
                Add a Sport
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="newSport"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSport())}
                  className="flex-1 min-w-0 block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Football, Basketball, Swimming"
                />
                <button
                  type="button"
                  onClick={addSport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Press Enter or click + to add a sport</p>
            </div>

            {/* Current Sports */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Your Sports ({sports.length})
              </h3>
              
              {sports.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No sports added yet.</p>
              ) : (
                <div className="space-y-2">
                  {sports.map((sport, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-800">{sport}</span>
                      <button
                        type="button"
                        onClick={() => removeSport(sport)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove sport"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                    Save Changes
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
