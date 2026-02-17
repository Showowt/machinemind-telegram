const TELEGRAM_API = "https://api.telegram.org/bot";

export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: { parse_mode?: "HTML" | "Markdown" },
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }

  const url = `${TELEGRAM_API}${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode || "HTML",
  };

  console.log(`Sending message to ${chatId}: ${text.slice(0, 50)}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Telegram API error: ${response.status} - ${errorText}`);
    throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log("Message sent successfully:", result.ok);
  return result.ok;
}

export async function sendTyping(chatId: number | string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API}${token}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
