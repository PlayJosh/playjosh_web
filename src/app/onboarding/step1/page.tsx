'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiCamera, FiSearch, FiX, FiMapPin } from 'react-icons/fi'
import { FaFutbol, FaUserTie, FaHeart } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'


type UserType = 'player' | 'coach' | 'fan' | null
type Tag = { id: string; name: string }

export default function Step1() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [location, setLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: '1', name: 'Soccer' },
    { id: '2', name: 'Fitness' },
    { id: '3', name: 'Basketball' },
    { id: '4', name: 'Tennis' },
    { id: '5', name: 'Swimming' },
    { id: '6', name: 'Running' },
    { id: '7', name: 'Cycling' },
    { id: '8', name: 'Yoga' },
    { id: '9', name: 'Volleyball' },
    { id: '10', name: 'Badminton' },
  ])

  const getLocation = async () => {
  if (!navigator.geolocation) {
    setLocationError('Geolocation is not supported by your browser');
    return;
  }

  setIsLocating(true);
  setLocationError(null);

  try {
    // Get coordinates first
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    const response = await fetch(`/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch location data');
    }

    const locationParts = [
      data.city,
      data.state,
      data.country
    ].filter(Boolean);
    
    if (locationParts.length === 0) {
      throw new Error('Could not determine location from coordinates');
    }
    
    setLocation(locationParts.join(', '));
  } catch (error) {
    console.error('Error getting location:', error);
    setLocationError(error instanceof Error ? error.message : 'Unable to get your location. Please enter it manually.');
  } finally {
    setIsLocating(false);
  }
};
  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= 5) return
    setSelectedTags([...selectedTags, tag])
    setAvailableTags(availableTags.filter((t) => t.id !== tag.id))
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTagRemove = (tagId: string) => {
    const tagToRemove = selectedTags.find((tag) => tag.id === tagId)
    if (!tagToRemove) return

    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId))
    setAvailableTags([...availableTags, tagToRemove])
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setUploadError(null);
  
  // Form validation
  if (!age) {
    setUploadError('Please enter your age');
    return;
  }
  
  if (age < 6 || age > 120) {
    setUploadError('Please enter a valid age between 6 and 120');
    return;
  }
  
  if (!location.trim()) {
    setUploadError('Please enter your location');
    return;
  }
  
  console.log('Form submission started');

  try {
    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User data:', { user, authError });
    
    if (authError || !user?.email) {
      throw new Error('Not authenticated: ' + (authError?.message || 'No user email'));
    }

    let imageUrl = null;
    const file = fileInputRef.current?.files?.[0];
    console.log('Selected file:', file ? 'File selected' : 'No file selected');

    if (selectedImage && file) {
      try {
        console.log('Starting file upload...');
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        console.log('Generated filename:', fileName);

        // 2. Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        console.log('Upload response:', { uploadData, uploadError });
        if (uploadError) throw uploadError;

        // 3. Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
        console.log('Generated public URL:', publicUrl);
      } catch (err) {
        const error = err as Error;
        console.error('Upload failed:', error);
        throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
      }
    }

    // 4. Update profile
    console.log('Updating profile with image URL:', imageUrl);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        age: Number(age),
        location: location.trim(),
        role: userType,
        sports: selectedTags.map(tag => tag.name),
        profile_photo: imageUrl,
        onboarding_status: 'step1_completed',
        updated_at: new Date().toISOString()
      })
      .eq('email', user.email)
      .select();

    console.log('Profile update response:', { profileData, profileError });
    if (profileError) throw profileError;

    // 5. Update auth metadata
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        onboarding_status: 'step1_completed',
        full_name: fullName,
        user_type: userType,
        profile_photo: imageUrl
      }
    });

    console.log('Auth update response:', { updateData, updateError });
    if (updateError) throw updateError;

    console.log('All updates successful, redirecting...');
    router.push('/onboarding/step2');
  } catch (err) {
    const error = err as Error;
    console.error('Error in handleSubmit:', error);
    setUploadError(error.message || 'Failed to save profile. Please try again.');
  }
};
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with back button and progress */}
      <header className="mb-10">
        <button 
          onClick={() => router.back()}
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
                    ${step === 1 ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'}
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`h-1.5 w-full mt-4 ${step < 1 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageUpload}
            />
            {selectedImage ? (
              <div className="w-full h-full rounded-full overflow-hidden">
               <Image
  src={selectedImage}
  alt="Profile preview"
  fill
  className="object-cover"
/>
              </div>
            ) : (
              <div className="text-center group-hover:text-indigo-500 transition-colors">
                <FiCamera className="mx-auto text-gray-400 group-hover:text-indigo-500 mb-2" size={32} />
                <span className="text-sm text-gray-500 group-hover:text-indigo-600">ADD PHOTO</span>
              </div>
            )}
          </div>
          {selectedImage ? (
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white rounded-full p-2 absolute mt-28 ml-28 shadow-lg hover:bg-red-600 transition-colors z-20"
            >
              <FiX size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-500 text-white rounded-full p-2.5 absolute mt-28 ml-28 shadow-lg hover:bg-indigo-600 transition-colors"
            >
              <FiCamera size={18} />
            </button>
          )}
          {uploadError && (
            <p className="text-red-500 text-sm text-center mt-2">{uploadError}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
              min="13"
              max="120"
              className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your age"
              required
            />
            <p className="mt-1 text-xs text-gray-500">You must be at least 6 years old to use PlayJosh</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-28 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your city or area"
                required
              />
              <button
                type="button"
                onClick={getLocation}
                disabled={isLocating}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  'Locating...'
                ) : (
                  <>
                    <FiMapPin className="mr-1 h-3 w-3" />
                    Use Current
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Help us connect you with local players and events</p>
              {locationError && <p className="text-xs text-red-500">{locationError}</p>}
            </div>
          </div>
        </div>

        {/* I AM A */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            I AM A <span className="text-red-500">*</span>
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
        <div className="space-y-3" ref={dropdownRef}>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">
              SPORTS & TAGS <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-500 font-medium">Select 1 or more</span>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!isDropdownOpen) setIsDropdownOpen(true)
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="block w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Search and select sports (e.g. Soccer, Tennis)"
            />
            
            {/* Dropdown */}
            {isDropdownOpen && availableTags.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {availableTags
                  .filter(tag => 
                    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => handleTagSelect(tag)}
                      className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-indigo-50 text-gray-900"
                    >
                      <div className="flex items-center">
                        <span className="font-normal block truncate">
                          {tag.name}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 pt-2 min-h-[44px]">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center bg-indigo-100 rounded-full px-4 py-2 text-sm"
                >
                  <span className="text-indigo-800 font-medium">{tag.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagRemove(tag.id)
                    }}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No sports selected</p>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          disabled={!fullName || !age || !location.trim() || !userType || selectedTags.length === 0}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-all ${
            fullName && age && location.trim() && userType && selectedTags.length > 0
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

