import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    // Get recent 5 activities (using created_at as activity timestamp)
    const { data, error } = await supabase
      .from("mitra")
      .select("id, nama_instansi, created_at, is_aktif")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: "Gagal memuat aktivitas." },
        { status: 500 },
      );
    }

    // Map to activity format
    const activities = data.map((item, index) => {
      const action = index === 0 ? "add" : "edit";
      const name = item.nama_instansi || "mitra";
      const timestamp = new Date(item.created_at);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let timeAgo;
      if (diffHours < 1) {
        timeAgo = "Baru saja";
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} jam yang lalu`;
      } else if (diffDays === 1) {
        timeAgo = "Kemarin";
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} hari yang lalu`;
      } else {
        timeAgo = timestamp.toLocaleDateString("id-ID");
      }

      return {
        id: item.id,
        action: action as "add" | "edit" | "delete" | "download",
        description: `${action === "add" ? "menambahkan" : "memperbarui"} ${name}`,
        timestamp: timeAgo,
        icon: action === "add" ? "add" : "edit",
      };
    });

    return NextResponse.json({ data: activities });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan." },
      { status: 500 },
    );
  }
}
