import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { AdminPayload } from "@/lib/types";
import { normalizeAdminPayload } from "@/lib/normalize";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id, username, email, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Tidak dapat memuat data admin." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: AdminPayload | null = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const normalized = normalizeAdminPayload(payload ?? {});

  if (!normalized.username) {
    return NextResponse.json(
      { error: "Username wajib diisi." },
      { status: 400 },
    );
  }

  if (!normalized.email) {
    return NextResponse.json(
      { error: "Email wajib diisi." },
      { status: 400 },
    );
  }

  if (!normalized.password) {
    return NextResponse.json(
      { error: "Password wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("admins")
      .insert(normalized)
      .select("id, username, email, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Gagal menambahkan admin." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Gagal menambahkan admin." },
      { status: 500 },
    );
  }
}