'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isAuthPage) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* <Image 
                src="/logo.png" 
                alt="PlayJosh Logo" 
                width={100} 
                height={100} 
                className="h-28 w-auto object-contain"
                priority
              /> */}
              <span className="ml-2 text-xl font-bold text-indigo-600">PlayJosh</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Join now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
