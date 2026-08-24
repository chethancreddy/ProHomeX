import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Route categories
  const isPublicRoute = ['/', '/cctv', '/solar', '/ups', '/about', '/contact',
    '/services', '/request-quote', '/login', '/verify', '/reset-password',
    '/admin/login',
  ].some(p => path === p || path.startsWith(p + '/') || 
    // allow static assets  
    path.startsWith('/_next') || path.startsWith('/favicon'))

  const isCustomerRoute = path.startsWith('/customer')
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login')

  // Unauthenticated: block protected routes
  if (!user) {
    if (isCustomerRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
    if (isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Authenticated user
  const role = user.user_metadata?.role || 'CUSTOMER'
  const isCustomer = role === 'CUSTOMER'
  const isAdmin = !isCustomer

  // Block customers from admin
  if (isCustomer && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/customer/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login pages
  if (path === '/login' || path === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = isCustomer ? '/customer/dashboard' : '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
