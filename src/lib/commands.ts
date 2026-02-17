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
import {
  triggerWorkflow,
  listReposDetailed,
  repoExists,
  createRepo,
} from "./github";
import {
  researchBusiness,
  formatResearchForTelegram,
  researchToBuildConfig,
} from "./research";
import {
  generateBuildConfig,
  formatBuildConfigForTelegram,
  generateBuildPrompt,
  SECTOR_TEMPLATES,
} from "./genesis-engine";

const GITHUB_OWNER = "Showowt";
const BOT_REPO = "machinemind-telegram";

/**
 * Extract project name from URL or return as-is
 * Handles:
 * - https://project-name.vercel.app → project-name
 * - https://project-name-abc123-team.vercel.app → project-name
 * - https://github.com/owner/repo → repo
 * - project-name → project-name
 */
function extractProjectName(input: string): string {
  // Vercel URL: https://project-name.vercel.app or deployment URLs
  const vercelMatch = input.match(
    /https?:\/\/([a-z0-9-]+?)(?:-[a-z0-9]{8,})?(?:-[a-z0-9-]+)?\.vercel\.app/i,
  );
  if (vercelMatch) {
    return vercelMatch[1];
  }

  // GitHub URL: https://github.com/owner/repo
  const githubMatch = input.match(/https?:\/\/github\.com\/[^/]+\/([^/\s]+)/i);
  if (githubMatch) {
    return githubMatch[1].replace(/\.git$/, "");
  }

  // Already a project name
  return input;
}

/**
 * Clean all args by extracting project names from URLs
 */
function cleanArgs(args: string[]): string[] {
  return args.map((arg) => extractProjectName(arg));
}

