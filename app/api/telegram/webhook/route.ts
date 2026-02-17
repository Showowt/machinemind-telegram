import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleCommand } from "@/lib/commands";

// Zod schema for Telegram webhook updates - validates at runtime
const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        is_bot: z.boolean(),
        first_name: z.string(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.string(),
      }),
      date: z.number(),
      text: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // CRITICAL: Verify webhook secret token from Telegram
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    // If secret is configured, enforce it strictly
    if (expectedSecret && secret !== expectedSecret) {
      console.error("Webhook: Invalid secret token");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Parse and validate the request body with zod
    const body = await request.json();
    const parsed = TelegramUpdateSchema.safeParse(body);

    if (!parsed.success) {
      // Return 200 to prevent Telegram retries on malformed data
      return NextResponse.json({ ok: true });
    }

    const update = parsed.data;

    if (update.message?.text && update.message.from && update.message.chat) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const text = update.message.text;

      await handleCommand(chatId, userId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Return 200 to prevent Telegram retries
  }
}

// Return 405 Method Not Allowed - no status leak
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
