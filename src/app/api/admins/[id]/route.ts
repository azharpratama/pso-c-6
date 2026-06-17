import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type AdminPayload = {
  username?: string;
  email?: string;
  password?: string;
};

function normalizePayload(payload: AdminPayload) {
  return {
    username: payload.username?.trim() || null,
    email: payload.email?.trim() || null,
    password: payload.password?.trim() || null,
  };
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let payload: AdminPayload | null = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const normalized = normalizePayload(payload ?? {});

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
      .update(normalized)
      .eq("id", id)
      .select("id, username, email, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Gagal memperbarui admin." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui admin." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("admins").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus admin." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus admin." },
      { status: 500 },
    );
  }
}