/**
 * AI-POWERED OPERATIONS
 * Uses Claude API for intelligent project analysis and fixes
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

export interface AIAnalysisResult {
  success: boolean;
  analysis: string;
  recommendations: string[];
  fixes?: string[];
  error?: string;
}

/**
 * Analyze and suggest fixes for project errors
 */
export async function analyzeAndFix(
  projectName: string,
  errorLogs: string[],
  buildLogs: string[],
): Promise<AIAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error: "ANTHROPIC_API_KEY not configured",
    };
  }

  const prompt = `You are an expert Next.js/TypeScript debugger for MachineMind hospitality projects.

PROJECT: ${projectName}

ERROR LOGS:
${errorLogs.slice(0, 20).join("\n") || "No errors found"}

BUILD LOGS (last 30 lines):
${buildLogs.slice(-30).join("\n") || "No build logs available"}

Analyze these logs and provide:
1. ROOT CAUSE: What's causing the issue (1-2 sentences)
2. FIX: Exact code or command to fix it
3. PREVENTION: How to prevent this in the future

Be concise and actionable. Focus on the most critical issue first.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    // Parse response into sections
    const rootCause =
      text.match(/ROOT CAUSE:([^]*?)(?=FIX:|$)/i)?.[1]?.trim() || "";
    const fix = text.match(/FIX:([^]*?)(?=PREVENTION:|$)/i)?.[1]?.trim() || "";
    const prevention = text.match(/PREVENTION:([^]*?)$/i)?.[1]?.trim() || "";

    return {
      success: true,
      analysis: rootCause,
      recommendations: [prevention].filter(Boolean),
      fixes: [fix].filter(Boolean),
    };
  } catch (error) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error: error instanceof Error ? error.message : "AI analysis failed",
    };
  }
}

/**
 * AI Code Review for a project
 */
export async function reviewCode(
  projectName: string,
  recentCommits: string[],
  fileContents: Record<string, string>,
): Promise<AIAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error: "ANTHROPIC_API_KEY not configured",
    };
  }

  const filesPreview = Object.entries(fileContents)
    .slice(0, 5)
    .map(([name, content]) => `--- ${name} ---\n${content.slice(0, 500)}...`)
    .join("\n\n");

  const prompt = `You are a senior code reviewer for MachineMind hospitality projects (Next.js, TypeScript, Tailwind, Supabase).

PROJECT: ${projectName}

RECENT COMMITS:
${recentCommits.slice(0, 5).join("\n") || "No recent commits"}

CODE SAMPLES:
${filesPreview || "No code available"}

Review this code for:
1. SECURITY: Any vulnerabilities (XSS, injection, exposed secrets)?
2. PERFORMANCE: Any obvious performance issues?
3. ZDBS COMPLIANCE: Missing error handling, loading states, TypeScript issues?
4. BEST PRACTICES: Code quality improvements?

Provide 3-5 actionable recommendations, prioritized by impact.
Format: "🔴 CRITICAL:", "🟡 IMPORTANT:", or "🟢 SUGGESTION:"`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    // Extract recommendations
    const recommendations = text
      .split("\n")
      .filter((line: string) => line.match(/^(🔴|🟡|🟢)/))
      .slice(0, 5);

    return {
      success: true,
      analysis: text,
      recommendations,
    };
  } catch (error) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error: error instanceof Error ? error.message : "Code review failed",
    };
  }
}

/**
 * AI Performance Optimization suggestions
 */
export async function optimizeProject(
  projectName: string,
  packageJson: string,
  configFiles: Record<string, string>,
): Promise<AIAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error: "ANTHROPIC_API_KEY not configured",
    };
  }

  const configs = Object.entries(configFiles)
    .map(([name, content]) => `--- ${name} ---\n${content}`)
    .join("\n\n");

  const prompt = `You are a Next.js performance optimization expert.

PROJECT: ${projectName}

PACKAGE.JSON:
${packageJson}

CONFIG FILES:
${configs || "No config files"}

Analyze and provide optimization recommendations for:
1. BUNDLE SIZE: Unnecessary dependencies, tree-shaking opportunities
2. LOADING SPEED: Image optimization, lazy loading, code splitting
3. CORE WEB VITALS: LCP, FID, CLS improvements
4. CACHING: CDN, static generation, ISR opportunities

Provide 5 specific, actionable optimizations with expected impact.
Format each as: "⚡ [IMPACT: HIGH/MED/LOW] Description"`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    const recommendations = text
      .split("\n")
      .filter((line: string) => line.includes("⚡"))
      .slice(0, 5);

    return {
      success: true,
      analysis: text,
      recommendations,
    };
  } catch (error) {
    return {
      success: false,
      analysis: "",
      recommendations: [],
      error:
        error instanceof Error ? error.message : "Optimization analysis failed",
    };
  }
}

/**
 * Chat with Claude about any project
 */
export async function chatAboutProject(
  projectName: string,
  question: string,
  context?: string,
): Promise<{ success: boolean; response: string; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      response: "",
      error: "ANTHROPIC_API_KEY not configured",
    };
  }

  const prompt = `You are MachineMind's AI assistant, expert in Next.js hospitality projects.

PROJECT: ${projectName}
${context ? `\nCONTEXT:\n${context}` : ""}

USER QUESTION: ${question}

Provide a helpful, concise answer. If you need more context, say what information would help.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    return {
      success: true,
      response: text,
    };
  } catch (error) {
    return {
      success: false,
      response: "",
      error: error instanceof Error ? error.message : "Chat failed",
    };
  }
}
