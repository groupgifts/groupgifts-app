import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. Only use in API routes / server code, never expose to client.
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      global: {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
