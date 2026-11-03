import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | undefined = undefined;

export function createClient() {
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const client = createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'dummy-key',
    {
      auth: {
        lock: async (_name, _acquireTimeout, fn) => {
          return await fn();
        },
      },
    }
  )

  if (typeof window !== 'undefined') {
    browserClient = client;
  }

  return client;
}
