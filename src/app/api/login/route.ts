import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  let payload: { identifier?: string; password?: string } | null = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 }
    );
  }

  const identifier = (payload?.identifier ?? "").trim();
  const password = (payload?.password ?? "").trim();

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Username/email dan password wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id, username, email")
      .eq("password", password)
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "Kredensial tidak valid." },
        { status: 401 }
      );
    }

    return NextResponse.json({ admin: data });
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke database." },
      { status: 500 }
    );
  }
}
