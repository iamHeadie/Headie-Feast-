import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Pull the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[rider-onboarding] No Authorization header present");
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
    console.log("[rider-onboarding] Received key matches SECRET_KEY:", receivedKey === Deno.env.get("SECRET_KEY"));

    // Build an admin client using SECRET_KEY (never exposed to the browser)
    const serviceKey = Deno.env.get("SECRET_KEY") ?? "";
    if (!serviceKey) {
      console.error("[rider-onboarding] SECRET_KEY is not set");
    }
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey
    );

    // 4. Verify the caller is a real authenticated user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(receivedKey);
    if (authError || !user) {
      console.error("[rider-onboarding] getUser failed:", authError?.message ?? "no user");
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { display_name, phone, vehicle_type, id_image_url } = await req.json();

    if (!display_name || !phone || !vehicle_type || !id_image_url) {
      return new Response(
        JSON.stringify({ error: "display_name, phone, vehicle_type and id_image_url are all required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the service-role client to write to profiles — bypasses RLS safely
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: display_name.trim(),
          phone: phone.trim(),
          vehicle_type,
          id_image_url,
          role: "rider",
          rider_status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: `Profile update failed: ${upsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
