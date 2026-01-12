import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// const authRoutes = ['/login', '/signup', '/verify-email']
// const publicRoutes = ['/forgot-password', '/reset-password']
// const onboardingRoute = '/onboarding'
// const homeRoute = '/Home'

// export async function middleware(request: NextRequest) {
//   const response = NextResponse.next()
//   const pathname = request.nextUrl.pathname

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
//             path: '/',
//             sameSite: 'lax',
//             secure: process.env.NODE_ENV === 'production',
//             httpOnly: true,
//           })
//         },
//         remove(name: string, options: CookieOptions) {
//           response.cookies.set(name, '', {
//             ...options,
//             path: '/',
//             maxAge: 0,
//           })
//         },
//       },
//     }
//   )

//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()

//     /* ---------------- UNAUTHENTICATED USERS ---------------- */
//     if (!session) {
//       if (
//         authRoutes.includes(pathname) ||
//         publicRoutes.includes(pathname) ||
//         pathname === '/' ||
//         pathname.startsWith('/_next') ||
//         pathname.startsWith('/api')
//       ) {
//         return response
//       }

//       return NextResponse.redirect(new URL('/login', request.url))
//     }

//     /* ---------------- AUTHENTICATED USERS ---------------- */
//     const metadata = session.user.user_metadata || {}
//     const onboardingCompleted = metadata.onboarding_completed === true

//     /* ---- BLOCK AUTH & PUBLIC PAGES FOR LOGGED-IN USERS ---- */
//     if (authRoutes.includes(pathname) || publicRoutes.includes(pathname)) {
//       return NextResponse.redirect(new URL(homeRoute, request.url))
//     }

//     /* ---- FORCE ONBOARDING UNTIL COMPLETED ---- */
//     if (!onboardingCompleted) {
//       // allow onboarding routes
//       if (pathname.startsWith(onboardingRoute)) {
//         return response
//       }

//       // block everything else
//       return NextResponse.redirect(
//         new URL(onboardingRoute, request.url)
//       )
//     }

//     /* ---- PREVENT COMPLETED USERS FROM RE-ENTERING ONBOARDING ---- */
//     if (onboardingCompleted && pathname.startsWith(onboardingRoute)) {
//       return NextResponse.redirect(new URL(homeRoute, request.url))
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

// ... (keep existing imports)

const authRoutes = ['/login', '/signup', '/verify-email']
const publicRoutes = ['/forgot-password', '/reset-password', '/api/auth/callback', '/']
const protectedRoutes = ['/profile', '/dashboard', '/settings'] // Add your protected routes here
const onboardingRoute = '/onboarding'
const homeRoute = '/Home'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return response
  }

  // Allow access to public routes without authentication
  if (publicRoutes.includes(pathname) || authRoutes.includes(pathname)) {
    return response
  }

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
    const { data: { user }, error } = await supabase.auth.getUser()

    /* ---------------- UNAUTHENTICATED USERS ---------------- */
    if (error || !user) {
      // Allow access to public pages
      if (!protectedRoutes.some(route => pathname.startsWith(route))) {
        return response
      }
      
      // Redirect protected routes to login
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }

    /* ---------------- AUTHENTICATED USERS ---------------- */
    // Redirect authenticated users away from auth pages
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL(homeRoute, request.url))
    }

    const metadata = user.user_metadata || {}
    const onboardingCompleted = metadata.onboarding_completed === true

    // Handle onboarding redirection
    if (!onboardingCompleted && !pathname.startsWith(onboardingRoute)) {
      return NextResponse.redirect(new URL(onboardingRoute, request.url))
    }

    // Prevent access to onboarding after completion
    if (onboardingCompleted && pathname.startsWith(onboardingRoute)) {
      return NextResponse.redirect(new URL(homeRoute, request.url))
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request but log it
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}