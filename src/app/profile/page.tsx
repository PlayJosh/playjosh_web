'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiUser, FiMapPin, FiAward, FiActivity, FiUsers, FiCalendar, FiEdit2, FiPlus, FiTarget, FiClock, FiX } from 'react-icons/fi'
import { FaFutbol, FaBasketballBall, FaRunning, FaSwimmer } from 'react-icons/fa'

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { Goal } from './goals/page' // Updated import path

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  age?: number | null;
  sports?: string[] | null;
  goals?: Goal[] | null;
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

import AchievementsList from './components/AchievementsList'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          throw new Error('User not found');
        }

        // Get the profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        // Parse the sports data if needed
        if (data) {
          if (typeof data.sports === 'string') {
            try {
              data.sports = JSON.parse(data.sports);
            } catch (e) {
              console.error('Error parsing sports data:', e);
              data.sports = [];
            }
          }
          if (!Array.isArray(data.sports)) {
            data.sports = [];
          }
        }

        // Update profile state without affecting goals
        setProfile(prevProfile => ({
          ...data,
          // Preserve the existing goals if they exist
          goals: prevProfile?.goals || []
        }));

        // Handle profile photo
        if (data?.profile_photo) {
          let url = data.profile_photo;
          if (!url.startsWith('http')) {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(data.profile_photo);
            url = publicUrl;
          }
          setImageUrl(`${url}?t=${Date.now()}`);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    const loadGoals = async () => {
      try {
        setLoadingGoals(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setGoals([]);
          return;
        }

        console.log('Fetching goals for:', user.email);

        const { data, error } = await supabase
          .from('profile_goals')
          .select('*')
          .eq('profile_email', user.email)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched goals:', data);

        if (data && data.length > 0) {
          // Ensure proper typing of the goals
          const typedGoals = data.map(goal => ({
            ...goal,
            goal_type: goal.goal_type === 'long_term' ? 'long_term' as const : 'short_term' as const
          }));

          console.log('Typed goals:', typedGoals);
          setGoals(typedGoals);
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        setGoals([]);
      } finally {
        setLoadingGoals(false);
      }
    }

    const fetchData = async () => {
      try {
        await loadProfile();
        await loadGoals();
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    let isMounted = true;

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [])

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('Current goals state:', goals);
  }, [goals]);

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden relative w-full">
          <Link
            href="/profile/basicinfo"
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors p-2"
            title="Edit profile"
          >
            <FiEdit2 className="h-5 w-5" />
          </Link>
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Profile Photo - Left Side */}
              <div className="shrink-0 flex justify-start mb-6 md:mb-0 md:mr-8">
                <div 
                  className="h-40 w-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => imageUrl && !imageError && setIsPhotoModalOpen(true)}
                >
                  {imageUrl && !imageError ? (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-400 text-5xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info - Right Side */}
              <div className="flex-1">
                <div className="md:pl-6 w-full">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.full_name || 'Sports Enthusiast'}
                  </h1>

                  {/* Headline */}
                  <div className="mt-1 group relative">
                    {profile.headline ? (
                      <p className="text-lg text-gray-700">
                        {profile.headline}
                      </p>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-lg text-gray-500 italic">
                          Add a headline to introduce yourself
                        </p>
                        <FiEdit2 className="ml-2 h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    )}
                    <Link
                      href="/profile/basicinfo"
                      className="absolute inset-0"
                      title={profile.headline ? 'Edit headline' : 'Add headline'}
                    />
                  </div>

                  {/* Role • Playing Level */}
                  <div className="flex items-center text-gray-600 mt-2">
                    {profile.role && (
                      <span className="font-medium">{profile.role}</span>
                    )}
                    {profile.playing_level && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{profile.playing_level}</span>
                      </>
                    )}
                  </div>

                  {/* Location • Age */}
                  <div className="flex items-center text-gray-500 mt-1 -ml-1">
                    {profile.location && (
                      <span className="flex items-center">
                        <FiMapPin className="mr-1" />
                        <span>{profile.location}</span>
                      </span>
                    )}
                    {profile.age && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{profile.age} years</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                      <FiActivity className="mr-1" /> Active Member
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
                      <FiUsers className="mr-1" /> Team Player
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6 border-t border-gray-200 pt-6 w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                <Link
                  href="/profile/bio"
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title={profile.bio ? 'Edit bio' : 'Add bio'}
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
              </div>
              {profile.bio ? (
                <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">
                  No bio added yet. Click the edit button to add one.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 space-y-6">
          {/* Main Content - Full Width */}
          <div className="space-y-6 w-full">
            {/* Sports Interests */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FaFutbol className="mr-2 text-blue-600" />
                  Sports Interests
                </h2>
                <Link
                  href="/profile/sports"
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title="Edit sports interests"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
              </div>
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
            {/* Goals Section */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiTarget className="mr-2 text-indigo-600" />
                  My Goals
                </h2>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/profile/goals"
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    title="Add new goal"
                  >
                    <FiPlus className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/profile/goals"
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    title="Edit goals"
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {loadingGoals ? (
                // Loading state
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : goals.length > 0 ? (
                // Goals list
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={`${goal.id}-${goal.goal_type}`}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${goal.goal_type === 'short_term' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {goal.goal_type === 'short_term' ? (
                          <FiClock className="h-4 w-4" />
                        ) : (
                          <FiTarget className="h-4 w-4" />
                        )}
                      </div>
                      <p className="ml-3 text-gray-800 line-clamp-1">{goal.goal}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">No goals set yet</p>
                  <Link
                    href="/profile/goals"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiTarget className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Set Your First Goal
                  </Link>
                </div>
              )}
            </div>

            {/* Achievements & Certifications */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FiAward className="mr-2 text-yellow-500" />
                  Achievements & Certifications
                </h2>
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/profile/achievements/edit"
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    title="Add new achievement"
                  >
                    <FiPlus className="h-5 w-5" />
                    <span className="sr-only">Add New</span>
                  </Link>
                  
                </div>
              </div>

              <div className="space-y-6">
                <div className="mt-8">
                  <AchievementsList />
                </div>
              </div>
            </div>

          </div>

          {/* Goals Section */}
          {/* <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="ml-3 text-xl font-semibold text-gray-900">My Goals</h2>
              </div>
              <Link 
                href="/profile/goals"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="Edit goals"
              >
                <FiEdit2 className="mr-1.5 h-4 w-4" />
                Edit
              </Link>
            </div>

            <div className="text-center py-8 px-4 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No goals set yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                Set your sports goals to track your progress and stay motivated on your journey.
              </p>
              <div className="mt-6">
                <Link
                  href="/profile/goals"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Your First Goal
                </Link>
              </div>
            </div>
          </div> */}

          {/* Upcoming Events */}
          {/* <div className="bg-white rounded-lg shadow-md p-6">
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
                </div> */}
          {/* </div> */}
          {/* </div> */}
        </div>
      </div>

      {/* Profile Photo Modal */}
      {isPhotoModalOpen && imageUrl && !imageError && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
              onClick={() => setIsPhotoModalOpen(false)}
              aria-label="Close"
            >
              <FiX className="h-6 w-6" />
            </button>
            <div className="h-80 w-80 md:h-96 md:w-96 rounded-full border-8 border-white shadow-2xl overflow-hidden transform transition-all duration-300 animate-fadeIn">
              <img 
                src={imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
