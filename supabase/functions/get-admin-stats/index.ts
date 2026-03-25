import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Pull the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[get-admin-stats] No Authorization header present");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Strip the "Bearer " prefix if present
    const receivedKey = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    // 3. Compare directly against SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!serviceRoleKey) {
      console.error("[get-admin-stats] SUPABASE_SERVICE_ROLE_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (receivedKey !== serviceRoleKey) {
      console.error("[get-admin-stats] Authorization header does not match SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
