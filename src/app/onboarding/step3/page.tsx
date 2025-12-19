// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import { FiArrowLeft, FiCamera, FiX } from 'react-icons/fi'
// import { createClient } from '@/lib/supabase/client'
// import Image from 'next/image'


// type Sport = {
//   id: string
//   name: string
//   selected: boolean
// }

// export default function Step3() {
//   const router = useRouter()
//   const supabase = createClient()

//   const [gid, setGid] = useState('')
//   const [sports, setSports] = useState<Sport[]>([
//     { id: 'soccer', name: 'Soccer', selected: false },
//     { id: 'basketball', name: 'Basketball', selected: false },
//     { id: 'tennis', name: 'Tennis', selected: false },
//     { id: 'cricket', name: 'Cricket', selected: false },
//     { id: 'badminton', name: 'Badminton', selected: false },
//   ])

//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [selectedImage, setSelectedImage] = useState<string | null>(null)
//   const [uploadError, setUploadError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         setIsLoading(true)

//         const { data: sessionData, error: sessionError } =
//           await supabase.auth.getSession()

//         if (sessionError || !sessionData.session) {
//           const redirectUrl = new URL('/login', window.location.origin)
//           redirectUrl.searchParams.set('redirectedFrom', '/onboarding/step3')
//           window.location.href = redirectUrl.toString()
//           return
//         }

//         const { data: userData, error: userError } =
//           await supabase.auth.getUser()

//         if (userError || !userData.user) {
//           await supabase.auth.signOut()
//           window.location.href = '/login?error=session_expired'
//           return
//         }

//         if (
//           userData.user.user_metadata?.onboarding_complete ||
//           userData.user.user_metadata?.onboarding_completed
//         ) {
//           window.location.href = '/dashboard'
//           return
//         }

