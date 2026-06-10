import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  // Check Supabase connectivity
  let database: "ok" | "error" = "error";
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("admins")
      .select("id", { count: "exact", head: true });
    database = error ? "error" : "ok";
  } catch {
    database = "error";
  }

  const isHealthy = database === "ok";

  return Response.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp,
      checks: {
        database,
      },
    },
    { status: isHealthy ? 200 : 503 },
  );
}
