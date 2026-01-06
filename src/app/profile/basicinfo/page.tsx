'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCamera, FiSave, FiUser } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function EditBasicInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    playing_level: '',
    location: '',
    age: '',
    headline: '',
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) throw new Error('User not found')

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single()

        if (profileError) throw profileError

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            role: data.role || '',
            playing_level: data.playing_level || '',
            location: data.location || '',
            age: data.age ? data.age.toString() : '',
            headline: data.headline || '',
          })
          
          if (data.profile_photo) {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(data.profile_photo)
            setPreviewUrl(publicUrl)
          }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePhoto(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImageError(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Client-side validation
      const requiredFields = ['full_name', 'playing_level', 'age']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]?.toString().trim()) {
          throw new Error(`Please fill in all required fields (${field.replace('_', ' ')} is required)`)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not found')

      let photoUrl = null

      // Upload new profile photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(`public/${fileName}`, profilePhoto)

        if (uploadError) throw uploadError

        // Get public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`public/${fileName}`)
        
        photoUrl = `public/${fileName}`
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          playing_level: formData.playing_level,
          location: formData.location,
          age: formData.age ? parseInt(formData.age) : null,
          headline: formData.headline,
          ...(photoUrl && { profile_photo: photoUrl }),
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1500)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
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

  const playingLevels = [
    'Beginner',
    'Intercity',
    'District ',
    'State ',
    'National'
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Basic Information</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Profile updated successfully! Redirecting back to profile...
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Profile Photo */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="relative group">
                <div className="h-36 w-36 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  {previewUrl && !imageError ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-400 text-5xl" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg cursor-pointer transition-all hover:bg-blue-50 hover:scale-105">
                  <FiCamera className="text-blue-600" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-semibold text-gray-800">Profile Photo</h2>
                <p className="mt-2 text-sm text-gray-600">We recommend using a square image at least 400x400 pixels.</p>
                <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size 5MB</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="border-t border-gray-200 pt-6">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="e.g., Football Player, Coach, etc."
                />
                <p className="mt-1 text-xs text-gray-500">Your role or position in sports</p>
              </div>
            </div>

            {/* Playing Level */}
            <div>
              <label htmlFor="playing_level" className="block text-sm font-medium text-gray-700 mb-1">
                Playing Level <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <select
                  id="playing_level"
                  name="playing_level"
                  value={formData.playing_level}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  className="appearance-none block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm cursor-pointer pr-10"
                >
                  <option value="">Select your level</option>
                  {playingLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                Headline
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="headline"
                  id="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  maxLength={100}
                  className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="e.g., Professional Football Player | Fitness Enthusiast"
                />
                <p className="mt-1 text-xs text-gray-500">A short, catchy phrase that describes you</p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="e.g., New York, USA"
                />
                <p className="mt-1 text-xs text-gray-500">Your city and country</p>
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="age"
                  id="age"
                  min="10"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="Enter your age"
                />
                <p className="mt-1 text-xs text-gray-500">Must be between 10-100 years</p>
              </div>
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