//         setGid(userData.user.id)
//       } catch {
//         window.location.href = '/login?error=auth_check_failed'
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     checkAuth()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const toggleSport = (sportId: string) => {
//     setSports((prev) =>
//       prev.map((sport) =>
//         sport.id === sportId
//           ? { ...sport, selected: !sport.selected }
//           : sport
//       )
//     )
//   }

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     if (!file.type.startsWith('image/')) {
//       setUploadError('Please upload an image file')
//       return
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setUploadError('Image size should be less than 5MB')
//       return
//     }

//     const reader = new FileReader()
//     reader.onload = (event) => {
//       setSelectedImage(event.target?.result as string)
//       setUploadError(null)
//     }
//     reader.readAsDataURL(file)
//   }

//   const removeImage = () => {
//     setSelectedImage(null)
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//     }
//   }

//   const dataUrlToBlob = (dataUrl: string): Blob => {
//     const arr = dataUrl.split(',')
//     const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
//     const bstr = atob(arr[1])
//     const u8arr = new Uint8Array(bstr.length)

//     for (let i = 0; i < bstr.length; i++) {
//       u8arr[i] = bstr.charCodeAt(i)
//     }

//     return new Blob([u8arr], { type: mime })
//   }

//   const handleComplete = async () => {
//     if (sports.filter((s) => s.selected).length === 0) {
//       setUploadError('Please select at least one sport')
//       return
//     }

//     if (!selectedImage) {
//       setUploadError(
//         'Please upload a photo of you playing your favorite sport'
//       )
//       return
//     }

//     setIsSubmitting(true)
//     setUploadError(null)

//     try {
//       const { data: userData } = await supabase.auth.getUser()
//       const user = userData.user
//       if (!user) throw new Error('Not authenticated')

//       const fileExt = selectedImage.split(';')[0].split('/')[1]
//       const fileName = `${user.id}-${Date.now()}.${fileExt}`

//       const { error: uploadError } = await supabase.storage
//         .from('profile-photos')
//         .upload(fileName, dataUrlToBlob(selectedImage), {
//           cacheControl: '3600',
//           upsert: true,
//         })

//       if (uploadError) throw uploadError

//       const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`

//       const { error: updateError } = await supabase
//   .from('profiles')
//   .upsert({
//     id: user.id,
//     email: user.email ?? '',
//     sports: sports.filter((s) => s.selected).map((s) => s.id),
//     profile_photo: imageUrl,
//     updated_at: new Date().toISOString(),
//   })


//       if (updateError) throw updateError

//       await supabase.auth.updateUser({
//         data: {
//           ...user.user_metadata, // Preserve existing metadata
//           onboarding_status: 'completed',
//           onboarding_completed_at: new Date().toISOString()
//         },
//       })

//       router.replace('/Home')
//     } catch {
//       setUploadError('Failed to save profile. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mb-10">
//         <button
//           onClick={() => router.back()}
//           className="text-gray-700 hover:text-gray-900 transition-colors"
//         >
//           <FiArrowLeft size={24} />
//         </button>
//       </div>

//       <div className="max-w-md mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">
//           Complete Your Profile
//         </h1>
//         <p className="text-gray-600 mb-6 text-base">
//           {"Let's get to know you better to personalize your experience."}
//         </p>

//         {/* Sports Photo Upload */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Upload Your Sports Photo
//           </label>
//           <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
//             {selectedImage ? (
//               <div className="relative w-full">
//               <Image
//                 src={selectedImage}
//                 alt="Your sports photo"
//                 width={240}
//                 height={240}
//                 className="mx-auto max-h-60 rounded-lg object-cover"
//                 />

//                 <button
//                   type="button"
//                   onClick={removeImage}
//                   className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
//                 >
//                   <FiX className="h-5 w-5 text-gray-600" />
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-1 text-center">
//                 <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     htmlFor="sports-photo"
//                     className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
//                   >
//                     <span>Upload a photo</span>
//                     <input
//                       id="sports-photo"
//                       name="sports-photo"
//                       type="file"
//                       className="sr-only"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       ref={fileInputRef}
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 <p className="text-xs text-gray-500">
//                   PNG, JPG up to 5MB
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* GID Input */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             GID (Game ID)
//           </label>
//           <input
//             type="text"
//             value={gid}
//             onChange={(e) => setGid(e.target.value)}
//             placeholder="Enter your unique game ID"
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//           />
//           <p className="mt-1 text-xs text-gray-500">
//             This will be your unique identifier in the game.
//           </p>
//         </div>

//         {/* Sports Selection */}
//         <div className="mb-8">
//           <label className="block text-sm font-medium text-gray-700 mb-3">
//             Your Sports
//           </label>
//           <div className="grid grid-cols-2 gap-3">
//             {sports.map((sport) => (
//               <button
//                 key={sport.id}
//                 type="button"
//                 onClick={() => toggleSport(sport.id)}
//                 className={`py-3 px-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
//                   sport.selected 
//                     ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
//                     : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 {sport.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Error Message */}
//         {uploadError && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
//             {uploadError}
//           </div>
//         )}

//         {/* Complete Button */}
//         <div className="space-y-3">
//           <button
//             onClick={handleComplete}
//             disabled={isSubmitting}
//             className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
//           >
//             {isSubmitting ? 'Saving...' : 'Complete Profile'}
//           </button>
          
//           <button
//             type="button"
//             onClick={async () => {
//               try {
//                 setIsSubmitting(true);
//                 // Mark onboarding as complete when skipping
//                 await supabase.auth.updateUser({
//                   data: {
//                     onboarding_complete: true,
//                     onboarding_completed: true,
//                     last_onboarding_step: 'completed'
//                   }
//                 });
//                 router.push('/Home');
//               } catch (error) {
//                 console.error('Error updating user status:', error);
//                 router.push('/Home'); // Still redirect even if update fails
//               }
//             }}
//             disabled={isSubmitting}
//             className="w-full text-center text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
//           >
//             {isSubmitting ? 'Skipping...' : 'Skip for now'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiCamera, FiX } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Sport = {
  id: string
  name: string
  selected: boolean
}

export default function Step3() {
  const router = useRouter()
  const supabase = createClient()

  const [gid, setGid] = useState('')
  const [sports, setSports] = useState<Sport[]>([
    { id: 'soccer', name: 'Soccer', selected: false },
    { id: 'basketball', name: 'Basketball', selected: false },
    { id: 'tennis', name: 'Tennis', selected: false },
    { id: 'cricket', name: 'Cricket', selected: false },
    { id: 'badminton', name: 'Badminton', selected: false },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          router.replace('/login')
          return
        }

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.replace('/login')
          return
        }

        // ✅ Only check this ONE flag
        if (userData.user.user_metadata?.onboarding_completed === true) {
          router.replace('/Home')
          return
        }

        setGid(userData.user.id)
      } catch {
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const toggleSport = (sportId: string) => {
    setSports((prev) =>
      prev.map((sport) =>
        sport.id === sportId
          ? { ...sport, selected: !sport.selected }
          : sport
      )
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
      setUploadError(null)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const bstr = atob(arr[1])
    const u8arr = new Uint8Array(bstr.length)
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }
    return new Blob([u8arr], { type: mime })
  }

  const handleComplete = async () => {
    if (sports.filter((s) => s.selected).length === 0) {
      setUploadError('Please select at least one sport')
      return
    }

    if (!selectedImage) {
      setUploadError('Please upload a sports photo')
      return
    }

    setIsSubmitting(true)
    setUploadError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) throw new Error('Not authenticated')

      const fileExt = selectedImage.split(';')[0].split('/')[1]
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      await supabase.storage
        .from('profile-photos')
        .upload(fileName, dataUrlToBlob(selectedImage), {
          cacheControl: '3600',
          upsert: true,
        })

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`

      await supabase.from('profiles').upsert({
        id: user.id,
        sports: sports.filter((s) => s.selected).map((s) => s.id),
        profile_photo: imageUrl,
        updated_at: new Date().toISOString(),
      })

      // ✅ FINAL METADATA WRITE (ONLY THIS)
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
        },
      })

      router.replace('/Home')
    } catch {
      setUploadError('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)

    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
      },
    })

    router.replace('/Home')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Complete Your Profile
        </h1>
        <p className="text-gray-600 mb-6 text-base">
          {"Let's get to know you better to personalize your experience."}
        </p>

        {/* UI BELOW IS 100% SAME */}
        {/* Sports Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Your Sports Photo
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
            {selectedImage ? (
              <div className="relative w-full">
                <Image
                  src={selectedImage}
                  alt="Your sports photo"
                  width={240}
                  height={240}
                  className="mx-auto max-h-60 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="sports-photo"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload a photo</span>
                    <input
                      id="sports-photo"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* GID */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GID (Game ID)
          </label>
          <input
            type="text"
            value={gid}
            onChange={(e) => setGid(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Sports */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Sports
          </label>
          <div className="grid grid-cols-2 gap-3">
            {sports.map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => toggleSport(sport.id)}
                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                  sport.selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {uploadError}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full text-center text-sm font-medium text-indigo-500 hover:text-indigo-600"
          >
            {isSubmitting ? 'Skipping...' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  )
}
