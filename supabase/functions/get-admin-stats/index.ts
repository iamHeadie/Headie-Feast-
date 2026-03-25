import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "enemalivictor5@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Use SECRET_KEY (service role) — never exposed to the browser
    const serviceKey =
      Deno.env.get("SECRET_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      "";
    if (!serviceKey) {
      console.error("[get-admin-stats] Service key not found: SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY are both unset");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey
    );

    // Verify the caller is the designated admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (user.email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin access only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Total community count via auth.admin (bypasses RLS) ──────────────────
    let totalCommunity = 0;
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error("[get-admin-stats] listUsers error:", error.message);
        return new Response(
          JSON.stringify({ error: `Failed to count users: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      totalCommunity += data.users.length;
      if (data.users.length < perPage) break;
      page++;
    }

    // ── Pending and active rider counts ──────────────────────────────────────
    const [pendingRes, activeRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "rider")
        .eq("rider_status", "pending"),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "rider")
        .eq("rider_status", "active"),
    ]);

    if (pendingRes.error) {
      console.error("[get-admin-stats] pendingRiders error:", pendingRes.error.message);
    }
    if (activeRes.error) {
      console.error("[get-admin-stats] activeRiders error:", activeRes.error.message);
    }

    return new Response(
      JSON.stringify({
        totalCommunity,
        pendingRiders: pendingRes.count ?? 0,
        activeRiders: activeRes.count ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[get-admin-stats] unhandled error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
