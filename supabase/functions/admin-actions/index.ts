import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "enemalivictor5@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Pull the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[admin-actions] No Authorization header present");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Strip the "Bearer " prefix if present
    const receivedKey = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    // 3. Debug log — visible in Supabase Logs tab
    console.log("[admin-actions] Received key matches SECRET_KEY:", receivedKey === Deno.env.get("SECRET_KEY"));

    // Admin client using SECRET_KEY — never sent to the browser
    const serviceKey = Deno.env.get("SECRET_KEY") ?? "";
    if (!serviceKey) {
      console.error("[admin-actions] SECRET_KEY is not set");
    }
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey
    );

    // 4. Verify the caller and check that they are the designated admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(receivedKey);
    if (authError || !user) {
      console.error("[admin-actions] getUser failed:", authError?.message ?? "no user");
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

    const body = await req.json();
    const { action } = body;

    // ── Get true user count via service-role (bypasses RLS) ──────────────────
    if (action === "get-user-count") {
      // listUsers paginates at 1000; page through all to get the real total.
      let total = 0;
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) {
          return new Response(
            JSON.stringify({ error: `Failed to count users: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        total += data.users.length;
        if (data.users.length < perPage) break;
        page++;
      }
      return new Response(
        JSON.stringify({ count: total }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Approve rider ────────────────────────────────────────────────────────
    if (action === "approve") {
      const { rider_id, user_id, display_name } = body;
      if (!rider_id) {
        return new Response(
          JSON.stringify({ error: "rider_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ rider_status: "active" })
        .eq("id", rider_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Approval failed: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Trigger welcome email (non-blocking)
      if (user_id) {
        supabaseAdmin.functions
          .invoke("send-rider-welcome", {
            body: { user_id, display_name: display_name ?? "Rider" },
          })
          .catch(() => {
            // Email failure is intentionally non-blocking
          });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Reject rider ─────────────────────────────────────────────────────────
    if (action === "reject") {
      const { rider_id } = body;
      if (!rider_id) {
        return new Response(
          JSON.stringify({ error: "rider_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ rider_status: "rejected" })
        .eq("id", rider_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Rejection failed: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Generate signed URLs for private rider-ids bucket ────────────────────
    if (action === "get-signed-urls") {
      // paths: Array<{ rider_id: string; path: string }>
      const { paths } = body as { paths: Array<{ rider_id: string; path: string }> };
      if (!Array.isArray(paths) || paths.length === 0) {
        return new Response(
          JSON.stringify({ urls: {} }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const urls: Record<string, string> = {};
      await Promise.all(
        paths.map(async ({ rider_id, path: filePath }) => {
          if (!filePath) return;
          // Legacy records may already hold a full https:// URL — pass through as-is
          if (filePath.startsWith("http")) {
            urls[rider_id] = filePath;
            return;
          }
          const { data: signed } = await supabaseAdmin.storage
            .from("rider-ids")
            .createSignedUrl(filePath, 3600);
          if (signed?.signedUrl) urls[rider_id] = signed.signedUrl;
        })
      );

      return new Response(
        JSON.stringify({ urls }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
