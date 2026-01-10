'use client'

import { useRouter } from 'next/navigation'
import { FiUser } from 'react-icons/fi'

export default function HomePage() {
  const router = useRouter()
 const sportsFeed = [
    {
      id: 1,
      user: {
        name: 'Alex Morgan',
        username: 'alexmorgan',
        role: 'Professional Soccer Player'
      },
      content:
        'Just had an amazing training session! Working hard for the upcoming season. ⚽💪 #Soccer #Training #PlayJosh',
      likes: 245,
      timeAgo: '2h'
    },
    {
      id: 2,
      user: {
        name: 'LeBron James',
        username: 'kingjames',
        role: 'NBA Champion'
      },
      content:
        'Basketball is more than a game, its a lifestyle. 🏀 Whats your favorite basketball memory?',
      likes: 1245,
      timeAgo: '5h'
    },
    {
      id: 3,
      user: {
        name: 'Serena Williams',
        username: 'serena',
        role: 'Tennis Legend'
      },
      content:
        'Back on the court after a long break! Nothing beats this feeling. 🎾 #Tennis #Comeback',
      likes: 890,
      timeAgo: '1d'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">
            PlayJosh
          </h1>
          <button
            onClick={() => router.push('/profile')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiUser className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto pt-20 pb-16 px-4">
        {/* Feed */}
        <div className="space-y-4">
          {sportsFeed.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-300 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                {/* Post Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {post.user.role}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mt-3 text-gray-900 leading-relaxed">
                  {post.content}
                </p>

                {/* Post Meta */}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {post.likes.toLocaleString()} likes
                  </span>
                  <span>
                    {post.timeAgo} ago
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}