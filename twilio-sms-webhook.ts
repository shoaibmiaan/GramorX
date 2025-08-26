// twilio-sms-webhook.ts
import express, { Request, Response, NextFunction } from "express";
import Twilio from "twilio";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.urlencoded({ extended: false }));

// ENV: set these
const { TWILIO_AUTH_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!TWILIO_AUTH_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing required env vars");
  process.exit(1);
}

const supa = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// Schema and types for Twilio webhook payload
const twilioPayloadSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.string(),
  To: z.string(),
  From: z.string().optional(),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
});

type TwilioPayload = z.infer<typeof twilioPayloadSchema>;

// Validate Twilio signature middleware
function validateTwilio(req: Request, res: Response, next: NextFunction): void {
  const signature = (req.headers["x-twilio-signature"] as string) || "";
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const params = req.body;
  const valid = Twilio.validateRequest(
    TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
  if (!valid) {
    res.status(403).send("Invalid Twilio signature");
    return;
  }
  next();
}

app.post(
  "/twilio/sms-status",
  validateTwilio,
  async (req: Request<{}, {}, TwilioPayload>, res: Response) => {
    try {
      const parseResult = twilioPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid payload",
          details: parseResult.error.issues,
        });
      }

      const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } =
        parseResult.data;

      const payload = {
        message_sid: MessageSid,
        status: MessageStatus,
        to_number: To,
        from_number: From || null,
        error_code: ErrorCode || null,
        error_message: ErrorMessage || null,
        received_at: new Date().toISOString(),
      };

      const { error } = await supa
        .from("message_statuses")
        .upsert(payload, { onConflict: "message_sid" });

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({
          error: "Error storing message status",
          details: error.message,
        });
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Twilio webhook listening on :${port}`));
