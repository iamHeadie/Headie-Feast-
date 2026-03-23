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
    const { user_id, display_name } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the rider's email from Supabase Auth
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (userError || !user?.email) {
      return new Response(
        JSON.stringify({ error: "Could not retrieve rider email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const riderName = display_name || "Rider";

    // Send welcome email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chopgee <riders@chopgee.com>",
        to: [user.email],
        subject: "You're approved! Welcome to the Chopgee Rider Fleet 🛵",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;padding:0;background:#FFFBF0;font-family:'DM Sans',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF0;padding:32px 16px;">
                <tr>
                  <td align="center">
                    <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#F97316,#FB923C);padding:32px 24px;text-align:center;">
                          <h1 style="color:#ffffff;font-size:28px;margin:0;font-weight:800;letter-spacing:-0.5px;">
                            You're In, ${riderName}! 🛵
                          </h1>
                          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">
                            Your Chopgee rider application has been approved.
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:32px 24px;">
                          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">
                            Hey <strong>${riderName}</strong>,
                          </p>
                          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
                            Welcome to the <strong>Chopgee Rider Fleet</strong>! Your account is now active and you can start accepting delivery requests immediately.
                          </p>

                          <!-- Next steps -->
                          <div style="background:#FFFBF0;border-radius:16px;padding:20px;margin:24px 0;">
                            <p style="color:#F97316;font-weight:700;font-size:14px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">
                              Your next steps
                            </p>
                            <table cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td style="padding:6px 0;">
                                  <span style="color:#F97316;font-weight:700;margin-right:8px;">01.</span>
                                  <span style="color:#333;font-size:14px;">Open the Chopgee Rider app</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:6px 0;">
                                  <span style="color:#F97316;font-weight:700;margin-right:8px;">02.</span>
                                  <span style="color:#333;font-size:14px;">Set yourself as <strong>Available</strong></span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:6px 0;">
                                  <span style="color:#F97316;font-weight:700;margin-right:8px;">03.</span>
                                  <span style="color:#333;font-size:14px;">Start earning on every delivery 🎉</span>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <p style="color:#555;font-size:14px;line-height:1.6;">
                            If you have any questions, reply to this email or reach out to our support team. We're excited to have you on the team!
                          </p>

                          <div style="text-align:center;margin:28px 0 8px;">
                            <a
                              href="https://chopgee.com"
                              style="display:inline-block;background:linear-gradient(135deg,#F97316,#FB923C);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:14px;text-decoration:none;"
                            >
                              Start Delivering Now
                            </a>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#F9F5EC;padding:20px 24px;text-align:center;border-top:1px solid #EDE8DC;">
                          <p style="color:#999;font-size:12px;margin:0;">
                            © ${new Date().getFullYear()} Chopgee · Your Obsessed Food Bestie<br/>
                            You received this because your rider application was approved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      throw new Error(`Resend error: ${emailRes.status} — ${errBody}`);
    }

    const data = await emailRes.json();

    return new Response(
      JSON.stringify({ success: true, email_id: data.id }),
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
