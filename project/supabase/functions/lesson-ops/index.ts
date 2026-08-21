import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// This is a public endpoint that moves points, so cap how often a caller may hit it.
const RATE_WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 10;
const recentByIp = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  const hits = (recentByIp.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= MAX_CALLS_PER_WINDOW) return true;
  hits.push(Date.now());
  recentByIp.set(ip, hits);
  return false;
}

function bad(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (rateLimited(ip)) {
      return bad("Too many requests. Please wait a moment.", 429);
    }

    const body = await req.json();
    const { action } = body;

    if (action === "complete") {
      const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
      if (!UUID_RE.test(lessonId)) return bad("Invalid request", 400);
      const { data, error } = await supabase.rpc("complete_lesson", {
        p_lesson_id: lessonId,
      });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel") {
      const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
      if (!UUID_RE.test(lessonId)) return bad("Invalid request", 400);
      const cancelledBy = body.cancelledBy === "tutor" ? "tutor" : "student";
      const { data, error } = await supabase.rpc("cancel_lesson", {
        p_lesson_id: lessonId,
        p_cancelled_by: cancelledBy,
      });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "register_tutor") {
      const walletId = typeof body.walletId === "string" ? body.walletId : "";
      if (!UUID_RE.test(walletId)) return bad("Invalid request", 400);
      const { data, error } = await supabase.rpc("register_tutor", {
        p_wallet_id: walletId,
      });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Internal database detail stays in the logs, never in the response.
    console.error("lesson-ops failure:", err);
    return new Response(
      JSON.stringify({ error: "Request could not be completed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
