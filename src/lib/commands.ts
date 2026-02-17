import { sendMessage, sendTyping } from "./telegram";
import {
  listProjects,
  getProject,
  listDeployments,
  triggerDeployment,
  getDeploymentLogs,
} from "./vercel";

type CommandHandler = (chatId: number, args: string[]) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  start: async (chatId) => {
    await sendMessage(
      chatId,
      `🚀 <b>MachineMind Command Center</b>\n\n` +
        `Available commands:\n\n` +
        `<code>/sites</code> — List all projects\n` +
        `<code>/status [project]</code> — Deployment status\n` +
        `<code>/deploy [project]</code> — Trigger deployment\n` +
        `<code>/logs [project]</code> — Recent build logs\n` +
        `<code>/help</code> — Show this message\n\n` +
        `💡 Example: <code>/deploy simmer-down</code>`,
    );
  },

  help: async (chatId) => {
    await commands.start(chatId, []);
  },

  sites: async (chatId) => {
    await sendTyping(chatId);

    try {
      const projects = await listProjects();

      if (projects.length === 0) {
        await sendMessage(chatId, "No projects found.");
        return;
      }

      const list = projects
        .slice(0, 20)
        .map((p, i) => `${i + 1}. <code>${p.name}</code>`)
        .join("\n");

      await sendMessage(
        chatId,
        `📁 <b>Your Projects (${projects.length})</b>\n\n${list}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  status: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(chatId, "Usage: <code>/status [project-name]</code>");
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    try {
      const project = await getProject(projectName);

      if (!project) {
        await sendMessage(
          chatId,
          `❌ Project <code>${projectName}</code> not found.`,
        );
        return;
      }

      const deployments = await listDeployments(project.id, 3);

      if (deployments.length === 0) {
        await sendMessage(
          chatId,
          `📦 <b>${project.name}</b>\n\nNo deployments found.`,
        );
        return;
      }

      const statusEmoji: Record<string, string> = {
        READY: "✅",
        ERROR: "❌",
        BUILDING: "🔄",
        QUEUED: "⏳",
        CANCELED: "🚫",
      };

      const deployList = deployments
        .map((d) => {
          const emoji = statusEmoji[d.state] || "❓";
          const date = new Date(d.createdAt).toLocaleString();
          return `${emoji} ${d.state}\n   🔗 ${d.url}\n   📅 ${date}`;
        })
        .join("\n\n");

      await sendMessage(
        chatId,
        `📦 <b>${project.name}</b>\n\n<b>Recent Deployments:</b>\n\n${deployList}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  deploy: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(chatId, "Usage: <code>/deploy [project-name]</code>");
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    await sendMessage(
      chatId,
      `🚀 Triggering deployment for <code>${projectName}</code>...`,
    );

    try {
      const result = await triggerDeployment(projectName);

      if (!result) {
        await sendMessage(
          chatId,
          `❌ Failed to deploy <code>${projectName}</code>. Check if project exists.`,
        );
        return;
      }

      await sendMessage(
        chatId,
        `✅ <b>Deployment triggered!</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🆔 ID: <code>${result.id}</code>\n` +
          `🔗 URL: ${result.url}\n\n` +
          `Use <code>/status ${projectName}</code> to check progress.`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  logs: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(chatId, "Usage: <code>/logs [project-name]</code>");
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    try {
      const project = await getProject(projectName);

      if (!project) {
        await sendMessage(
          chatId,
          `❌ Project <code>${projectName}</code> not found.`,
        );
        return;
      }

      const deployments = await listDeployments(project.id, 1);

      if (deployments.length === 0) {
        await sendMessage(
          chatId,
          `No deployments found for <code>${projectName}</code>.`,
        );
        return;
      }

      const logs = await getDeploymentLogs(deployments[0].id);

      if (logs.length === 0) {
        await sendMessage(
          chatId,
          `No logs available for <code>${projectName}</code>.`,
        );
        return;
      }

      const logText = logs.slice(-20).join("\n").slice(0, 3500);

      await sendMessage(
        chatId,
        `📋 <b>Logs for ${projectName}</b>\n\n<pre>${logText}</pre>`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
};

export async function handleCommand(
  chatId: number,
  userId: number,
  text: string,
): Promise<void> {
  // Security: Check if user is authorized
  const authorizedUsers =
    process.env.AUTHORIZED_TELEGRAM_IDS?.split(",").map(Number) || [];

  if (authorizedUsers.length > 0 && !authorizedUsers.includes(userId)) {
    await sendMessage(chatId, "⛔ Unauthorized. This bot is private.");
    return;
  }

  // Parse command
  if (!text.startsWith("/")) {
    await sendMessage(
      chatId,
      "Send a command like <code>/help</code> to get started.",
    );
    return;
  }

  const parts = text.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase().split("@")[0]; // Remove @botname suffix
  const args = parts.slice(1);

  const handler = commands[command];

  if (!handler) {
    await sendMessage(
      chatId,
      `Unknown command: <code>/${command}</code>\n\nUse <code>/help</code> for available commands.`,
    );
    return;
  }

  await handler(chatId, args);
}
