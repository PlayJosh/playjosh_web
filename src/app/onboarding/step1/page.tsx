'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiCamera, FiX, FiMapPin, FiChevronDown, FiCheck } from 'react-icons/fi'
import { FaFutbol, FaUserTie, FaHeart } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'


type UserType = 'player' | 'coach' | 'fan' | null

export default function Step1() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [location, setLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sports, setSports] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Common sports list - you can expand this as needed
  const allSports = [
    "Cricket",
    "Football",
    "Badminton",
    "Basketball",
    "Volleyball",
    "Tennis",
    "Table Tennis",
    "Hockey",
    "Kabaddi",
    "Athletics / Track & Field",
    "Swimming",
    "Boxing",
    "Wrestling",
    "Martial Arts",
    "Gym / Fitness",
    "Yoga",
    "Cycling",
    "Running",
    "Skating",
    "Baseball",
    "Rugby",
    "Handball",
    "Archery",
    "Shooting",
    "Weightlifting",
    "Powerlifting",
    "CrossFit",
    "Climbing",
    "Surfing",
    "Rowing",
    "Other"
  ].sort();


  const filteredSports = allSports.filter(sport =>
    sport.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
          sports: sports,
          profile_photo: imageUrl,
          onboarding_status: 'completed',
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
          onboarding_status: 'completed',
          full_name: fullName,
          user_type: userType,
          profile_photo: imageUrl
        }
      });

      console.log('Auth update response:', { updateData, updateError });
      if (updateError) throw updateError;

      console.log('All updates successful, redirecting to home...');
      router.push('/Home');
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
        {/* <div className="mt-6">
          <div className="flex justify-center items-center mb-2 px-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium bg-indigo-500 text-white shadow-md">
              1
            </div>
          </div>
        </div> */}
      </header>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          Let&apos;s Get You Set Up for <span className="text-indigo-600">PlayJosh</span>!
        </h1>
        <p className="text-gray-600 mb-10 text-base">
          Build your profile to start connecting with athletes and coaches.
        </p>


        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-10 relative">
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
                    width={144}
                    height={144}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center group-hover:text-indigo-500 transition-colors cursor-pointer">
                  <FiCamera className="mx-auto text-gray-400 group-hover:text-indigo-500 mb-2" size={32} />
                  <span className="text-sm text-gray-500 group-hover:text-indigo-600">ADD PHOTO</span>
                </div>
              )}
            </div>
            {selectedImage ? (
              <div className="absolute bottom-1 right-40 transform translate-x-1/4 translate-y-1/4">
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="absolute bottom-1 right-40 transform translate-x-1/4 translate-y-1/4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600 transition-colors cursor-pointer shadow-md"
                >
                  <FiCamera size={16} />
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-red-500 text-sm text-center mt-2">{uploadError}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                min="13"
                max="120"
                className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                placeholder="Enter your age"
                required
              />
              <p className="mt-1 text-xs text-gray-500">You must be at least 6 years old to use PlayJosh</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-4 pr-28 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  placeholder="Enter your city or area"
                  required
                />
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isLocating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center"
                >
                  {isLocating ? 'Locating...' : (
                    <>
                      <FiMapPin className="h-3.5 w-3.5 mr-1" /> Use Current
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
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${userType === 'player'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
              >
                <FaFutbol
                  className={`text-2xl mb-2 ${userType === 'player' ? 'text-indigo-500' : 'text-gray-400'
                    }`}
                />
                <span className={`text-sm font-medium ${userType === 'player' ? 'text-gray-900' : 'text-gray-600'
                  }`}>Player</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('coach')}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${userType === 'coach'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
              >
                <FaUserTie
                  className={`text-2xl mb-2 ${userType === 'coach' ? 'text-indigo-500' : 'text-gray-400'
                    }`}
                />
                <span className={`text-sm font-medium ${userType === 'coach' ? 'text-gray-900' : 'text-gray-600'
                  }`}>Coach</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('fan')}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${userType === 'fan'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
              >
                <FaHeart
                  className={`text-2xl mb-2 ${userType === 'fan' ? 'text-indigo-500' : 'text-gray-400'
                    }`}
                />
                <span className={`text-sm font-medium ${userType === 'fan' ? 'text-gray-900' : 'text-gray-600'
                  }`}>Fan</span>
              </button>
            </div>
          </div>

          {/* Sports Input with Searchable Dropdown */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              SPORTS & TAGS <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-2 border-2 border-gray-200 rounded-xl bg-white">
                {sports.map((sport, index) => (
                  <div key={index} className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {sport}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSports(prev => prev.filter((_, i) => i !== index))
                      }}
                      className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (!isDropdownOpen) setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="flex-1 min-w-[100px] px-2 py-1 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
                  placeholder={sports.length === 0 ? "Search and select sports..." : ""}
                />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <FiChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredSports.length > 0 ? (
                    <ul className="py-1">
                      {filteredSports.map((sport) => (
                        <li key={sport}>
                          <button
                            type="button"
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${sports.includes(sport) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                            onClick={() => {
                              if (!sports.includes(sport)) {
                                setSports(prev => [...prev, sport])
                              }
                              setSearchQuery('')
                              inputRef.current?.focus()
                            }}
                          >
                            {sport}
                            {sports.includes(sport) && (
                              <span className="float-right text-indigo-600">
                                <FiCheck size={16} />
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No sports found. Try a different search.
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Start typing to search and select sports</p>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            disabled={!fullName || !age || !location.trim() || !userType || sports.length === 0}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-all ${fullName && age && location.trim() && userType && sports.length > 0
              ? 'bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            Complete Profile
            <span className="ml-2">→</span>
          </button>
        </form>
      </div>
    </div>
  );

}

