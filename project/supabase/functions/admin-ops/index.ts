import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Password",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison so the check does not leak the hash prefix. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

    // The password is verified here, against a hash the browser can never read.
    const supplied = req.headers.get("X-Admin-Password") ?? "";
    const envPassword = Deno.env.get("ADMIN_PASSWORD") ?? "";
    let authorized = false;

    if (envPassword) {
      authorized = timingSafeEqual(
        await sha256Hex(supplied),
        await sha256Hex(envPassword),
      );
    } else {
      const { data: cred } = await supabase
        .from("admin_credentials")
        .select("salt, password_hash")
        .limit(1)
        .maybeSingle();
      if (cred) {
        authorized = timingSafeEqual(
          await sha256Hex(cred.salt + supplied),
          cred.password_hash,
        );
      }
    }

    if (!authorized) {
      // Deliberately generic: no hint about why the attempt failed.
      return json({ error: "Not authorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "verify") {
      return json({ success: true });
    }

    if (action === "list_applications") {
      const { data, error } = await supabase
        .from("tutor_applications")
        .select(
          "id, applicant_name, email, teaches_language, native_language, bio, experience_years, video_path, status, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Intro videos live in a private bucket: hand out short-lived signed URLs only.
      const apps = await Promise.all(
        (data ?? []).map(async (app) => {
          let videoUrl: string | null = null;
          if (app.video_path) {
            const { data: signed } = await supabase.storage
              .from("tutor-intro-videos")
              .createSignedUrl(app.video_path, 600);
            videoUrl = signed?.signedUrl ?? null;
          }
          return { ...app, video_url: videoUrl };
        }),
      );

      return json({ applications: apps });
    }

    if (action === "update_application_status") {
      const { id, status } = body;
      if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
        return json({ error: "Invalid request" }, 400);
      }
      if (status !== "approved" && status !== "rejected") {
        return json({ error: "Invalid request" }, 400);
      }
      const { error } = await supabase
        .from("tutor_applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("admin-ops failure:", err);
    return json({ error: "Request could not be completed" }, 500);
  }
});
