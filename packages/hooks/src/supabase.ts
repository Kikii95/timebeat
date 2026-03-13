/**
 * Supabase browser client for hooks
 * Used for client-side data fetching in static export mode
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase browser client (singleton)
 * Safe to call on both server and client
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn("Supabase environment variables not configured");
      return null;
    }

    supabaseClient = createBrowserClient(url, key);
  }

  return supabaseClient;
}
