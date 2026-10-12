import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Respect proxy headers for production hosts (e.g. Vercel, Netlify, Railway)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'

  let redirectBase = origin
  if (!isLocalEnv && forwardedHost) {
    redirectBase = `${forwardedProto}://${forwardedHost}`
  }

  if (error) {
    console.error("Auth callback error from provider:", error, errorDescription)
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    } else {
      console.error("Auth callback session exchange error:", exchangeError)
      return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }
  }

  return NextResponse.redirect(`${redirectBase}/login?error=Authentication%20failed`)
}
