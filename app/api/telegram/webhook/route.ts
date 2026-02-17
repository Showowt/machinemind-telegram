import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/commands";
import type { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const update: TelegramUpdate = await request.json();

    if (update.message?.text && update.message.from && update.message.chat) {
      const { text } = update.message;
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;

      await handleCommand(chatId, userId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "MachineMind Telegram Bot Active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
