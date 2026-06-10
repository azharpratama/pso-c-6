import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    const limitRaw = Number(limitParam ?? "5");
    const offsetRaw = Number(offsetParam ?? "0");
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 5;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("mitra")
      .select(
        "id, nama_instansi, alamat, kota, keterangan, is_aktif, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      const safeSearch = search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `nama_instansi.ilike.%${safeSearch}%,alamat.ilike.%${safeSearch}%,kota.ilike.%${safeSearch}%,keterangan.ilike.%${safeSearch}%`,
      );
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Tidak dapat memuat data mitra." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: MitraPayload | null = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 },
    );
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
      .insert(normalized)
      .select(
        "id, nama_instansi, alamat, kota, keterangan, is_aktif, created_at",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Gagal menambahkan mitra." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Gagal menambahkan mitra." },
      { status: 500 },
    );
  }
}
