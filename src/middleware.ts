import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/Home', '/profile']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, '', {
            ...options,
            maxAge: 0,
            path: '/',
          })
        },
      },
    }
  )

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const pathname = request.nextUrl.pathname

    /* ---------------- UNAUTHENTICATED USERS ---------------- */
    if (!session) {
      if (
        authRoutes.includes(pathname) ||
        pathname === '/' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api')
      ) {
        return response
      }

      if (
        protectedRoutes.some((r) => pathname.startsWith(r)) ||
        pathname.startsWith('/onboarding')
      ) {
        const redirect = NextResponse.redirect(
          new URL('/login', request.url)
        )

        response.cookies.getAll().forEach((cookie) => {
          redirect.cookies.set(cookie)
        })

        return redirect
      }

      return response
    }

    /* ---------------- AUTHENTICATED USERS ---------------- */
    const onboardingComplete = 
      session.user.user_metadata?.onboarding_complete === true ||
      session.user.user_metadata?.onboarding_completed === true ||
      session.user.user_metadata?.onboarding_started === true ||
      session.user.user_metadata?.onboarding_step === 'step1_completed'
      
    const onboardingStarted = onboardingComplete

    // Allow onboarding if not completed
    if (pathname.startsWith('/onboarding')) {
      // Only redirect to dashboard if onboarding is fully completed
      if (onboardingComplete) {
        const redirect = NextResponse.redirect(
          new URL('/Home', request.url)
        )
        response.cookies.getAll().forEach((cookie) => {
          redirect.cookies.set(cookie)
        })
        return redirect
      }
      return response
    }

    // Redirect away from auth pages
    if (authRoutes.includes(pathname)) {
      const redirect = NextResponse.redirect(
        new URL(
          (onboardingComplete || session.user.user_metadata?.onboarding_step === 'step1_completed') ? '/Home' : '/onboarding/step1',
          request.url
        )
      )

      response.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie)
      })

      return redirect
    }

    // Force onboarding only if they haven't started
    if (!onboardingStarted) {
      const redirect = NextResponse.redirect(
        new URL('/onboarding/step1', request.url)
      )

      response.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie)
      })

      return redirect
    }
    

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.).*)'],
}
