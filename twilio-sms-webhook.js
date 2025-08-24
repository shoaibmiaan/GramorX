// twilio-sms-webhook.js
import express from "express";
import bodyParser from "body-parser";
import { twiml } from "twilio";
import Twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ENV: set these
const { TWILIO_AUTH_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!TWILIO_AUTH_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing required env vars");
  process.exit(1);
}

const twilioHelper = Twilio(); // only for validation; auth token comes below
const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Validate Twilio signature middleware
function validateTwilio(req, res, next) {
  const signature = req.headers["x-twilio-signature"] || "";
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const params = req.body;
  const valid = Twilio.validateRequest(
    TWILIO_AUTH_TOKEN,
    signature,
    url,
    params
  );
  if (!valid) {
    return res.status(403).send("Invalid Twilio signature");
  }
  next();
}

app.post("/twilio/sms-status", validateTwilio, async (req, res) => {
  try {
    // Twilio posts these (among others): MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage
    const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = req.body;

    // Store / update in Supabase
    // You should map MessageSid <-> your internal user or message record when you send SMS
    const payload = {
      message_sid: MessageSid,
      status: MessageStatus,
      to_number: To,
      from_number: From || null,
      error_code: ErrorCode || null,
      error_message: ErrorMessage || null,
      received_at: new Date().toISOString(),
    };

    await supa.from("message_statuses").upsert(payload, { onConflict: "message_sid" });

    console.log("Twilio status saved:", payload);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Server error");
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Twilio webhook listening on :${port}`));
