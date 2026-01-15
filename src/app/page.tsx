import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left side - Content */}
            <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 lg:col-span-6 lg:pb-24 xl:pb-28">
              <main>
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Connect through</span>
                    <span className="block text-indigo-600">Sports</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Join PlayJosh to connect with players, join teams, and participate in local sports events. Your next game is just a click away!
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center">
                      <div className="shrink-0 bg-indigo-500 rounded-full p-1">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-600">Connect with local players and teams</p>
                    </div>
                    <div className="flex items-center">
                      <div className="shrink-0 bg-indigo-500 rounded-full p-1">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-600">Find and join sports events near you</p>
                    </div>
                    <div className="flex items-center">
                      <div className="shrink-0 bg-indigo-500 rounded-full p-1">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-600">Track your progress and achievements</p>
                    </div>
                  </div>
                </div>
              </main>
            </div>
            
            {/* Right side - Hero Image (Desktop) */}
            <div className="hidden lg:block lg:col-span-6">
              <div className="relative h-full">
                <img
                  src="/hero.png"
                  alt="People playing sports"
                  className="w-full h-auto max-w-4xl mx-auto lg:max-w-5xl lg:ml-auto transform scale-125"
                />
              </div>
            </div>
          </div>
          
          {/* Hero Image (Mobile - below content) */}
          <div className="lg:hidden mt-10">
            <div className="relative w-full h-80 sm:h-96 md:h-112">
              <img
                src="/hero.png"
                alt="People playing sports"
                className="w-full h-full object-contain scale-110"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="pt-32 pb-16 sm:pt-40 lg:pt-48 lg:pb-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-2xl font-extrabold text-gray-900 sm:text-4xl sm:leading-tight">
              A better way to connect through sports
            </p>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Discover the perfect way to enhance your sports experience with our comprehensive platform.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Players</h3>
              <p className="text-gray-600">
                Connect with players of similar skill levels and interests in your area.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Teams</h3>
              <p className="text-gray-600">
                Discover and join local sports teams looking for players just like you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Events & Tournaments</h3>
              <p className="text-gray-600">
                Find and register for local sports events, leagues, and tournaments.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Profiles</h3>
              <p className="text-gray-600">
                Play with confidence knowing all members are verified and rated by the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
