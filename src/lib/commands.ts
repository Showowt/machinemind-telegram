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
import { triggerWorkflow, listReposDetailed, repoExists } from "./github";
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
// Elite tier imports
import {
  analyzeAndFix,
  reviewCode,
  optimizeProject,
  chatAboutProject,
} from "./ai-operations";
import {
  calculateROI,
  generatePitch,
  generateProposal,
  analyzeCompetitors,
  formatROIForTelegram,
  formatPitchForTelegram,
  formatProposalForTelegram,
} from "./client-acquisition";
import {
  runSpeedTest,
  checkSEO,
  checkUptime,
  formatSpeedForTelegram,
  formatSEOForTelegram,
  formatUptimeForTelegram,
} from "./analytics";
import {
  generateCopy,
  translateText,
  generateImagePrompt,
  formatCopyForTelegram,
  formatTranslationForTelegram,
} from "./content-generation";
import {
  cloneProject,
  setEnvVar,
  addDomain,
  getPreviewUrl,
} from "./advanced-deploy";

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
      `🚀 <b>MachineMind Command Center v2</b>\n\n` +
        `<b>⚡ GENESIS ENGINE:</b>\n` +
        `<code>/build</code> — Full masterpiece build\n` +
        `<code>/research</code> — Scrape business intel\n` +
        `<code>/new</code> — Create new project\n\n` +
        `<b>🧠 AI-POWERED:</b>\n` +
        `<code>/fix</code> — AI error diagnosis\n` +
        `<code>/review</code> — AI code review\n` +
        `<code>/optimize</code> — Performance suggestions\n` +
        `<code>/chat</code> — Ask Claude anything\n\n` +
        `<b>💰 CLIENT ACQUISITION:</b>\n` +
        `<code>/pitch</code> — Generate sales pitch\n` +
        `<code>/roi</code> — ROI calculator\n` +
        `<code>/proposal</code> — Full proposal\n` +
        `<code>/competitor</code> — Competitor analysis\n\n` +
        `<b>📊 ANALYTICS:</b>\n` +
        `<code>/speed</code> — Core Web Vitals\n` +
        `<code>/seo</code> — SEO audit\n` +
        `<code>/uptime</code> — Uptime check\n\n` +
        `<b>✍️ CONTENT:</b>\n` +
        `<code>/copy</code> — Generate copy\n` +
        `<code>/translate</code> — ES ↔ EN\n` +
        `<code>/image</code> — Image prompts\n\n` +
        `<b>🚀 DEPLOY:</b>\n` +
        `<code>/sites</code> — List projects\n` +
        `<code>/status</code> — Deployment status\n` +
        `<code>/deploy</code> — Deploy to prod\n` +
        `<code>/clone</code> — Clone project\n` +
        `<code>/env-set</code> — Set env var\n` +
        `<code>/domain-add</code> — Add domain\n\n` +
        `💡 <code>/help2</code> for full command list`,
    );
  },

  help2: async (chatId) => {
    await sendMessage(
      chatId,
      `📖 <b>Full Command Reference</b>\n\n` +
        `<b>🔧 CI/CD:</b>\n` +
        `<code>/genesis [project]</code> — Build checks\n` +
        `<code>/audit [project]</code> — Security scan\n` +
        `<code>/demo [project]</code> — Preview deploy\n` +
        `<code>/component [name] [project]</code> — Component\n` +
        `<code>/sofia [project]</code> — Sofia deploy\n\n` +
        `<b>📦 GitHub:</b>\n` +
        `<code>/repos</code> — List repos\n\n` +
        `<b>🚀 Deployment:</b>\n` +
        `<code>/logs [project]</code> — Build logs\n` +
        `<code>/errors [project]</code> — Runtime errors\n` +
        `<code>/rollback [project]</code> — Rollback\n` +
        `<code>/cancel [project]</code> — Cancel build\n` +
        `<code>/preview [project] [branch]</code> — Preview URL\n\n` +
        `<b>📊 Info:</b>\n` +
        `<code>/domains [project]</code> — Domains\n` +
        `<code>/env [project]</code> — Env vars\n` +
        `<code>/ping</code> — Health check`,
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

    // Input validation - prevent injection attacks
    if (!validateBusinessName(businessName)) {
      await sendMessage(
        chatId,
        `❌ Invalid business name: <code>${businessName.slice(0, 50)}</code>\n\n` +
          `Must be 1-100 characters, alphanumeric with spaces and basic punctuation.`,
      );
      return;
    }

    // Validate sector
    const validSectors = [
      "hospitality",
      "restaurant",
      "nightclub",
      "yacht",
      "villa",
      "tour",
      "hotel",
      "spa",
    ];
    if (!validSectors.includes(sector.toLowerCase())) {
      await sendMessage(
        chatId,
        `❌ Invalid sector: <code>${sector}</code>\n\n` +
          `Valid sectors: ${validSectors.join(", ")}`,
      );
      return;
    }

    const success = await triggerWorkflow(
      GITHUB_OWNER,
      BOT_REPO,
      "new-project.yml",
      {
        business_name: businessName,
        sector: sector.toLowerCase(),
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

    // Input validation - prevent injection attacks
    if (!validateProjectName(projectName)) {
      await sendMessage(
        chatId,
        `❌ Invalid project name: <code>${projectName.slice(0, 50)}</code>\n\n` +
          `Must be lowercase, alphanumeric with hyphens, max 100 characters.`,
      );
      return;
    }

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
          `<b>Example:</b> <code>/component HeroSection simmer-down</code>\n\n` +
          `<b>Rules:</b>\n` +
          `• Component: PascalCase (e.g., HeroSection)\n` +
          `• Project: lowercase with hyphens (e.g., simmer-down)`,
      );
      return;
    }

    await sendTyping(chatId);
    const componentName = args[0];
    const projectName = args[1];

    // Input validation - prevent injection attacks
    if (!validateComponentName(componentName)) {
      await sendMessage(
        chatId,
        `❌ Invalid component name: <code>${componentName}</code>\n\n` +
          `Must be PascalCase, alphanumeric, max 50 characters.\n` +
          `Example: <code>HeroSection</code>, <code>ContactForm</code>`,
      );
      return;
    }

    if (!validateProjectName(projectName)) {
      await sendMessage(
        chatId,
        `❌ Invalid project name: <code>${projectName}</code>\n\n` +
          `Must be lowercase, alphanumeric with hyphens, max 100 characters.`,
      );
      return;
    }

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

  // ==================== AI-POWERED COMMANDS ====================

  fix: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔧 <b>AI Fix</b>\n\n` +
          `Analyzes errors and suggests fixes using Claude AI.\n\n` +
          `<b>Usage:</b> <code>/fix [project-name]</code>\n` +
          `<b>Example:</b> <code>/fix simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    await sendMessage(
      chatId,
      `🔍 Analyzing errors for <code>${projectName}</code>...`,
    );

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
      const errorLogs = await getRuntimeLogs(project.id, {
        level: "error",
        limit: 10,
      });
      const buildLogs =
        deployments.length > 0
          ? await getDeploymentLogs(deployments[0].id)
          : [];

      const result = await analyzeAndFix(
        projectName,
        errorLogs.map((l) => l.message),
        buildLogs,
      );

      if (!result.success) {
        await sendMessage(chatId, `❌ ${result.error}`);
        return;
      }

      const fixes = result.fixes?.join("\n\n") || "No specific fix identified";
      const recommendations = result.recommendations?.join("\n") || "";

      await sendMessage(
        chatId,
        `🔧 <b>AI FIX ANALYSIS: ${projectName}</b>\n\n` +
          `<b>Root Cause:</b>\n${result.analysis || "No errors detected"}\n\n` +
          `<b>Fix:</b>\n<pre>${fixes}</pre>\n\n` +
          `${recommendations ? `<b>Prevention:</b>\n${recommendations}` : ""}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  },

  review: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `📝 <b>AI Code Review</b>\n\n` +
          `AI-powered code review with recommendations.\n\n` +
          `<b>Usage:</b> <code>/review [project-name]</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    await sendMessage(
      chatId,
      `📝 Reviewing code for <code>${projectName}</code>...`,
    );

    try {
      const result = await reviewCode(projectName, [], {});

      if (!result.success) {
        await sendMessage(chatId, `❌ ${result.error}`);
        return;
      }

      const recs = result.recommendations.slice(0, 5).join("\n");

      await sendMessage(
        chatId,
        `📝 <b>CODE REVIEW: ${projectName}</b>\n\n` +
          `<b>Recommendations:</b>\n${recs || "No issues found!"}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  },

  optimize: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `⚡ <b>AI Optimize</b>\n\n` +
          `AI-powered performance optimization suggestions.\n\n` +
          `<b>Usage:</b> <code>/optimize [project-name]</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    await sendMessage(
      chatId,
      `⚡ Analyzing performance for <code>${projectName}</code>...`,
    );

    try {
      const result = await optimizeProject(projectName, "{}", {});

      if (!result.success) {
        await sendMessage(chatId, `❌ ${result.error}`);
        return;
      }

      const recs = result.recommendations.slice(0, 5).join("\n");

      await sendMessage(
        chatId,
        `⚡ <b>OPTIMIZATION: ${projectName}</b>\n\n` +
          `<b>Recommendations:</b>\n${recs || "Project is optimized!"}`,
      );
    } catch (error) {
      await sendMessage(
        chatId,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  },

  chat: async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `💬 <b>AI Chat</b>\n\n` +
          `Ask Claude anything about a project.\n\n` +
          `<b>Usage:</b> <code>/chat [project] [question]</code>\n` +
          `<b>Example:</b> <code>/chat simmer-down how do I add authentication?</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    const question = args.slice(1).join(" ");

    const result = await chatAboutProject(projectName, question);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `💬 <b>AI Response</b>\n\n${result.response.slice(0, 3500)}`,
    );
  },

  // ==================== CLIENT ACQUISITION COMMANDS ====================

  roi: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `💰 <b>ROI Calculator</b>\n\n` +
          `Calculate ROI for any sector.\n\n` +
          `<b>Usage:</b> <code>/roi [sector]</code>\n` +
          `<b>Sectors:</b> hotel, restaurant, nightclub, yacht, villa, spa, tour\n\n` +
          `<b>Example:</b> <code>/roi hotel</code>`,
      );
      return;
    }

    const sector = args[0].toLowerCase();
    const roi = calculateROI(sector);
    await sendMessage(chatId, formatROIForTelegram(roi));
  },

  pitch: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🎯 <b>Sales Pitch Generator</b>\n\n` +
          `Generate a compelling sales pitch.\n\n` +
          `<b>Usage:</b> <code>/pitch [business] [sector]</code>\n` +
          `<b>Example:</b> <code>/pitch "Casa San Agustin" hotel</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    const fullText = args.join(" ");
    let businessName: string;
    let sector: string;

    const quotedMatch = fullText.match(/["']([^"']+)["']\s+(\w+)/);
    if (quotedMatch) {
      businessName = quotedMatch[1];
      sector = quotedMatch[2];
    } else {
      sector = args[args.length - 1];
      businessName = args.slice(0, -1).join(" ");
    }

    await sendMessage(
      chatId,
      `🎯 Generating pitch for <code>${businessName}</code>...`,
    );

    const result = await generatePitch(businessName, sector);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(chatId, formatPitchForTelegram(result));
  },

  proposal: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `📋 <b>Proposal Generator</b>\n\n` +
          `Generate a full client proposal.\n\n` +
          `<b>Usage:</b> <code>/proposal [business] [sector]</code>\n` +
          `<b>Example:</b> <code>/proposal "Alquimico" nightclub</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    const fullText = args.join(" ");
    let businessName: string;
    let sector: string;

    const quotedMatch = fullText.match(/["']([^"']+)["']\s+(\w+)/);
    if (quotedMatch) {
      businessName = quotedMatch[1];
      sector = quotedMatch[2];
    } else {
      sector = args[args.length - 1];
      businessName = args.slice(0, -1).join(" ");
    }

    const result = await generateProposal(businessName, sector);
    await sendMessage(chatId, formatProposalForTelegram(result));
  },

  competitor: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔍 <b>Competitor Analysis</b>\n\n` +
          `Analyze competitors for a business.\n\n` +
          `<b>Usage:</b> <code>/competitor [business] [sector]</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    const fullText = args.join(" ");
    let businessName: string;
    let sector: string;

    const quotedMatch = fullText.match(/["']([^"']+)["']\s+(\w+)/);
    if (quotedMatch) {
      businessName = quotedMatch[1];
      sector = quotedMatch[2];
    } else {
      sector = args[args.length - 1];
      businessName = args.slice(0, -1).join(" ");
    }

    await sendMessage(
      chatId,
      `🔍 Analyzing competitors for <code>${businessName}</code>...`,
    );

    const result = await analyzeCompetitors(businessName, sector);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    const competitorList = result.competitors
      .map(
        (c) =>
          `<b>${c.name}</b>\n✅ ${c.strengths.join(", ")}\n❌ ${c.weaknesses.join(", ")}`,
      )
      .join("\n\n");

    const opportunities = result.opportunities.map((o) => `• ${o}`).join("\n");

    await sendMessage(
      chatId,
      `🔍 <b>COMPETITOR ANALYSIS</b>\n\n` +
        `${competitorList || "No competitors found"}\n\n` +
        `<b>Opportunities:</b>\n${opportunities}`,
    );
  },

  // ==================== ANALYTICS COMMANDS ====================

  speed: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `⚡ <b>Speed Test</b>\n\n` +
          `Test Core Web Vitals for any URL.\n\n` +
          `<b>Usage:</b> <code>/speed [url-or-project]</code>\n` +
          `<b>Example:</b> <code>/speed simmer-down</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    let url = args[0];

    if (!url.startsWith("http")) {
      url = `https://${url}.vercel.app`;
    }

    await sendMessage(
      chatId,
      `⚡ Running speed test on <code>${url}</code>...`,
    );

    const result = await runSpeedTest(url);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(chatId, formatSpeedForTelegram(result));
  },

  seo: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🔍 <b>SEO Audit</b>\n\n` +
          `Check SEO for any URL.\n\n` +
          `<b>Usage:</b> <code>/seo [url-or-project]</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    let url = args[0];

    if (!url.startsWith("http")) {
      url = `https://${url}.vercel.app`;
    }

    await sendMessage(chatId, `🔍 Running SEO audit on <code>${url}</code>...`);

    const result = await checkSEO(url);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(chatId, formatSEOForTelegram(result));
  },

  uptime: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `📡 <b>Uptime Check</b>\n\n` +
          `Check if a site is up.\n\n` +
          `<b>Usage:</b> <code>/uptime [url-or-project]</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    let url = args[0];

    if (!url.startsWith("http")) {
      url = `https://${url}.vercel.app`;
    }

    const result = await checkUptime(url);
    await sendMessage(chatId, formatUptimeForTelegram(result));
  },

  // ==================== CONTENT COMMANDS ====================

  copy: async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `✍️ <b>Copy Generator</b>\n\n` +
          `Generate marketing copy.\n\n` +
          `<b>Usage:</b> <code>/copy [business] [section]</code>\n` +
          `<b>Sections:</b> hero, cta, about, contact, services\n\n` +
          `<b>Example:</b> <code>/copy "Casa Hotel" hero</code>`,
      );
      return;
    }

    await sendTyping(chatId);

    const section = args[args.length - 1];
    const businessName = args.slice(0, -1).join(" ").replace(/["']/g, "");

    const result = await generateCopy(businessName, "hospitality", section);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(chatId, formatCopyForTelegram(result));
  },

  translate: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🌐 <b>Translator</b>\n\n` +
          `Translate text between Spanish and English.\n\n` +
          `<b>Usage:</b> <code>/translate [text]</code>\n` +
          `<b>Example:</b> <code>/translate Welcome to our hotel</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const text = args.join(" ");

    // Detect language and translate to opposite
    const isSpanish = /[áéíóúñ¿¡]/i.test(text);
    const targetLang = isSpanish ? "en" : "es";

    const result = await translateText(text, targetLang as "es" | "en");

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(chatId, formatTranslationForTelegram(result));
  },

  image: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `🎨 <b>Image Prompt Generator</b>\n\n` +
          `Generate AI image prompts.\n\n` +
          `<b>Usage:</b> <code>/image [description]</code>\n` +
          `<b>Example:</b> <code>/image luxury hotel lobby at sunset</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const description = args.join(" ");

    const result = await generateImagePrompt(description);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `🎨 <b>IMAGE PROMPT</b>\n\n` +
        `<b>Description:</b> ${description}\n\n` +
        `<b>AI Prompt:</b>\n<pre>${result.prompt}</pre>\n\n` +
        `💡 Use this prompt with DALL-E, Midjourney, or Stable Diffusion`,
    );
  },

  // ==================== ADVANCED DEPLOY COMMANDS ====================

  clone: async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `📋 <b>Clone Project</b>\n\n` +
          `Clone an existing project to a new name.\n\n` +
          `<b>Usage:</b> <code>/clone [source] [new-name]</code>\n` +
          `<b>Example:</b> <code>/clone simmer-down my-new-site</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const source = args[0];
    const newName = args[1];

    await sendMessage(
      chatId,
      `📋 Cloning <code>${source}</code> to <code>${newName}</code>...`,
    );

    const result = await cloneProject(source, newName);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `✅ <b>Project Cloned!</b>\n\n` +
        `📁 Repo: <a href="${result.repoUrl}">${newName}</a>\n\n` +
        `<b>Next steps:</b>\n` +
        `1. Clone the repo locally\n` +
        `2. Copy files from ${source}\n` +
        `3. Push and deploy\n\n` +
        `<code>/deploy ${newName}</code> when ready`,
    );
  },

  "env-set": async (chatId, args) => {
    if (args.length < 3) {
      await sendMessage(
        chatId,
        `🔐 <b>Set Environment Variable</b>\n\n` +
          `Set an env var on a Vercel project.\n\n` +
          `<b>Usage:</b> <code>/env-set [project] [KEY] [value]</code>\n` +
          `<b>Example:</b> <code>/env-set mysite API_KEY sk-123</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    const key = args[1];
    const value = args.slice(2).join(" ");

    const result = await setEnvVar(projectName, key, value);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `✅ <b>Environment Variable Set</b>\n\n` +
        `📦 Project: <code>${projectName}</code>\n` +
        `🔑 Key: <code>${key}</code>\n` +
        `🎯 Targets: production, preview\n\n` +
        `⚠️ Redeploy to apply: <code>/deploy ${projectName}</code>`,
    );
  },

  "domain-add": async (chatId, args) => {
    if (args.length < 2) {
      await sendMessage(
        chatId,
        `🌐 <b>Add Domain</b>\n\n` +
          `Add a custom domain to a project.\n\n` +
          `<b>Usage:</b> <code>/domain-add [project] [domain]</code>\n` +
          `<b>Example:</b> <code>/domain-add mysite example.com</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    const domain = args[1];

    const result = await addDomain(projectName, domain);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `✅ <b>Domain Added</b>\n\n` +
        `📦 Project: <code>${projectName}</code>\n` +
        `🌐 Domain: <code>${domain}</code>\n` +
        `${result.configured ? "✅ Verified" : "⚠️ DNS configuration required"}\n\n` +
        `<b>DNS Records:</b>\n` +
        `A Record: 76.76.21.21\n` +
        `CNAME: cname.vercel-dns.com`,
    );
  },

  preview: async (chatId, args) => {
    if (args.length === 0) {
      await sendMessage(
        chatId,
        `👁️ <b>Preview Branch</b>\n\n` +
          `Get preview URL for a branch.\n\n` +
          `<b>Usage:</b> <code>/preview [project] [branch]</code>\n` +
          `<b>Example:</b> <code>/preview mysite feature-branch</code>`,
      );
      return;
    }

    await sendTyping(chatId);
    const projectName = args[0];
    const branch = args[1] || "main";

    const result = await getPreviewUrl(projectName, branch);

    if (!result.success) {
      await sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    await sendMessage(
      chatId,
      `👁️ <b>Preview URL</b>\n\n` +
        `📦 Project: <code>${projectName}</code>\n` +
        `🌿 Branch: <code>${branch}</code>\n` +
        `🔗 URL: <a href="${result.url}">${result.url}</a>`,
    );
  },
};

// Input validation patterns
const SAFE_PROJECT_NAME = /^[a-z0-9][a-z0-9-]{0,99}$/i;
const SAFE_COMPONENT_NAME = /^[A-Z][A-Za-z0-9]{0,49}$/;
const SAFE_BUSINESS_NAME = /^[A-Za-z0-9 '"áéíóúñÁÉÍÓÚÑüÜ,.\-]{1,100}$/;

export function validateProjectName(name: string): boolean {
  return SAFE_PROJECT_NAME.test(name);
}

export function validateComponentName(name: string): boolean {
  return SAFE_COMPONENT_NAME.test(name);
}

export function validateBusinessName(name: string): boolean {
  return SAFE_BUSINESS_NAME.test(name);
}

export async function handleCommand(
  chatId: number,
  userId: number,
  text: string,
): Promise<void> {
  const authorizedUsers =
    process.env.AUTHORIZED_TELEGRAM_IDS?.split(",")
      .map(Number)
      .filter(Boolean) || [];

  // CRITICAL: Fail closed - if no authorized users configured, deny all
  if (authorizedUsers.length === 0) {
    console.error(
      "AUTHORIZED_TELEGRAM_IDS not configured - denying all access",
    );
    await sendMessage(chatId, "⛔ Bot not configured. Contact administrator.");
    return;
  }

  if (!authorizedUsers.includes(userId)) {
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
