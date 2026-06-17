import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    // Get all mitra with kota
    const { data, error } = await supabase
      .from("mitra")
      .select("kota")
      .not("kota", "is", null);

    if (error) {
      return NextResponse.json(
        { error: "Gagal memuat data kota." },
        { status: 500 },
      );
    }

    // Group by city and count
    const cityMap = new Map<string, number>();
    data.forEach((item) => {
      const city = item.kota?.trim() || "Unknown";
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });

    // Convert to array and sort by count (descending)
    const result = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan." },
      { status: 500 },
    );
  }
}
