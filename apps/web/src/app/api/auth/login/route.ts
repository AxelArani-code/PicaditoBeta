import { NextResponse } from "next/server";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are not configured" },
      { status: 500 }
    );
  }

  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const payload = await supabaseResponse.json().catch(() => ({
      error: "Invalid response from Supabase",
    }));

    if (!supabaseResponse.ok) {
      return NextResponse.json(payload, { status: supabaseResponse.status });
    }

    const response = NextResponse.json(payload, { status: 200 });

    if (typeof payload.access_token === "string") {
      response.cookies.set("picadito_access_token", payload.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: typeof payload.expires_in === "number" ? payload.expires_in : 60 * 60,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to reach authentication service" },
      { status: 502 }
    );
  }
}