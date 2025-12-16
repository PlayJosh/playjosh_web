'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Step2() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Step 2: Profile Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us a bit more about yourself
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Step 2 content will be added here
            </p>
          </div>
          
          <div className="flex justify-between">
            <a
              href="/onboarding/step1"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </a>
            <a
              href="/onboarding/step3"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
