'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Step3() {
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

  const handleComplete = async () => {
    // Here you can add logic to mark onboarding as complete in your database
    // For example:
    // await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id);
    
    // Redirect to dashboard after completion
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Step 3: Complete Your Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You're almost there! Let's finish setting up your account.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Step 3 content will be added here
            </p>
          </div>
          
          <div className="flex justify-between">
            <a
              href="/onboarding/step2"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </a>
            <button
              onClick={handleComplete}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
