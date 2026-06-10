import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [totalResult, activeResult, newResult] = await Promise.all([
      supabase.from("mitra").select("id", { count: "exact", head: true }),
      supabase
        .from("mitra")
        .select("id", { count: "exact", head: true })
        .eq("is_aktif", true),
      supabase
        .from("mitra")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),
    ]);

    if (totalResult.error || activeResult.error || newResult.error) {
      return NextResponse.json(
        { error: "Tidak dapat memuat statistik." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      total: totalResult.count ?? 0,
      active: activeResult.count ?? 0,
      recent: newResult.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Tidak dapat memuat statistik." },
      { status: 500 },
    );
  }
}
