import { sendMessage, sendTyping } from "./telegram";
import {
  listProjects,
  getProject,
  listDeployments,
  triggerDeployment,
  getDeploymentLogs,
  getProjectDomains,
  getProjectEnvVars,
  getRuntimeLogs,
  promoteDeployment,
  cancelDeployment,
} from "./vercel";
import { triggerWorkflow } from "./github";

const GITHUB_OWNER = "Showowt";
const BOT_REPO = "machinemind-telegram";

type CommandHandler = (chatId: number, args: string[]) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  start: async (chatId) => {
    await sendMessage(
      chatId,
      `🚀 <b>MachineMind Command Center</b>\n\n` +
        `<b>🏗️ Create:</b>\n` +
        `<code>/new [business] [sector]</code> — Create full project\n\n` +
        `<b>🔧 Build:</b>\n` +
        `<code>/genesis [project]</code> — Full autonomous build\n` +
        `<code>/audit [project]</code> — Security + quality scan\n` +
        `<code>/demo [project]</code> — Create preview deploy\n` +
        `<code>/component [name] [project]</code> — Generate component\n` +
        `<code>/sofia [project]</code> — Sofia deploy swarm\n\n` +
        `<b>🚀 Deploy:</b>\n` +
        `<code>/sites</code> — List all projects\n` +
        `<code>/status [project]</code> — Deployment status\n` +
        `<code>/deploy [project]</code> — Deploy to production\n` +
        `<code>/logs [project]</code> — Build logs\n` +
        `<code>/errors [project]</code> — Runtime errors\n` +
        `<code>/rollback [project]</code> — Rollback\n` +
        `<code>/cancel [project]</code> — Cancel build\n\n` +
        `<b>📊 Info:</b>\n` +
        `<code>/domains [project]</code> — Domains\n` +
        `<code>/env [project]</code> — Env vars\n` +
        `<code>/ping</code> — Health check\n\n` +
        `💡 <code>/new "Yacht Club" hospitality</code>`,
    );
  },

  help: async (chatId) => {
    await commands.start(chatId, []);
  },

  ping: async (chatId) => {
    const start = Date.now();
    await sendMessage(
      chatId,
      `🏓 Pong! Response time: ${Date.now() - start}ms\n\n` +
        `🤖 Bot: Online\n` +
        `⚡ Vercel API: Connected\n` +
        `🔗 GitHub Actions: Ready\n` +
        `🕐 Server Time: ${new Date().toISOString()}`,
    );
  },

  // ==================== CREATE COMMANDS ====================

  new: async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `🏗️ <b>New Project Generator</b>\n\n` +
          `Creates a complete project from scratch.\n\n` +
          `<b>Usage:</b>\n` +
          `<code>/new [business-name] [sector]</code>\n\n` +
          `<b>Sectors:</b>\n` +
          `• hospitality\n` +
          `• restaurant\n` +
          `• nightclub\n` +
          `• yacht\n` +
          `• villa\n` +
          `• tour\n` +
          `• hotel\n` +
          `• spa\n\n` +
          `<b>Example:</b>\n` +
          `<code>/new "Cartagena Yacht Club" yacht</code>\n` +
          `<code>/new "Sofia Lounge" nightclub</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    // Parse args - handle quoted business name
    let businessName: string;
    let sector: string;

    const fullText = args.join(" ");
    const quotedMatch = fullText.match(/["']([^"']+)["']\s+(\w+)/);

    if (quotedMatch) {
      businessName = quotedMatch[1];
      sector = quotedMatch[2];
    } else {
      // No quotes - last word is sector, rest is business name
      sector = args[args.length - 1];
      businessName = args.slice(0, -1).join(" ");
    }

    const success = await triggerWorkflow(
      GITHUB_OWNER,
      BOT_REPO,
      "new-project.yml",
      {
        business_name: businessName,
        sector: sector,
        chat_id: String(chatId),
      },
    );

    if (success) {
      await sendMessage(
        chatId,
        `🏗️ <b>Project Creation Started</b>\n\n` +
          `🏢 Business: <code>${businessName}</code>\n` +
          `🎯 Sector: <code>${sector}</code>\n\n` +
          `⏱️ ETA: 2-3 minutes\n\n` +
          `You'll receive the GitHub repo + live URL when ready.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to start project creation.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  // ==================== BUILD COMMANDS ====================

  genesis: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `⚡ <b>Genesis Build</b>\n\n` +
          `Full autonomous build with ZDBS validation.\n\n` +
          `<b>Usage:</b> <code>/genesis [project-name]</code>\n` +
          `<b>Example:</b> <code>/genesis simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    const success = await triggerWorkflow(
      GITHUB_OWNER,
      BOT_REPO,
      "genesis.yml",
      {
        project: projectName,
        chat_id: String(chatId),
      },
    );

    if (success) {
      await sendMessage(
        chatId,
        `⚡ <b>Genesis Build Triggered</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🔄 Status: Queued\n\n` +
          `You'll receive updates as the build progresses.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to trigger Genesis build.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  audit: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔍 <b>Security Audit</b>\n\n` +
          `Scans for vulnerabilities, secrets, and code quality.\n\n` +
          `<b>Usage:</b> <code>/audit [project-name]</code>\n` +
          `<b>Example:</b> <code>/audit simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    const success = await triggerWorkflow(GITHUB_OWNER, BOT_REPO, "audit.yml", {
      project: projectName,
      chat_id: String(chatId),
    });

    if (success) {
      await sendMessage(
        chatId,
        `🔍 <b>Security Audit Started</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🔄 Status: Scanning...\n\n` +
          `You'll receive the audit report when complete.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to trigger audit.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  demo: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🎬 <b>Demo Deploy</b>\n\n` +
          `Creates a preview deployment for client demos.\n\n` +
          `<b>Usage:</b> <code>/demo [project-name]</code>\n` +
          `<b>Example:</b> <code>/demo simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    const success = await triggerWorkflow(GITHUB_OWNER, BOT_REPO, "demo.yml", {
      project: projectName,
      chat_id: String(chatId),
    });

    if (success) {
      await sendMessage(
        chatId,
        `🎬 <b>Demo Deploy Started</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🔄 Status: Creating preview...\n\n` +
          `You'll receive the preview URL when ready.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to trigger demo deploy.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  component: async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `🧩 <b>Component Generator</b>\n\n` +
          `Creates a new React component with ZDBS standards.\n\n` +
          `<b>Usage:</b> <code>/component [ComponentName] [project]</code>\n` +
          `<b>Example:</b> <code>/component HeroSection simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const componentName = args[0];
    const projectName = args[1];

    const success = await triggerWorkflow(
      GITHUB_OWNER,
      BOT_REPO,
      "component.yml",
      {
        component_name: componentName,
        project: projectName,
        chat_id: String(chatId),
      },
    );

    if (success) {
      await sendMessage(
        chatId,
        `🧩 <b>Component Generator Started</b>\n\n` +
          `📦 Component: <code>${componentName}</code>\n` +
          `📁 Project: <code>${projectName}</code>\n\n` +
          `You'll receive confirmation when the component is created.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to trigger component generator.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  sofia: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🤖 <b>Sofia Deploy Swarm</b>\n\n` +
          `Full deployment pipeline for Sofia AI agent projects.\n\n` +
          `<b>Includes:</b>\n` +
          `• TypeScript validation\n` +
          `• Build verification\n` +
          `• Vercel deployment\n` +
          `• Webhook configuration\n\n` +
          `<b>Usage:</b> <code>/sofia [project-name]</code>\n` +
          `<b>Example:</b> <code>/sofia sofia-brain</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    const success = await triggerWorkflow(
      GITHUB_OWNER,
      BOT_REPO,
      "sofia-deploy.yml",
      {
        project: projectName,
        chat_id: String(chatId),
      },
    );

    if (success) {
      await sendMessage(
        chatId,
        `🤖 <b>Sofia Deploy Swarm Initiated</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🔄 Status: Running checks...\n\n` +
          `You'll receive the deployment URL when complete.`,
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Failed to trigger Sofia deploy.\n\n` +
          `Make sure GITHUB_TOKEN is configured.`,
      );
    }
  },

  // ==================== DEPLOYMENT COMMANDS ====================

  sites: async (chatId) => {
    await sendTyping(chatId);

    try {
      const projects = await listProjects();

      if (projects.length === 0) {
        await sendMessage(chatId, "📁 No projects found.");
        return;
      }

      const list = projects
        .slice(0, 25)
        .map((p, i) => {
          const framework = p.framework ? ` (${p.framework})` : "";
          return `${i + 1}. <code>${p.name}</code>${framework}`;
        })
        .join("\n");

      await sendMessage(
        chatId,
        `📁 <b>Your Projects (${projects.length})</b>\n\n${list}\n\n` +
          `💡 Use <code>/status [name]</code> for details`,
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
      await sendMessage(
        chatId,
        `📊 <b>Usage:</b> <code>/status [project-name]</code>\n\n` +
          `Example: <code>/status simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    try {
      const project = await getProject(projectName);

      if (!project) {
        await sendMessage(
          chatId,
          `❌ Project <code>${projectName}</code> not found.\n\nUse <code>/sites</code> to see available projects.`,
        );
        return;
      }

      const deployments = await listDeployments(project.id, 5);

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
        INITIALIZING: "🔧",
      };

      const latest = deployments[0];
      const latestEmoji = statusEmoji[latest.state] || "❓";
      const commitMsg =
        latest.meta?.gitCommitMessage?.slice(0, 50) || "No commit message";
      const branch = latest.meta?.gitCommitRef || "main";

      let msg =
        `📦 <b>${project.name}</b>\n\n` +
        `<b>Latest Deployment:</b>\n` +
        `${latestEmoji} ${latest.state}\n` +
        `🔗 <a href="https://${latest.url}">${latest.url}</a>\n` +
        `📝 ${commitMsg}\n` +
        `🌿 ${branch}\n` +
        `📅 ${new Date(latest.createdAt).toLocaleString()}\n`;

      if (deployments.length > 1) {
        msg += `\n<b>Recent History:</b>\n`;
        deployments.slice(1, 4).forEach((d) => {
          const emoji = statusEmoji[d.state] || "❓";
          const date = new Date(d.createdAt).toLocaleDateString();
          msg += `${emoji} ${d.state} — ${date}\n`;
        });
      }

      await sendMessage(chatId, msg);
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  deploy: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🚀 <b>Usage:</b> <code>/deploy [project-name]</code>\n\n` +
          `Example: <code>/deploy simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    await sendMessage(
      chatId,
      `🚀 Deploying <code>${projectName}</code> to production...`,
    );

    try {
      const result = await triggerDeployment(projectName);

      if (!result) {
        await sendMessage(
          chatId,
          `❌ Failed to deploy <code>${projectName}</code>.\n\nCheck if project exists with <code>/sites</code>`,
        );
        return;
      }

      await sendMessage(
        chatId,
        `✅ <b>Deployment Triggered!</b>\n\n` +
          `📦 Project: <code>${projectName}</code>\n` +
          `🆔 Deployment: <code>${result.id.slice(0, 12)}...</code>\n` +
          `🔗 URL: <a href="https://${result.url}">${result.url}</a>\n\n` +
          `⏱️ Building now...\n` +
          `Use <code>/status ${projectName}</code> to check progress.`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Deploy Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  logs: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `📋 <b>Usage:</b> <code>/logs [project-name]</code>\n\n` +
          `Example: <code>/logs simmer-down</code>`,
      );
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
          `📋 No deployments found for <code>${projectName}</code>.`,
        );
        return;
      }

      const logs = await getDeploymentLogs(deployments[0].id);

      if (logs.length === 0) {
        await sendMessage(
          chatId,
          `📋 No build logs available for <code>${projectName}</code>.`,
        );
        return;
      }

      const logText = logs.slice(-30).join("\n").slice(-3500);

      await sendMessage(
        chatId,
        `📋 <b>Build Logs: ${projectName}</b>\n\n<pre>${logText}</pre>`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  errors: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔴 <b>Usage:</b> <code>/errors [project-name]</code>\n\n` +
          `Shows runtime errors from your deployed application.`,
      );
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

      const logs = await getRuntimeLogs(project.id, {
        level: "error",
        limit: 10,
      });

      if (logs.length === 0) {
        await sendMessage(
          chatId,
          `✅ <b>${projectName}</b>\n\nNo runtime errors found! 🎉`,
        );
        return;
      }

      const errorList = logs
        .map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          const msg = log.message.slice(0, 100);
          return `🔴 ${time}\n${msg}`;
        })
        .join("\n\n");

      await sendMessage(
        chatId,
        `🔴 <b>Runtime Errors: ${projectName}</b>\n\n${errorList}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  domains: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🌐 <b>Usage:</b> <code>/domains [project-name]</code>`,
      );
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

      const domains = await getProjectDomains(project.id);

      if (domains.length === 0) {
        await sendMessage(
          chatId,
          `🌐 <b>${projectName}</b>\n\nNo custom domains configured.`,
        );
        return;
      }

      const domainList = domains
        .map((d) => {
          const status = d.verified ? "✅" : "⚠️";
          const branch = d.gitBranch ? ` (${d.gitBranch})` : "";
          return `${status} <code>${d.name}</code>${branch}`;
        })
        .join("\n");

      await sendMessage(
        chatId,
        `🌐 <b>Domains: ${projectName}</b>\n\n${domainList}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  env: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔐 <b>Usage:</b> <code>/env [project-name]</code>\n\n` +
          `Shows environment variable names (not values).`,
      );
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

      const envVars = await getProjectEnvVars(project.id);

      if (envVars.length === 0) {
        await sendMessage(
          chatId,
          `🔐 <b>${projectName}</b>\n\nNo environment variables configured.`,
        );
        return;
      }

      const envList = envVars
        .map((e) => {
          const targets = e.target.join(", ");
          const icon = e.type === "secret" ? "🔒" : "📝";
          return `${icon} <code>${e.key}</code>\n   → ${targets}`;
        })
        .join("\n");

      await sendMessage(
        chatId,
        `🔐 <b>Env Vars: ${projectName}</b> (${envVars.length})\n\n${envList}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  rollback: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `⏪ <b>Usage:</b> <code>/rollback [project-name]</code>\n\n` +
          `Promotes the previous successful deployment to production.`,
      );
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

      const deployments = await listDeployments(project.id, 5);

      const previousReady = deployments.find(
        (d, i) => i > 0 && d.state === "READY",
      );

      if (!previousReady) {
        await sendMessage(
          chatId,
          `⏪ No previous successful deployment found for <code>${projectName}</code>.`,
        );
        return;
      }

      await sendMessage(
        chatId,
        `⏪ Rolling back <code>${projectName}</code>...`,
      );

      const success = await promoteDeployment(previousReady.id, project.id);

      if (success) {
        await sendMessage(
          chatId,
          `✅ <b>Rollback Complete!</b>\n\n` +
            `📦 Project: <code>${projectName}</code>\n` +
            `🔗 URL: <a href="https://${previousReady.url}">${previousReady.url}</a>\n` +
            `📅 From: ${new Date(previousReady.createdAt).toLocaleString()}`,
        );
      } else {
        await sendMessage(
          chatId,
          `❌ Rollback failed for <code>${projectName}</code>.`,
        );
      }
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  cancel: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🛑 <b>Usage:</b> <code>/cancel [project-name]</code>\n\n` +
          `Cancels any active deployment.`,
      );
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
      const activeDeployment = deployments.find(
        (d) =>
          d.state === "BUILDING" ||
          d.state === "QUEUED" ||
          d.state === "INITIALIZING",
      );

      if (!activeDeployment) {
        await sendMessage(
          chatId,
          `🛑 No active deployment to cancel for <code>${projectName}</code>.`,
        );
        return;
      }

      const success = await cancelDeployment(activeDeployment.id);

      if (success) {
        await sendMessage(
          chatId,
          `✅ Deployment cancelled for <code>${projectName}</code>.`,
        );
      } else {
        await sendMessage(
          chatId,
          `❌ Failed to cancel deployment for <code>${projectName}</code>.`,
        );
      }
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
  const authorizedUsers =
    process.env.AUTHORIZED_TELEGRAM_IDS?.split(",").map(Number) || [];

  if (authorizedUsers.length > 0 && !authorizedUsers.includes(userId)) {
    await sendMessage(chatId, "⛔ Unauthorized. This bot is private.");
    return;
  }

  if (!text.startsWith("/")) {
    await sendMessage(
      chatId,
      "Send a command like <code>/help</code> to get started.",
    );
    return;
  }

  const parts = text.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase().split("@")[0];
  const args = parts.slice(1);

  const handler = commands[command];

  if (!handler) {
    await sendMessage(
      chatId,
      `❓ Unknown command: <code>/${command}</code>\n\nUse <code>/help</code> for available commands.`,
    );
    return;
  }

  try {
    await handler(chatId, args);
  } catch (error) {
    await sendMessage(
      chatId,
      `❌ Command failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
