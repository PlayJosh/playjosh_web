'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiAward, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Achievement = Database['public']['Tables']['profile_achievements']['Row']

export default function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState<string | null>(null)

  function closeModal() {
    setIsOpen(false)
    setCurrentCertificate(null)
  }

  function openModal(certificateUrl: string) {
    setCurrentCertificate(certificateUrl)
    setIsOpen(true)
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('profile_achievements')
        .select('*')
        .eq('profile_email', user.email)
        .order('year', { ascending: false })

      if (error) throw error

      setAchievements(data || [])
    } catch (err) {
      console.error('Error fetching achievements:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (achievement: Achievement) => {
    try {
      const { error } = await supabase
        .from('profile_achievements')
        .delete()
        .eq('profile_email', achievement.profile_email)
        .eq('title', achievement.title)
        .eq('year', achievement.year)

      if (error) throw error

      // Refresh the list
      fetchAchievements()
    } catch (err) {
      console.error('Error deleting achievement:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete achievement'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>{error}</p>
      </div>
    )
  }

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'international': return 'bg-purple-100 text-purple-800';
      case 'national': return 'bg-blue-100 text-blue-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'district': return 'bg-yellow-100 text-yellow-800';
      case 'school': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Certificate
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      <span className="sr-only">Close</span>
                      <FiX className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-2">
                    {currentCertificate && (
                      <div className="w-full h-[80vh] bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={currentCertificate}
                          className="w-full h-full"
                          title="Certificate"
                        />
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
       
      </div>

      {achievements.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <FiAward className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No achievements yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first achievement or certification.</p>
          <div className="mt-6">
            <Link
              href="/profile/achievements/edit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Achievement
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <ul className="divide-y divide-gray-200">
            {achievements.map((achievement) => (
              <li key={`${achievement.title}-${achievement.year}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FiAward className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h4 className="text-base font-medium text-gray-900 truncate">
                            {achievement.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(achievement.level)}`}>
                              {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {achievement.year}
                            </span>
                          </div>
                        </div>
                        
                        {achievement.sport && (
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Sport:</span> {achievement.sport}
                          </p>
                        )}
                        
                        {achievement.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {achievement.description}
                          </p>
                        )}
                        
                        {achievement.certificate_url && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => openModal(achievement.certificate_url!)}
                              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              View Certificate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 flex space-x-1">
                    <Link
                      href={`/profile/achievements/edit?title=${encodeURIComponent(achievement.title)}&year=${achievement.year}`}
                      className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Edit achievement"
                    >
                      <FiEdit2 className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(achievement)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete achievement"
                    >
                      <FiTrash2 className="h-5 w-5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
