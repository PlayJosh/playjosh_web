'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiX, FiAward } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Achievement = Database['public']['Tables']['profile_achievements']['Row']

export default function EditAchievement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const title = searchParams.get('title')
  const year = searchParams.get('year')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Omit<Achievement, 'profile_email' | 'created_at'>>({
    title: '',
    sport: '',
    level: 'school',
    year: new Date().getFullYear(),
    description: '',
    certificate_url: null,
  })

  useEffect(() => {
    if (title && year) {
      fetchAchievement(title, parseInt(year))
    }
  }, [title, year])

  const fetchAchievement = async (achievementTitle: string, achievementYear: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('profile_achievements')
        .select('*')
        .eq('profile_email', user.email)
        .eq('title', achievementTitle)
        .eq('year', achievementYear)
        .single()

      if (error) throw error
      if (data) {
        setFormData(data)
        if (data.certificate_url) {
          setPreviewUrl(data.certificate_url)
        }
      }
    } catch (err: any) {
      console.error('Error fetching achievement:', err)
      setError(err.message || 'Failed to load achievement')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const uploadFile = async () => {
    if (!file) return null
    const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('User not authenticated');
    
    const safeEmail = user.email.replace(/[^a-zA-Z0-9@._-]/g, '_');
    const fileExt = file.name.split('.').pop()
    const fileName = `${safeEmail}/${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
    const filePath = `certificates/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('achievements')
      .upload(filePath, file)
    
    if (error) throw error
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('achievements')
      .getPublicUrl(data.path)
      
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      // Upload file if a new one was selected
      let certificateUrl = formData.certificate_url
      if (file) {
        certificateUrl = await uploadFile()
      }

      const achievementData = {
        ...formData,
        profile_email: user.email,
        certificate_url: certificateUrl,
      }

      if (title && year) {
        // Update existing achievement
        const { error } = await supabase
          .from('profile_achievements')
          .update(achievementData)
          .eq('profile_email', user.email)
          .eq('title', title)
          .eq('year', parseInt(year))
        
        if (error) throw error
      } else {
        // Create new achievement
        const { error } = await supabase
          .from('profile_achievements')
          .insert(achievementData)
        
        if (error) throw error
      }

      router.push('/profile')
    } catch (err: any) {
      console.error('Error saving achievement:', err)
      setError(err.message || 'Failed to save achievement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full mr-4 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {title && year ? 'Edit Achievement' : 'Add New Achievement'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition duration-200"
            placeholder="e.g. District Cricket Championship Winner"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="sport" className="block text-sm font-medium text-gray-800 mb-1">
            Sport <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="sport"
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition duration-200"
            placeholder="e.g. Cricket, Football, etc."
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="level" className="block text-sm font-medium text-gray-800 mb-1">
            Level <span className="text-red-500">*</span>
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white transition duration-200"
            required
          >
            <option value="school">School</option>
            <option value="district">District</option>
            <option value="state">State</option>
            <option value="national">National</option>
            <option value="international">International</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="year" className="block text-sm font-medium text-gray-800 mb-1">
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="year"
            name="year"
            min="1950"
            max={new Date().getFullYear()}
            value={formData.year}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition duration-200"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1">
            Description <span className="text-gray-500 font-normal">(1-2 lines)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition duration-200"
            placeholder="Brief description of your achievement..."
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Certificate / Proof <span className="text-gray-500 font-normal">(Image or PDF)</span>
          </label>
          <div className="mt-1 flex items-center">
            <label className="cursor-pointer bg-white py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 inline-flex items-center">
              <FiUpload className="inline-block mr-2 h-4 w-4" />
              {file ? file.name : 'Choose file'}
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </label>
            {previewUrl && (
              <div className="ml-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl(null)
                    setFormData(prev => ({ ...prev, certificate_url: null }))
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX className="w-3 h-3" />
                </button>
                {previewUrl.match(/\.pdf$/i) ? (
                  <div className="h-12 w-12 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-red-700">PDF</span>
                  </div>
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Certificate preview" 
                    className="h-12 w-auto object-cover rounded"
                  />
                )}
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload a clear image or PDF of your certificate (max 5MB)
          </p>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
          <Link
            href="/profile"
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Achievement'}
          </button>
        </div>
      </form>
    </div>
  )
}
