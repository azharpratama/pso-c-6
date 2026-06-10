import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type MitraPayload = {
  nama_instansi?: string;
  alamat?: string;
  kota?: string;
  keterangan?: string;
  is_aktif?: boolean;
};

function normalizePayload(payload: MitraPayload) {
  return {
    nama_instansi: payload.nama_instansi?.trim() || null,
    alamat: payload.alamat?.trim() || null,
    kota: payload.kota?.trim() || null,
    keterangan: payload.keterangan?.trim() || null,
    is_aktif: payload.is_aktif ?? true,
  };
}

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

  const normalized = normalizePayload(payload ?? {});

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
