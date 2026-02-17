import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/commands";
import type { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const debugInfo: string[] = ["webhook_called"];

  try {
    const update: TelegramUpdate = await request.json();
    debugInfo.push(`update_id:${update.update_id}`);

    if (update.message?.text && update.message.from && update.message.chat) {
      const { text } = update.message;
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;

      debugInfo.push(`chat:${chatId}`, `user:${userId}`, `text:${text}`);

      try {
        await handleCommand(chatId, userId, text);
        debugInfo.push("command_success");
      } catch (cmdError) {
        debugInfo.push(
          `command_error:${cmdError instanceof Error ? cmdError.message : String(cmdError)}`,
        );
      }
    } else {
      debugInfo.push("no_text_message");
    }

    return NextResponse.json({ ok: true, debug: debugInfo });
  } catch (error) {
    debugInfo.push(
      `error:${error instanceof Error ? error.message : String(error)}`,
    );
    return NextResponse.json({ ok: false, debug: debugInfo });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "MachineMind Telegram Bot Active",
    timestamp: new Date().toISOString(),
  });
}
