'use client'

import { useEffect, useState } from 'react'
// import Image from 'next/image'
import { FiUser, FiMapPin, FiAward, FiActivity, FiUsers, FiCalendar } from 'react-icons/fi'
import { FaFutbol, FaBasketballBall, FaRunning, FaSwimmer } from 'react-icons/fa'

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  age?: number | null;
  sports?: string[] | null; // Changed to match the actual data structure
}

// Sports icons mapping
const getSportIcon = (sportName: string) => {
  const lowerName = sportName.toLowerCase();
  if (lowerName.includes('football') || lowerName.includes('soccer')) {
    return <FaFutbol className="text-blue-600" />;
  } else if (lowerName.includes('basket')) {
    return <FaBasketballBall className="text-orange-500" />;
  } else if (lowerName.includes('run') || lowerName.includes('jog')) {
    return <FaRunning className="text-green-500" />;
  } else if (lowerName.includes('swim')) {
    return <FaSwimmer className="text-blue-400" />;
  }
  return <FaFutbol className="text-gray-500" />; // Default icon
};

// Mock data for achievements and certifications
const achievements = [
  { 
    id: 1,
    title: '5K Run Champion', 
    date: '2023', 
    description: '1st place in City Marathon',
    type: 'achievement',
    icon: '🏆'
  },
  { 
    id: 2,
    title: 'Basketball Tournament', 
    date: '2022', 
    description: 'MVP of the season',
    type: 'achievement',
    icon: '🏀'
  },
  { 
    id: 3,
    title: 'Advanced Sports Nutrition', 
    date: '2023', 
    description: 'Certified by Sports Nutrition Association',
    type: 'certification',
    icon: '📜',
    issuer: 'Sports Nutrition Association',
    credentialId: 'SNA-2023-45678',
    issueDate: 'Jun 2023',
    expiryDate: 'Jun 2025',
    skills: ['Nutrition Planning', 'Diet Management', 'Performance Diet']
  },
  { 
    id: 4,
    title: 'Fitness Trainer Certification', 
    date: '2023', 
    description: 'Certified Personal Trainer',
    type: 'certification',
    icon: '💪',
    issuer: 'International Sports Sciences Association',
    credentialId: 'ISSA-78901',
    issueDate: 'Mar 2023',
    skills: ['Fitness Assessment', 'Program Design', 'Injury Prevention']
  },
  { 
    id: 5,
    title: '100-Day Fitness Challenge', 
    date: '2023', 
    description: 'Successfully completed the challenge',
    type: 'achievement',
    icon: '🔥'
  },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [showAllAchievements, setShowAllAchievements] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
     

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      // Get the profile data including the sports field
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      // Parse the sports data based on its type
      if (data) {
        // If sports is a string, try to parse it as JSON
        if (typeof data.sports === 'string') {
          try {
            data.sports = JSON.parse(data.sports);
          } catch (e) {
            console.error('Error parsing sports data:', e);
            data.sports = [];
          }
        }
        // Ensure sports is an array
        if (!Array.isArray(data.sports)) {
          data.sports = [];
        }
      }

      // If there's a profile photo, construct the full URL
      if (data?.profile_photo) {
        let url = data.profile_photo;
        // If it's not a full URL, construct it
        if (!url.startsWith('http')) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(data.profile_photo);
          url = publicUrl;
        }
        // Add a cache-busting query parameter to ensure fresh images
        setImageUrl(`${url}?t=${Date.now()}`);
      }

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  /* ---------- STATES ---------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found.</p>
      </div>
    )
  }

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="h-72 bg-gray-200 relative">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/40 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Profile Photo */}
              <div className="relative -mt-7 mb-4 md:mb-0 md:mr-6">
                <div className="h-44 w-44 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                  {imageUrl && !imageError ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={() => setImageError(true)}
                      />
                    </>
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-400 text-6xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.full_name || 'Sports Enthusiast'}
                </h1>
                
                {profile.role && (
                  <p className="text-lg text-gray-600 mt-1">
                    {profile.role} • Sports Enthusiast
                  </p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                  {profile.location && (
                    <div className="flex items-center text-gray-500">
                      <FiMapPin className="mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.age && (
                    <div className="flex items-center text-gray-500">
                      <span>•</span>
                      <span className="ml-2">{profile.age} years</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                    <FiActivity className="mr-1" /> Active Member
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
                    <FiUsers className="mr-1" /> Team Player
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Sports Interests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaFutbol className="mr-2 text-blue-600" />
                Sports Interests
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.sports && profile.sports.length > 0 ? (
                  profile.sports.map((sport, index) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="p-2 bg-gray-100 rounded-full mr-3">
                        {getSportIcon(sport)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{sport}</h3>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No sports interests added yet.</p>
                )}
              </div>
            </div>

            {/* Achievements & Certifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FiAward className="mr-2 text-yellow-500" />
                  Achievements & Certifications
                </h2>
              </div>

              <div className="space-y-6">
                {achievements.slice(0, showAllAchievements ? achievements.length : 2).map((item) => (
                  <div key={item.id} className="achievement-item border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {item.type === 'certification' ? (
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                            {item.icon}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{item.issuer}</p>
                            <p className="text-sm text-gray-500 mt-1">Issued {item.issueDate} • {item.credentialId}</p>
                            {item.expiryDate && (
                              <p className="text-sm text-amber-600 mt-1">Expires {item.expiryDate}</p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.skills?.map((skill, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                              View Certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="shrink-0 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
                            {item.icon}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                            <p className="mt-1 text-gray-700">{item.description}</p>
                            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                              view certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!showAllAchievements && achievements.length > 2 && (
                <div className="mt-6 text-center">
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowAllAchievements(true)}
                  >
                    View All Achievements & Certifications
                    <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Goals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                🎯 Goals
              </h2>
              <div className="space-y-6">
                {/* Short-term Goal */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Short-term Goal</h3>
                      <p className="mt-1 text-gray-700">&quot;Want State selection in 6 months&quot;</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1">75% progress</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Long-term Goal */}
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Long-term Goal</h3>
                      <p className="mt-1 text-gray-700">&quot;Want to Represent India at national level&quot;</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full w-1/3"></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1">33% progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
           
          
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiCalendar className="mr-2 text-purple-500" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="shrink-0 bg-purple-100 rounded-lg p-2">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-800">JAN</div>
                      <div className="text-lg font-bold text-purple-600">15</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Basketball Tournament</h3>
                    <p className="text-sm text-gray-500">9:00 AM - 2:00 PM</p>
                    <p className="mt-1 text-sm text-gray-600">Downtown Sports Complex</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="shrink-0 bg-blue-100 rounded-lg p-2">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-800">JAN</div>
                      <div className="text-lg font-bold text-blue-600">22</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Marathon Training</h3>
                    <p className="text-sm text-gray-500">6:00 AM - 8:00 AM</p>
                    <p className="mt-1 text-sm text-gray-600">Riverside Park</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
