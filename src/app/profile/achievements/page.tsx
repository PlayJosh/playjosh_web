'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import type { Database } from '@/types/database.types'

type Achievement = Database['public']['Tables']['profile_achievements']['Insert']

export default function AddEditAchievement({ params }: { params: { id?: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const [formData, setFormData] = useState<Omit<Achievement, 'profile_email' | 'created_at'>>({
    title: '',
    sport: '',
    level: 'school',
    year: new Date().getFullYear(),
    description: '',
    certificate_url: null,
  })

  useEffect(() => {
    if (params.id) {
      // In a real implementation, fetch the existing achievement data
      // and set it to formData
      // fetchAchievement(params.id)
      setIsEditMode(true)
    }
  }, [params.id])

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
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
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

      const achievementData: Achievement = {
        profile_email: user.email,
        title: formData.title,
        sport: formData.sport,
        level: formData.level,
        year: formData.year,
        description: formData.description || null,
        certificate_url: certificateUrl || null,
        created_at: new Date().toISOString()
      }

      if (isEditMode && params.id) {
        // Update existing achievement
        const { error } = await supabase
          .from('profile_achievements')
          .update(achievementData)
          .eq('profile_email', user.email)
          .eq('title', formData.title)
          .eq('year', formData.year)
        
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full mr-4"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Achievement' : 'Add New Achievement'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. District Cricket Championship Winner"
            required
          />
        </div>

        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
            Sport *
          </label>
          <input
            type="text"
            id="sport"
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Cricket, Football, etc."
            required
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Level *
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            min="1950"
            max={new Date().getFullYear()}
            value={formData.year}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (1-2 lines)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of your achievement..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate / Proof (Image or PDF)
          </label>
          <div className="mt-1 flex items-center">
            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FiUpload className="inline-block mr-2" />
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
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX className="w-3 h-3" />
                </button>
                <img 
                  src={previewUrl} 
                  alt="Certificate preview" 
                  className="h-12 w-auto object-cover rounded"
                />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload a clear image or PDF of your certificate (max 5MB)
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Achievement'}
          </button>
        </div>
      </form>
    </div>
  )
}
