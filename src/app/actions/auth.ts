'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from Server Component — safe to ignore
          }
        },
      },
    }
  )

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const role = data.user?.user_metadata?.role || 'CUSTOMER'
  
  // Also check the profiles table for the actual role (more reliable)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const actualRole = profile?.role || role

  if (actualRole === 'CUSTOMER') {
    redirect('/customer/dashboard')
  } else {
    redirect('/admin/dashboard')
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore
          }
        },
      },
    }
  )
  await supabase.auth.signOut()
  redirect('/login')
}

export async function submitLead(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* ignore */ }
        },
      },
    }
  )

  const { data, error } = await supabase.from('leads').insert({
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    service: formData.get('service') as string,
    location: formData.get('location') as string,
    requirement: formData.get('requirement') as string,
    message: formData.get('message') as string,
  }).select('reference_number').single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, reference: data?.reference_number }
}

export async function raiseTicket(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* ignore */ }
        },
      },
    }
  )

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get customer ID
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!customer) return { error: 'Customer profile not found. Please contact support.' }

  const { data: ticket, error } = await supabase.from('tickets').insert({
    customer_id: customer.id,
    category: formData.get('category') as string,
    location: formData.get('location') as string,
    contact_number: formData.get('contact_number') as string,
    description: formData.get('problem') as string,
    created_by: user.id,
    status: 'OPEN',
    priority: 'MEDIUM',
  }).select('id, ticket_number').single()

  if (error) return { error: error.message }

  return { success: true, ticketId: ticket.id, ticketNumber: ticket.ticket_number }
}
