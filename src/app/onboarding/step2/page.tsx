'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { FiArrowLeft, FiMapPin } from 'react-icons/fi';

export default function Step2() {
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [playingLevel, setPlayingLevel] = useState<string>('');
  const [profileStrength, setProfileStrength] = useState(60);
  const [errors, setErrors] = useState<{bio?: string, playingLevel?: string}>({});

useEffect(() => {
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      
      if (!session) {
        console.log('No active session, redirecting to login');
        router.push('/login');
      } else {
        console.log('Session exists:', session.user?.email);
      }
    } catch (err) {
      console.error('Error in session check:', err);
    } 
  };
  
  checkSession();
}, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {bio?: string, playingLevel?: string} = {};
    
    if (!bio.trim()) {
      newErrors.bio = 'Please tell us about yourself';
    }
    
    if (!playingLevel) {
      newErrors.playingLevel = 'Please select your playing level';
    }
    
    setErrors(newErrors);
    
    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.email) throw new Error('Not authenticated');

      // Update the profile with step 2 data
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          playing_level: playingLevel,
          onboarding_status: 'step2_completed',
          updated_at: new Date().toISOString()
        } as Partial<Database['public']['Tables']['profiles']['Update']>)
        .eq('email', user.email);

      if (error) throw error;

      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          onboarding_status: 'step2_completed'
        }
      });
      if (updateError) throw updateError;

      router.push('/onboarding/step3');
    } catch (err) {
      console.error('Error saving profile:', err);
      // Show error message to the user
      setErrors({ bio: 'Failed to save profile. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with back button and progress */}
      <header className="mb-10">
        <button 
          onClick={() =>router.push('/onboarding/step1')}
          className="text-gray-700 hover:text-gray-900 transition-colors"
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
                    ${step === 2 ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'}
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`h-1.5 w-full mt-4 ${step <= 2 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          Professional Touch
        </h1>
        <p className="text-gray-600 mb-6 text-base">
          Let coaches and scouts know who you are.
        </p>

        {/* Profile Strength */}
        <div className="bg-gray-50 p-4 rounded-xl mb-8">
          <h3 className="text-base font-medium text-gray-900 mb-2">Profile Strength</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-indigo-500 h-2.5 rounded-full" 
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {profileStrength}% complete • 
            {profileStrength < 80 && (
              <span className="text-indigo-600 font-medium"> Add bio to hit 80%!</span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Playing Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              YOUR PLAYING LEVEL 
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setPlayingLevel(level);
                    // Playing level selection doesn't affect profile strength
                  }}
                  className={`py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${
                    playingLevel === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            {errors?.playingLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.playingLevel}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              YOUR BIO
            </label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  // Update profile strength based on bio length
                  // Only update profile strength based on bio
                  setProfileStrength(e.target.value.length > 0 ? 80 : 60);
                }}
                className={`block w-full px-4 py-3 border-2 ${errors.bio ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all h-32 resize-none`}
                placeholder="Tell us about your playstyle..."
                maxLength={200}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {bio.length}/200
              </div>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
              <div className="absolute top-3 right-3 flex space-x-1">
            <span className="text-gray-300">🏀</span>
            <span className="text-gray-300">😊</span>
          </div>
            </div>
          </div>

{/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Next
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => router.push('/onboarding/step3')}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
