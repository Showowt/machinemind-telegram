import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/commands";
import type { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("Webhook POST received");

  try {
    const update: TelegramUpdate = await request.json();
    console.log("Update received:", JSON.stringify(update));

    if (update.message?.text && update.message.from && update.message.chat) {
      const { text } = update.message;
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;

      console.log(
        `Processing: chatId=${chatId}, userId=${userId}, text=${text}`,
      );
      await handleCommand(chatId, userId, text);
      console.log("Command handled successfully");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

// Telegram sends GET to verify webhook
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "MachineMind Telegram Bot Active",
    timestamp: new Date().toISOString(),
  });
}
