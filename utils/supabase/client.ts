import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://adbigszyxrqzlfnsflcm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYmlnc3p5eHJxemxmbnNmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTM2MTgsImV4cCI6MjEwMDg4OTYxOH0.lwwewvmtLvalTLhwMTlyA5WnFbneodTTBwrcmjMriaw'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
