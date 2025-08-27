import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM")!;

Deno.serve(async () => {
  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data } = await client.from("whatsapp_optin").select("phone");

  for (const row of data ?? []) {
    const params = new URLSearchParams({
      To: `whatsapp:${row.phone}`,
      From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      Body: "Your daily practice reminder from GramorX.",
    });

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      },
    );
  }

  return new Response("ok");
});