type CommandHandler = (chatId: number, args: string[]) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  start: async (chatId) => {
    await sendMessage(
      chatId,
      `🚀 <b>MachineMind Command Center</b>\n\n` +
        `<b>⚡ GENESIS ENGINE:</b>\n` +
        `<code>/build [business] [sector]</code> — Full masterpiece build\n` +
        `<code>/research [business]</code> — Scrape business intel\n\n` +
        `<b>🏗️ Create:</b>\n` +
        `<code>/new [business] [sector]</code> — Create project\n\n` +
        `<b>📦 GitHub:</b>\n` +
        `<code>/repos</code> — List GitHub repos\n\n` +
        `<b>🔧 CI/CD:</b>\n` +
        `<code>/genesis [project]</code> — Run build checks\n` +
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
        `💡 <code>/research "Alquimico" nightclub</code>`,
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

  // ==================== RESEARCH COMMANDS ====================

  research: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔍 <b>Research Agent</b>\n\n` +
          `Scrapes business info from the web before builds.\n\n` +
          `<b>Usage:</b>\n` +
          `<code>/research [business-name]</code>\n` +
          `<code>/research [business-name] [sector]</code>\n` +
          `<code>/research [business-name] [sector] [city]</code>\n\n` +
          `<b>Examples:</b>\n` +
          `<code>/research "Casa San Agustin"</code>\n` +
          `<code>/research "Alquimico" nightclub Cartagena</code>\n` +
          `<code>/research "La Cevicheria" restaurant</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    await sendMessage(chatId, `🔍 Researching business...`);

    // Parse args - handle quoted business name
    const fullText = args.join(" ");
    let businessName: string;
    let sector: string | undefined;
    let location: string | undefined;

    const quotedMatch = fullText.match(/["']([^"']+)["']\s*(.*)/);
    if (quotedMatch) {
      businessName = quotedMatch[1];
      const remaining = quotedMatch[2].trim().split(/\s+/);
      sector = remaining[0] || undefined;
      location = remaining.slice(1).join(" ") || undefined;
    } else {
      // No quotes - first word is business, rest are sector/location
      const words = fullText.split(/\s+/);
      businessName = words[0];
      sector = words[1] || undefined;
      location = words.slice(2).join(" ") || undefined;
    }

    try {
      const research = await researchBusiness(businessName, sector, location);
      const formattedMsg = formatResearchForTelegram(research);
      await sendMessage(chatId, formattedMsg);

      // Also show build config preview
      const config = researchToBuildConfig(research);
      const configPreview = Object.entries(config)
        .slice(0, 8)
        .map(([k, v]) => `${k}: ${v.slice(0, 30)}${v.length > 30 ? "..." : ""}`)
        .join("\n");

      await sendMessage(
        chatId,
        `\n📦 <b>Build Config Preview:</b>\n<pre>${configPreview}</pre>\n\n` +
          `💡 Use <code>/build "${businessName}" ${sector || "hospitality"}</code> to create a masterpiece.`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  build: async (chatId, args) => {
    if (args.length === 0) {
      const sectors = Object.keys(SECTOR_TEMPLATES).join(", ");
      await sendMessage(
        chatId,
        `⚡ <b>GENESIS BUILD ENGINE</b>\n\n` +
          `Powered by PROMETHEUS v2 + APEX v6 + BCB-OS v2\n\n` +
          `Creates masterpiece websites with:\n` +
          `• Research Agent (scrapes business intel)\n` +
          `• APEX 4-Layer Architecture\n` +
          `• Blue Ocean competitive advantage\n` +
          `• Sector-specific templates\n` +
          `• ZDBS quality standards\n\n` +
          `<b>Usage:</b>\n` +
          `<code>/build [business-name] [sector]</code>\n\n` +
          `<b>Sectors:</b> ${sectors}\n\n` +
          `<b>Example:</b>\n` +
          `<code>/build "Casa San Agustin" hotel</code>\n` +
          `<code>/build "Alquimico" nightclub</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    // Parse args
    const fullText = args.join(" ");
    let businessName: string;
    let sector: string;
    let location: string | undefined;

    const quotedMatch = fullText.match(/["']([^"']+)["']\s*(.*)/);
    if (quotedMatch) {
      businessName = quotedMatch[1];
      const remaining = quotedMatch[2].trim().split(/\s+/);
      sector = remaining[0] || "hospitality";
      location = remaining.slice(1).join(" ") || undefined;
    } else {
      const words = fullText.split(/\s+/);
      sector = words[words.length - 1];
      businessName = words.slice(0, -1).join(" ");
      if (!businessName) {
        businessName = sector;
        sector = "hospitality";
      }
    }

    // Validate sector
    if (!SECTOR_TEMPLATES[sector]) {
      const sectors = Object.keys(SECTOR_TEMPLATES).join(", ");
      await sendMessage(
        chatId,
        `❌ Unknown sector: <code>${sector}</code>\n\n` +
          `Available: ${sectors}`,
      );
      return;
    }

    await sendMessage(
      chatId,
      `⚡ <b>GENESIS ENGINE ACTIVATED</b>\n\n` +
        `🔍 Phase 1: Research Agent scanning...\n` +
        `📊 Business: ${businessName}\n` +
        `🏷️ Sector: ${sector}`,
    );

    try {
      // Phase 1: Research
      const research = await researchBusiness(businessName, sector, location);

      await sendMessage(
        chatId,
        `✅ Research complete\n\n` + `🏗️ Phase 2: Generating build config...`,
      );

      // Phase 2: Generate build config using Genesis Engine
      const buildConfig = generateBuildConfig(research, String(chatId));

      // Display the full config
      const configDisplay = formatBuildConfigForTelegram(buildConfig);
      await sendMessage(chatId, configDisplay);

      // Phase 3: Generate the build prompt (for reference)
      const buildPrompt = generateBuildPrompt(buildConfig);

      await sendMessage(
        chatId,
        `\n🚀 <b>Ready to Build</b>\n\n` +
          `This will create:\n` +
          `• ${buildConfig.architecture.pages.length} pages\n` +
          `• ${buildConfig.architecture.components.length} components\n` +
          `• ${buildConfig.architecture.features.length} features\n\n` +
          `Blue Ocean: ${buildConfig.blueOcean.vector}\n\n` +
          `<b>Next:</b> <code>/new "${businessName}" ${sector}</code> to launch the build`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Build config failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  repos: async (chatId, args) => {
    await sendTyping(chatId);

    try {
      const repos = await listReposDetailed(GITHUB_OWNER);

      if (repos.length === 0) {
        await sendMessage(chatId, "📁 No GitHub repos found.");
        return;
      }

      // Filter by search term if provided
      let filtered = repos;
      if (args.length > 0) {
        const search = args[0].toLowerCase();
        filtered = repos.filter(
          (r) =>
            r.name.toLowerCase().includes(search) ||
            r.description?.toLowerCase().includes(search),
        );
      }

      const list = filtered
        .slice(0, 20)
        .map((r, i) => {
          const lang = r.language ? ` (${r.language})` : "";
          const updated = new Date(r.updated_at).toLocaleDateString();
          return `${i + 1}. <code>${r.name}</code>${lang}\n   📅 ${updated}`;
        })
        .join("\n");

      const searchNote = args.length > 0 ? ` matching "${args[0]}"` : "";

      await sendMessage(
        chatId,
        `📦 <b>GitHub Repos${searchNote}</b> (${filtered.length})\n\n${list}\n\n` +
          `💡 These can be used with <code>/genesis [repo]</code>\n` +
          `🔍 Search: <code>/repos [keyword]</code>`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
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
          `<b>Example:</b> <code>/genesis simmer-down</code>\n\n` +
          `💡 Use <code>/repos</code> to see available repos`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];

    // Check if repo exists on GitHub
    const exists = await repoExists(GITHUB_OWNER, projectName);

    if (!exists) {
      // Check if maybe they meant a similar repo
      const repos = await listReposDetailed(GITHUB_OWNER);
      const similar = repos
        .filter((r) => r.name.toLowerCase().includes(projectName.toLowerCase()))
        .slice(0, 3);

      let suggestion = "";
      if (similar.length > 0) {
        suggestion =
          `\n\n<b>Did you mean:</b>\n` +
          similar.map((r) => `• <code>${r.name}</code>`).join("\n");
      }

      await sendMessage(
        chatId,
        `❌ <b>Repo not found:</b> <code>${GITHUB_OWNER}/${projectName}</code>\n\n` +
          `Genesis requires a GitHub repo to run CI/CD.\n\n` +
          `<b>Options:</b>\n` +
          `1️⃣ <code>/repos</code> — List your GitHub repos\n` +
          `2️⃣ <code>/repos ${projectName}</code> — Search repos\n` +
          `3️⃣ <code>/new "${projectName}" hospitality</code> — Create new project` +
          suggestion,
      );
      return;
    }

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
  const args = cleanArgs(parts.slice(1));

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
