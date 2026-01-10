'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NewAchievementPage() {
  const router = useRouter()
  
  // This component will automatically redirect to the edit page without any parameters
  // The edit page will handle it as a new achievement
  useEffect(() => {
    router.push('/profile/achievements/edit')
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
}
