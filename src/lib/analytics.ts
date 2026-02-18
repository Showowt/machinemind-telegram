/**
 * ANALYTICS & PERFORMANCE
 * Speed tests, SEO analysis, uptime monitoring
 */

export interface SpeedTestResult {
  success: boolean;
  url: string;
  metrics: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte (ms)
    fcp: number; // First Contentful Paint (ms)
  };
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  recommendations: string[];
  error?: string;
}

export interface SEOResult {
  success: boolean;
  url: string;
  score: number;
  checks: {
    title: { present: boolean; length: number; optimal: boolean };
    description: { present: boolean; length: number; optimal: boolean };
    h1: { present: boolean; count: number };
    images: { total: number; withAlt: number };
    https: boolean;
    mobile: boolean;
    openGraph: boolean;
    structuredData: boolean;
  };
  recommendations: string[];
  error?: string;
}

export interface UptimeResult {
  success: boolean;
  url: string;
  status: "up" | "down" | "degraded";
  responseTime: number;
  statusCode: number;
  lastChecked: string;
  error?: string;
}

/**
 * Run speed test on a URL using PageSpeed Insights API
 */
export async function runSpeedTest(url: string): Promise<SpeedTestResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  // If no API key, do a basic HTTP timing test
  if (!apiKey) {
    return await runBasicSpeedTest(url);
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile`;

    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(60000), // 60s timeout for PageSpeed
    });

    if (!response.ok) {
      return await runBasicSpeedTest(url);
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    const metrics = lighthouse?.audits;

    return {
      success: true,
      url,
      metrics: {
        lcp: Math.round(
          metrics?.["largest-contentful-paint"]?.numericValue || 0,
        ),
        fid: Math.round(metrics?.["max-potential-fid"]?.numericValue || 0),
        cls:
          Math.round(
            (metrics?.["cumulative-layout-shift"]?.numericValue || 0) * 1000,
          ) / 1000,
        ttfb: Math.round(metrics?.["server-response-time"]?.numericValue || 0),
        fcp: Math.round(metrics?.["first-contentful-paint"]?.numericValue || 0),
      },
      scores: {
        performance: Math.round(
          (lighthouse?.categories?.performance?.score || 0) * 100,
        ),
        accessibility: Math.round(
          (lighthouse?.categories?.accessibility?.score || 0) * 100,
        ),
        bestPractices: Math.round(
          (lighthouse?.categories?.["best-practices"]?.score || 0) * 100,
        ),
        seo: Math.round((lighthouse?.categories?.seo?.score || 0) * 100),
      },
      recommendations: extractRecommendations(lighthouse?.audits),
    };
  } catch (error) {
    return await runBasicSpeedTest(url);
  }
}

/**
 * Basic speed test without API
 */
async function runBasicSpeedTest(url: string): Promise<SpeedTestResult> {
  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });
    const ttfb = Date.now() - start;

    await response.text();
    const totalTime = Date.now() - start;

    // Estimate scores based on timing
    const perfScore = Math.max(0, Math.min(100, 100 - totalTime / 50));

    return {
      success: true,
      url,
      metrics: {
        lcp: totalTime,
        fid: 0,
        cls: 0,
        ttfb,
        fcp: ttfb + 100,
      },
      scores: {
        performance: Math.round(perfScore),
        accessibility: 0, // Can't measure without full audit
        bestPractices: 0,
        seo: 0,
      },
      recommendations: [
        ttfb > 600
          ? "⚠️ TTFB > 600ms - consider CDN or server optimization"
          : "✅ Good TTFB",
        totalTime > 3000
          ? "⚠️ Total load > 3s - optimize resources"
          : "✅ Good load time",
        "💡 Add GOOGLE_PAGESPEED_API_KEY for full Lighthouse audit",
      ],
    };
  } catch (error) {
    return {
      success: false,
      url,
      metrics: { lcp: 0, fid: 0, cls: 0, ttfb: 0, fcp: 0 },
      scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
      recommendations: [],
      error: error instanceof Error ? error.message : "Speed test failed",
    };
  }
}

/**
 * Extract top recommendations from Lighthouse audit
 */
function extractRecommendations(
  audits: Record<string, { score: number; title: string }> | undefined,
): string[] {
  if (!audits) return [];

  const failed = Object.entries(audits)
    .filter(([_, audit]) => audit.score !== null && audit.score < 0.9)
    .sort((a, b) => (a[1].score || 0) - (b[1].score || 0))
    .slice(0, 5)
    .map(([_, audit]) => `• ${audit.title}`);

  return failed;
}

/**
 * Basic SEO check by fetching and analyzing the page
 */
export async function checkSEO(url: string): Promise<SEOResult> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "MachineMind-SEO-Checker/1.0",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        url,
        score: 0,
        checks: {
          title: { present: false, length: 0, optimal: false },
          description: { present: false, length: 0, optimal: false },
          h1: { present: false, count: 0 },
          images: { total: 0, withAlt: 0 },
          https: url.startsWith("https"),
          mobile: false,
          openGraph: false,
          structuredData: false,
        },
        recommendations: [],
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    // Parse HTML for SEO elements
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );
    const description = descMatch ? descMatch[1].trim() : "";

    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];

    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imgWithAlt = imgMatches.filter((img) =>
      /alt=["'][^"']+["']/.test(img),
    ).length;

    const hasOG = /<meta[^>]*property=["']og:/i.test(html);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    const hasStructuredData =
      /<script[^>]*type=["']application\/ld\+json["']/i.test(html);

    const checks = {
      title: {
        present: !!title,
        length: title.length,
        optimal: title.length >= 30 && title.length <= 60,
      },
      description: {
        present: !!description,
        length: description.length,
        optimal: description.length >= 120 && description.length <= 160,
      },
      h1: {
        present: h1Matches.length > 0,
        count: h1Matches.length,
      },
      images: {
        total: imgMatches.length,
        withAlt: imgWithAlt,
      },
      https: url.startsWith("https"),
      mobile: hasViewport,
      openGraph: hasOG,
      structuredData: hasStructuredData,
    };

    // Calculate score
    let score = 0;
    if (checks.title.present) score += 15;
    if (checks.title.optimal) score += 5;
    if (checks.description.present) score += 15;
    if (checks.description.optimal) score += 5;
    if (checks.h1.present && checks.h1.count === 1) score += 10;
    if (
      checks.images.total === 0 ||
      checks.images.withAlt === checks.images.total
    )
      score += 10;
    if (checks.https) score += 15;
    if (checks.mobile) score += 10;
    if (checks.openGraph) score += 10;
    if (checks.structuredData) score += 5;

    const recommendations: string[] = [];
    if (!checks.title.present) recommendations.push("❌ Add a <title> tag");
    else if (!checks.title.optimal)
      recommendations.push("⚠️ Title should be 30-60 characters");
    if (!checks.description.present)
      recommendations.push("❌ Add a meta description");
    else if (!checks.description.optimal)
      recommendations.push("⚠️ Description should be 120-160 characters");
    if (!checks.h1.present) recommendations.push("❌ Add an <h1> heading");
    else if (checks.h1.count > 1)
      recommendations.push("⚠️ Use only one <h1> per page");
    if (
      checks.images.total > 0 &&
      checks.images.withAlt < checks.images.total
    ) {
      recommendations.push(
        `⚠️ ${checks.images.total - checks.images.withAlt} images missing alt text`,
      );
    }
    if (!checks.https) recommendations.push("❌ Enable HTTPS");
    if (!checks.mobile)
      recommendations.push("❌ Add viewport meta tag for mobile");
    if (!checks.openGraph)
      recommendations.push("💡 Add Open Graph tags for social sharing");
    if (!checks.structuredData)
      recommendations.push("💡 Add JSON-LD structured data");

    return {
      success: true,
      url,
      score,
      checks,
      recommendations: recommendations.slice(0, 5),
    };
  } catch (error) {
    return {
      success: false,
      url,
      score: 0,
      checks: {
        title: { present: false, length: 0, optimal: false },
        description: { present: false, length: 0, optimal: false },
        h1: { present: false, count: 0 },
        images: { total: 0, withAlt: 0 },
        https: false,
        mobile: false,
        openGraph: false,
        structuredData: false,
      },
      recommendations: [],
      error: error instanceof Error ? error.message : "SEO check failed",
    };
  }
}

/**
 * Check if a URL is up and responding
 */
export async function checkUptime(url: string): Promise<UptimeResult> {
  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    const responseTime = Date.now() - start;

    let status: "up" | "down" | "degraded" = "up";
    if (!response.ok) {
      status = "down";
    } else if (responseTime > 2000) {
      status = "degraded";
    }

    return {
      success: true,
      url,
      status,
      responseTime,
      statusCode: response.status,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: true,
      url,
      status: "down",
      responseTime: 0,
      statusCode: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Format speed test results for Telegram
 */
export function formatSpeedForTelegram(result: SpeedTestResult): string {
  const getEmoji = (score: number) => {
    if (score >= 90) return "🟢";
    if (score >= 50) return "🟡";
    return "🔴";
  };

  const lcpEmoji =
    result.metrics.lcp < 2500 ? "🟢" : result.metrics.lcp < 4000 ? "🟡" : "🔴";
  const clsEmoji =
    result.metrics.cls < 0.1 ? "🟢" : result.metrics.cls < 0.25 ? "🟡" : "🔴";

  const recs = result.recommendations.slice(0, 3).join("\n");

  return `⚡ <b>SPEED TEST: ${result.url}</b>

<b>Core Web Vitals:</b>
${lcpEmoji} LCP: ${result.metrics.lcp}ms ${result.metrics.lcp < 2500 ? "(Good)" : "(Needs work)"}
${clsEmoji} CLS: ${result.metrics.cls} ${result.metrics.cls < 0.1 ? "(Good)" : "(Needs work)"}
🕐 TTFB: ${result.metrics.ttfb}ms
🎨 FCP: ${result.metrics.fcp}ms

<b>Scores:</b>
${getEmoji(result.scores.performance)} Performance: ${result.scores.performance}/100
${getEmoji(result.scores.accessibility)} Accessibility: ${result.scores.accessibility}/100
${getEmoji(result.scores.seo)} SEO: ${result.scores.seo}/100

${recs ? `<b>Recommendations:</b>\n${recs}` : ""}`;
}

/**
 * Format SEO results for Telegram
 */
export function formatSEOForTelegram(result: SEOResult): string {
  const scoreEmoji =
    result.score >= 80 ? "🟢" : result.score >= 50 ? "🟡" : "🔴";

  const checks = [
    result.checks.title.present ? "✅ Title" : "❌ Title",
    result.checks.description.present ? "✅ Description" : "❌ Description",
    result.checks.h1.present ? "✅ H1" : "❌ H1",
    result.checks.https ? "✅ HTTPS" : "❌ HTTPS",
    result.checks.mobile ? "✅ Mobile" : "❌ Mobile",
    result.checks.openGraph ? "✅ Open Graph" : "❌ Open Graph",
  ].join(" | ");

  const recs = result.recommendations.slice(0, 4).join("\n");

  return `🔍 <b>SEO AUDIT: ${result.url}</b>

${scoreEmoji} <b>Score: ${result.score}/100</b>

<b>Checks:</b>
${checks}

<b>Images:</b> ${result.checks.images.withAlt}/${result.checks.images.total} with alt text

${recs ? `<b>Recommendations:</b>\n${recs}` : "✅ All checks passed!"}`;
}

/**
 * Format uptime results for Telegram
 */
export function formatUptimeForTelegram(result: UptimeResult): string {
  const statusEmoji = {
    up: "🟢",
    degraded: "🟡",
    down: "🔴",
  };

  return `📡 <b>UPTIME CHECK</b>

${statusEmoji[result.status]} Status: <b>${result.status.toUpperCase()}</b>
🌐 URL: ${result.url}
⏱️ Response: ${result.responseTime}ms
📊 HTTP: ${result.statusCode || "N/A"}
🕐 Checked: ${new Date(result.lastChecked).toLocaleTimeString()}

${result.error ? `⚠️ ${result.error}` : ""}`;
}
