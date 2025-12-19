// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// const protectedRoutes = ['/Home', '/profile']
// const authRoutes = ['/login', '/signup']

// export async function middleware(request: NextRequest) {
//   const response = NextResponse.next()

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return request.cookies.get(name)?.value
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           response.cookies.set(name, value, {
//             ...options,
//             sameSite: 'lax',
//             secure: process.env.NODE_ENV === 'production',
//             httpOnly: true,
//             path: '/',
//           })
//         },
//         remove(name: string, options: CookieOptions) {
//           response.cookies.set(name, '', {
//             ...options,
//             maxAge: 0,
//             path: '/',
//           })
//         },
//       },
//     }
//   )

//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()

//     const pathname = request.nextUrl.pathname

//     /* ---------------- UNAUTHENTICATED USERS ---------------- */
//     if (!session) {
//       if (
//         authRoutes.includes(pathname) ||
//         pathname === '/' ||
//         pathname.startsWith('/_next') ||
//         pathname.startsWith('/api')
//       ) {
//         return response
//       }

//       if (
//         protectedRoutes.some((r) => pathname.startsWith(r)) ||
//         pathname.startsWith('/onboarding')
//       ) {
//         const redirect = NextResponse.redirect(
//           new URL('/login', request.url)
//         )

//         response.cookies.getAll().forEach((cookie) => {
//           redirect.cookies.set(cookie)
//         })

//         return redirect
//       }

//       return response
//     }

//     /* ---------------- AUTHENTICATED USERS ---------------- */
//     // Get the current onboarding status
//     const onboardingStatus = session.user.user_metadata?.onboarding_status || 'not_started'
    
//     // Check if onboarding is complete
//     const onboardingComplete = onboardingStatus === 'completed'
      
//     // Check if onboarding has started (any status other than 'not_started')
//     const onboardingStarted = onboardingStatus !== 'not_started'

//     // Allow onboarding if not completed
//     if (pathname.startsWith('/onboarding')) {
//       // Only redirect to dashboard if onboarding is fully completed
//       if (onboardingComplete) {
//         const redirect = NextResponse.redirect(
//           new URL('/Home', request.url)
//         )
//         response.cookies.getAll().forEach((cookie) => {
//           redirect.cookies.set(cookie)
//         })
//         return redirect
//       }
//       return response
//     }

//     // Redirect away from auth pages
//     if (authRoutes.includes(pathname)) {
//       let redirectPath = '/onboarding/step1' // Default to step 1
      
//       // Determine where to redirect based on onboarding status
//       switch(onboardingStatus) {
//         case 'completed':
//           redirectPath = '/Home'
//           break
//         case 'step2_completed':
//           redirectPath = '/onboarding/step3'
//           break
//         case 'step1_completed':
//           redirectPath = '/onboarding/step2'
//           break
//         // 'not_started' will go to step 1 by default
//       }

//       const redirect = NextResponse.redirect(new URL(redirectPath, request.url))
//       response.cookies.getAll().forEach((cookie) => {
//         redirect.cookies.set(cookie)
//       })
//       return redirect
//     }

//     // If user is in the middle of onboarding, redirect to the current step
//     if (onboardingStarted && !onboardingComplete) {
//       let redirectPath = '/onboarding/step1' // Default to step 1
      
//       // Redirect to the appropriate step based on status
//       switch(onboardingStatus) {
//         case 'step2_completed':
//           redirectPath = '/onboarding/step3'
//           break
//         case 'step1_completed':
//           redirectPath = '/onboarding/step2'
//           break
//         // 'not_started' will go to step 1 by default
//       }

//       // Don't redirect if already on the correct step
//       if (pathname === redirectPath) {
//         return response
//       }

//       const redirect = NextResponse.redirect(new URL(redirectPath, request.url))
//       response.cookies.getAll().forEach((cookie) => {
//         redirect.cookies.set(cookie)
//       })
//       return redirect
//     }
    

//     return response
//   } catch (error) {
//     console.error('Middleware error:', error)
//     return response
//   }
// }

// export const config = {
//   matcher: ['/((?!_next|favicon.ico|.*\\.).*)'],
// }

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const authRoutes = ['/login', '/signup', '/verify-email']
const onboardingRoute = '/onboarding'
const homeRoute = '/Home'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

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
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, '', {
            ...options,
            path: '/',
            maxAge: 0,
          })
        },
      },
    }
  )

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

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

      return NextResponse.redirect(new URL('/login', request.url))
    }

    /* ---------------- AUTHENTICATED USERS ---------------- */
    const metadata = session.user.user_metadata || {}

    const onboardingCompleted = metadata.onboarding_completed === true

    /* ---- BLOCK AUTH PAGES FOR LOGGED-IN USERS ---- */
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL(homeRoute, request.url))
    }

    /* ---- FORCE ONBOARDING UNTIL COMPLETED ---- */
    if (!onboardingCompleted) {
      // allow onboarding routes
      if (pathname.startsWith(onboardingRoute)) {
        return response
      }

      // block everything else
      return NextResponse.redirect(
        new URL(onboardingRoute, request.url)
      )
    }

    /* ---- PREVENT COMPLETED USERS FROM RE-ENTERING ONBOARDING ---- */
    if (onboardingCompleted && pathname.startsWith(onboardingRoute)) {
      return NextResponse.redirect(new URL(homeRoute, request.url))
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

