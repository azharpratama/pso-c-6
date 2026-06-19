import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { MitraPayload } from "@/lib/types";
import { normalizeMitraPayload } from "@/lib/normalize";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let payload: MitraPayload | null = null;

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

  const normalized = normalizeMitraPayload(payload ?? {});

  if (!normalized.nama_instansi) {
    return NextResponse.json(
      { error: "Nama instansi wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("mitra")
      .update(normalized)
      .eq("id", id)
      .select(
        "id, nama_instansi, alamat, kota, keterangan, is_aktif, created_at",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Gagal memperbarui mitra." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui mitra." },
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
    const { error } = await supabase.from("mitra").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus mitra." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus mitra." },
      { status: 500 },
    );
  }
}
