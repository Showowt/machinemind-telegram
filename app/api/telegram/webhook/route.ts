import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/commands";
import type { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const update: TelegramUpdate = await request.json();

    // Only handle text messages
    if (update.message?.text && update.message.from && update.message.chat) {
      const { text } = update.message;
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;

      // Process command in background (don't await to respond quickly)
      handleCommand(chatId, userId, text).catch(console.error);
    }

    // Always return 200 to Telegram
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Still return 200 to prevent retries
  }
}

// Telegram sends GET to verify webhook
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "MachineMind Telegram Bot Active",
    timestamp: new Date().toISOString(),
  });
}
