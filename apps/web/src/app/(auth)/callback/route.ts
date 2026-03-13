import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Note: In static export mode, this route handler doesn't exist.
// The page.tsx handles OAuth callback client-side instead.
// This route only runs on server (Vercel deployment).

export async function GET(request: Request) {

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
