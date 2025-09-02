// twilio-sms-webhook.ts
import express, { Request, Response, NextFunction } from "express";
import Twilio from "twilio";
import { z } from "zod";
import { randomUUID } from "crypto";
import { env } from "./lib/env";
import { captureException } from "./lib/monitoring/sentry";
import { supabaseService } from "./lib/supabaseService";

type LogLevel = "info" | "error";
function log(level: LogLevel, message: string, meta?: Record<string, any>) {
  const entry = { level, message, ...(meta || {}) };
  if (env.NODE_ENV === "development") {
    const fn = level === "error" ? console.error : console.log;
    fn(message, meta);
  } else {
    const fn = level === "error" ? console.error : console.log;
    fn(JSON.stringify(entry));
  }
}

const app = express();
app.use(express.urlencoded({ extended: false }));

// ENV: set these
const { TWILIO_AUTH_TOKEN } = env;
if (!TWILIO_AUTH_TOKEN) {
  console.warn("TWILIO_AUTH_TOKEN not set; Twilio signature validation disabled");
}

const supa = supabaseService;

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
  if (!TWILIO_AUTH_TOKEN) return next();
  const signature = (req.headers["x-twilio-signature"] as string) || "";
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const params = req.body;
  const valid = Twilio.validateRequest(
    TWILIO_AUTH_TOKEN,
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
    const requestId = (req.headers["x-request-id"] as string) || randomUUID();
    try {
      const parseResult = twilioPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        log("error", "Invalid payload", { requestId, issues: parseResult.error.issues });
        return res.status(400).json({
          error: "Invalid payload",
          details: parseResult.error.issues,
          requestId,
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
        log("error", "Supabase error", { requestId, messageSid: MessageSid, error: error.message });
        captureException(error, { requestId, messageSid: MessageSid });
        return res.status(500).json({
          error: "Error storing message status",
          details: error.message,
          requestId,
        });
      }

      log("info", "Message status stored", { requestId, messageSid: MessageSid });
      res.status(200).send("OK");
    } catch (err) {
      log("error", "Webhook error", {
        requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      captureException(err, { requestId });
      res.status(500).json({ error: "Server error", requestId });
    }
  }
);

const port = env.PORT ?? 4000;
app.listen(port, () =>
  log("info", `Twilio webhook listening on :${port}`, { port })
);
