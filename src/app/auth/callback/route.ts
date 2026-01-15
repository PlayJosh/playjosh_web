import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/'

  if (!code) {
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  const supabase = await createClient()
  
  try {
    // Exchange the code for a session
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error('Error exchanging code for session:', authError)
      return NextResponse.redirect(new URL('/login?error=Could not authenticate', request.url))
    }

    if (!user?.email) {
      throw new Error('No user email found')
    }

    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_status')
      .eq('email', user.email)
      .maybeSingle()

    if (profileError) throw profileError

    // If no profile exists or onboarding not started, create/update profile
    if (!profileData || !profileData.onboarding_status) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          onboarding_status: 'not_started',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })

      if (upsertError) throw upsertError

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          onboarding_status: 'not_started' 
        }
      })

      // Redirect to onboarding for new users
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // For existing users, redirect to the specified URL or home
    return NextResponse.redirect(new URL(redirectTo, request.url))

  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    )
  }
}