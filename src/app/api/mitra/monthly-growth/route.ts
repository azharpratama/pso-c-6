import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    // Get the last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString("id-ID", { month: "short" });
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      months.push({
        label: monthName,
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      });
    }

    // Get counts for each month
    const results = [];
    for (const month of months) {
      const { count, error } = await supabase
        .from("mitra")
        .select("*", { count: "exact", head: true })
        .gte("created_at", month.start)
        .lte("created_at", month.end);

      if (!error) {
        results.push({
          month: month.label,
          count: count ?? 0,
        });
      } else {
        results.push({
          month: month.label,
          count: 0,
        });
      }
    }

    return NextResponse.json({ data: results });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan." },
      { status: 500 },
    );
  }
}
