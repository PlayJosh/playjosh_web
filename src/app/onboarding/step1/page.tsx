'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiCamera, FiSearch, FiX } from 'react-icons/fi'
import { FaFutbol, FaUserTie, FaHeart } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'

type UserType = 'player' | 'coach' | 'fan' | null
type Tag = { id: string; name: string }

export default function Step1() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState<UserType>(null)
  const [searchQuery, setSearchQuery] = useState('')
  

  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: '3', name: 'Basketball' },
    { id: '4', name: 'Tennis' },
    { id: '5', name: 'Swimming' },
    { id: '1', name: 'Soccer' },
    { id: '2', name: 'Fitness' },
  ])

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= 5) return
    setSelectedTags([...selectedTags, tag])
    setAvailableTags(availableTags.filter((t) => t.id !== tag.id))
  }

  const handleTagRemove = (tagId: string) => {
    const tagToRemove = selectedTags.find((tag) => tag.id === tagId)
    if (!tagToRemove) return

    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId))
    setAvailableTags([...availableTags, tagToRemove])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !userType || selectedTags.length < 3) return

    

    try {
      const { data, error: authError } = await supabase.auth.getUser()
      const user = data.user
      if (authError || !user?.email) throw new Error('Not authenticated')

      const profilePayload: Record<string, unknown> = {
        email: user.email,
        full_name: fullName,
        role: userType,
        onboarding_complete: false,
        profile_photo: null,
      }

      const profilesStep1 = supabase.from('profiles_step1') as unknown as {
        upsert: (values: unknown) => Promise<{ error: unknown }>
      }

      const { error: profileError } = await profilesStep1.upsert(profilePayload)
      if (profileError) throw profileError

      const sportsPayload: Record<string, unknown>[] = selectedTags.map((tag) => ({
        email: user.email,
        sport: tag.name,
      }))

      await supabase.from('user_sports').delete().eq('email', user.email)

      const userSports = supabase.from('user_sports') as unknown as {
        insert: (values: unknown[]) => Promise<{ error: unknown }>
      }

      const { error: sportsError } = await userSports.insert(sportsPayload)
      if (sportsError) throw sportsError

      // Update user metadata to indicate step 1 is completed
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarding_started: true,
          onboarding_step: 'step1_completed',
          ...user.user_metadata // Preserve existing metadata
        }
      })
      if (updateError) throw updateError

      router.push('/onboarding/step2')
    } catch (err: unknown) {
      console.error('Error saving data:', err)
      
  }
}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-10">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={28} />
        </button>
      </header>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {"Let's Get You Set Up for PlayJosh!"}
        </h1>
        <p className="text-gray-600 mb-10 text-base">
          Build your profile to start connecting with athletes and coaches.
        </p>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 bg-white hover:border-indigo-500 transition-colors group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                console.log(e.target.files?.[0]);
              }}
            />
            <div className="text-center group-hover:text-indigo-500 transition-colors">
              <FiCamera className="mx-auto text-gray-400 group-hover:text-indigo-500 mb-2" size={32} />
              <span className="text-sm text-gray-500 group-hover:text-indigo-600">ADD PHOTO</span>
            </div>
          </div>
          <button
            type="button"
            className="bg-indigo-500 text-white rounded-full p-2.5 absolute mt-28 ml-28 shadow-lg hover:bg-indigo-600 transition-colors"
          >
            <FiCamera size={18} />
          </button>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            FULL NAME
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
              placeholder="e.g. Amit Kumar"
              required
            />
          </div>
        </div>

        {/* I AM A */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            I AM A
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUserType('player')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                userType === 'player'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <FaFutbol
                className={`text-2xl mb-2 ${
                  userType === 'player' ? 'text-indigo-500' : 'text-gray-400'
                }`}
              />
              <span className={`text-sm font-medium ${
                userType === 'player' ? 'text-gray-900' : 'text-gray-600'
              }`}>Player</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('coach')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                userType === 'coach'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <FaUserTie
                className={`text-2xl mb-2 ${
                  userType === 'coach' ? 'text-indigo-500' : 'text-gray-400'
                }`}
              />
              <span className={`text-sm font-medium ${
                userType === 'coach' ? 'text-gray-900' : 'text-gray-600'
              }`}>Coach</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('fan')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                userType === 'fan'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <FaHeart
                className={`text-2xl mb-2 ${
                  userType === 'fan' ? 'text-indigo-500' : 'text-gray-400'
                }`}
              />
              <span className={`text-sm font-medium ${
                userType === 'fan' ? 'text-gray-900' : 'text-gray-600'
              }`}>Fan</span>
            </button>
          </div>
        </div>

        {/* Sports & Tags */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">
              SPORTS & TAGS
            </label>
            <span className="text-xs text-gray-500 font-medium">3-5 required</span>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Search interests (e.g. Soccer, HIIT)"
            />
          </div>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center bg-indigo-100 rounded-full px-4 py-2 text-sm"
              >
                <span className="text-indigo-800 font-medium">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag.id)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Available Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {availableTags
              .filter(tag =>
                tag.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className="bg-white border-2 border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                >
                  {tag.name}
                </button>
              ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          disabled={!fullName || !userType || selectedTags.length < 3}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-all ${
            fullName && userType && selectedTags.length >= 3
              ? 'bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Next Step
          <span className="ml-2">→</span>
        </button>
      </form>
    </div>
  </div>
);

}

