/**
 * CLIENT ACQUISITION ENGINE
 * Sales pitches, ROI calculations, proposals, competitor analysis
 */

import Anthropic from "@anthropic-ai/sdk";
import { BusinessResearch, researchBusiness } from "./research";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

// MachineMind pricing tiers
const PRICING = {
  starter: { monthly: 497, setup: 997, name: "Starter" },
  professional: { monthly: 997, setup: 1997, name: "Professional" },
  enterprise: { monthly: 1997, setup: 4997, name: "Enterprise" },
};

// Average booking values by sector (USD)
const SECTOR_VALUES: Record<
  string,
  { avgBooking: number; monthlyLost: number }
> = {
  hotel: { avgBooking: 250, monthlyLost: 15 },
  restaurant: { avgBooking: 75, monthlyLost: 30 },
  nightclub: { avgBooking: 200, monthlyLost: 20 },
  yacht: { avgBooking: 2500, monthlyLost: 4 },
  villa: { avgBooking: 500, monthlyLost: 8 },
  spa: { avgBooking: 150, monthlyLost: 12 },
  tour: { avgBooking: 100, monthlyLost: 25 },
  hospitality: { avgBooking: 150, monthlyLost: 15 },
};

export interface ROICalculation {
  sector: string;
  avgBookingValue: number;
  monthlyLostBookings: number;
  annualLoss: number;
  machineMineCost: number;
  netROI: number;
  roiMultiple: number;
  paybackMonths: number;
}

export interface PitchResult {
  success: boolean;
  headline: string;
  painPoints: string[];
  solution: string;
  roi: ROICalculation;
  callToAction: string;
  error?: string;
}

export interface ProposalResult {
  success: boolean;
  proposal: {
    executive_summary: string;
    problem_statement: string;
    solution: string;
    deliverables: string[];
    timeline: string;
    investment: {
      setup: number;
      monthly: number;
      tier: string;
    };
    roi: ROICalculation;
    next_steps: string[];
  };
  error?: string;
}

/**
 * Calculate ROI for a business
 */
export function calculateROI(
  sector: string,
  tier: keyof typeof PRICING = "professional",
): ROICalculation {
  const sectorData = SECTOR_VALUES[sector] || SECTOR_VALUES.hospitality;
  const pricing = PRICING[tier];

  const monthlyLoss = sectorData.avgBooking * sectorData.monthlyLost;
  const annualLoss = monthlyLoss * 12;
  const annualCost = pricing.setup + pricing.monthly * 12;
  const netROI = annualLoss - annualCost;
  const roiMultiple = annualLoss / annualCost;
  const paybackMonths = Math.ceil(
    pricing.setup / (monthlyLoss - pricing.monthly),
  );

  return {
    sector,
    avgBookingValue: sectorData.avgBooking,
    monthlyLostBookings: sectorData.monthlyLost,
    annualLoss,
    machineMineCost: annualCost,
    netROI,
    roiMultiple: Math.round(roiMultiple * 10) / 10,
    paybackMonths: Math.max(1, paybackMonths),
  };
}

/**
 * Generate sales pitch for a business
 */
export async function generatePitch(
  businessName: string,
  sector: string,
  research?: BusinessResearch,
): Promise<PitchResult> {
  const roi = calculateROI(sector);

  if (!process.env.ANTHROPIC_API_KEY) {
    // Return template pitch without AI
    return {
      success: true,
      headline: `${businessName}: Stop Losing $${roi.annualLoss.toLocaleString()}/Year to Bad Tech`,
      painPoints: [
        "Losing bookings to competitors with better websites",
        "Manual WhatsApp responses = missed opportunities",
        "No 24/7 availability for international guests",
        "Website doesn't reflect your premium brand",
      ],
      solution: `MachineMind's AI-powered platform captures every booking opportunity with intelligent automation.`,
      roi,
      callToAction: `Schedule a 15-minute demo to see how we recover your lost revenue.`,
    };
  }

  const researchContext = research
    ? `Business Research:\n- Description: ${research.description}\n- Features: ${research.features.join(", ")}\n- Reviews highlight: ${research.reviews.highlights.join(", ")}`
    : "";

  const prompt = `You are a sales expert for MachineMind, an AI automation company for Latin American hospitality.

BUSINESS: ${businessName}
SECTOR: ${sector}
${researchContext}

ROI DATA:
- Average booking: $${roi.avgBookingValue}
- Lost bookings/month: ${roi.monthlyLostBookings}
- Annual loss: $${roi.annualLoss.toLocaleString()}
- MachineMind cost: $${roi.machineMineCost.toLocaleString()}/year
- ROI: ${roi.roiMultiple}x return

Generate a compelling sales pitch in JSON format:
{
  "headline": "Attention-grabbing headline (max 10 words)",
  "painPoints": ["3-4 specific pain points for this sector"],
  "solution": "One paragraph explaining MachineMind's solution",
  "callToAction": "Compelling CTA (one sentence)"
}

Make it specific to ${sector} businesses in Colombia/Latin America. Spanish-speaking audience.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        headline: parsed.headline || `${businessName}: Recover Lost Revenue`,
        painPoints: parsed.painPoints || [],
        solution: parsed.solution || "",
        roi,
        callToAction: parsed.callToAction || "Schedule a demo today",
      };
    }

    return {
      success: true,
      headline: `${businessName}: ${roi.roiMultiple}x ROI with MachineMind`,
      painPoints: [
        "Losing bookings to competitors",
        "Manual processes waste time",
        "No 24/7 availability",
      ],
      solution: text.slice(0, 300),
      roi,
      callToAction: "Schedule your free demo today",
    };
  } catch (error) {
    return {
      success: false,
      headline: "",
      painPoints: [],
      solution: "",
      roi,
      callToAction: "",
      error: error instanceof Error ? error.message : "Pitch generation failed",
    };
  }
}

/**
 * Generate full proposal for a business
 */
export async function generateProposal(
  businessName: string,
  sector: string,
  tier: keyof typeof PRICING = "professional",
): Promise<ProposalResult> {
  const roi = calculateROI(sector, tier);
  const pricing = PRICING[tier];

  const deliverables = {
    starter: [
      "Custom website (5 pages)",
      "WhatsApp integration",
      "Mobile-responsive design",
      "Basic SEO optimization",
      "Contact form",
    ],
    professional: [
      "Custom website (10+ pages)",
      "Sofia AI Concierge (WhatsApp)",
      "Online booking system",
      "Multi-language (ES/EN)",
      "Advanced SEO + Analytics",
      "CRM integration",
    ],
    enterprise: [
      "Unlimited pages",
      "Sofia AI Concierge (WhatsApp + Web)",
      "Full booking engine",
      "Custom integrations",
      "Multi-language (ES/EN/PT)",
      "Dedicated support",
      "White-label option",
    ],
  };

  return {
    success: true,
    proposal: {
      executive_summary: `MachineMind proposes a comprehensive digital transformation for ${businessName}, designed to capture lost revenue and automate guest communications. Based on industry data, ${businessName} is likely losing approximately $${roi.annualLoss.toLocaleString()} annually in missed bookings due to inadequate digital presence and response times.`,
      problem_statement: `${sector} businesses in Colombia face three critical challenges: 1) Competitors with superior digital presence capture bookings, 2) Manual WhatsApp responses create delays that lose customers, 3) No 24/7 availability means missing international guests in different time zones.`,
      solution: `Our ${pricing.name} package includes an AI-powered website with Sofia, our intelligent concierge that handles inquiries 24/7 via WhatsApp. Sofia speaks Spanish and English, understands context, and can process bookings autonomously.`,
      deliverables: deliverables[tier],
      timeline: "4-6 weeks from contract signing to launch",
      investment: {
        setup: pricing.setup,
        monthly: pricing.monthly,
        tier: pricing.name,
      },
      roi,
      next_steps: [
        "15-minute discovery call to understand your specific needs",
        "Custom demo showing Sofia in action for your business",
        "Proposal refinement based on your feedback",
        "Contract signing and project kickoff",
      ],
    },
  };
}

/**
 * Analyze competitors for a business
 */
export async function analyzeCompetitors(
  businessName: string,
  sector: string,
  location: string = "Cartagena",
): Promise<{
  success: boolean;
  competitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  opportunities: string[];
  error?: string;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: true,
      competitors: [
        {
          name: "Competitor A",
          strengths: ["Strong social media", "Good reviews"],
          weaknesses: ["Slow website", "No WhatsApp integration"],
        },
      ],
      opportunities: [
        "24/7 AI concierge differentiator",
        "Faster response times",
        "Better mobile experience",
      ],
    };
  }

  const prompt = `You are a competitive analyst for MachineMind targeting ${sector} businesses in ${location}, Colombia.

BUSINESS: ${businessName}
SECTOR: ${sector}
LOCATION: ${location}

Based on your knowledge of the ${sector} market in ${location}:

1. Identify 2-3 likely competitors (use realistic names for ${location})
2. For each, list strengths and weaknesses in their digital presence
3. Identify opportunities where MachineMind could help ${businessName} differentiate

Return JSON:
{
  "competitors": [
    {"name": "...", "strengths": ["..."], "weaknesses": ["..."]}
  ],
  "opportunities": ["..."]
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        competitors: parsed.competitors || [],
        opportunities: parsed.opportunities || [],
      };
    }

    return {
      success: true,
      competitors: [],
      opportunities: [
        "AI-powered differentiation",
        "24/7 availability",
        "Faster response times",
      ],
    };
  } catch (error) {
    return {
      success: false,
      competitors: [],
      opportunities: [],
      error: error instanceof Error ? error.message : "Analysis failed",
    };
  }
}

/**
 * Format ROI for Telegram display
 */
export function formatROIForTelegram(roi: ROICalculation): string {
  return `💰 <b>ROI Analysis: ${roi.sector.toUpperCase()}</b>

<b>Current Situation:</b>
• Avg booking value: $${roi.avgBookingValue}
• Lost bookings/month: ~${roi.monthlyLostBookings}
• 📉 Annual revenue loss: <b>$${roi.annualLoss.toLocaleString()}</b>

<b>With MachineMind:</b>
• Annual investment: $${roi.machineMineCost.toLocaleString()}
• 📈 Net ROI: <b>$${roi.netROI.toLocaleString()}</b>
• 🚀 Return: <b>${roi.roiMultiple}x</b>
• ⏱️ Payback: ${roi.paybackMonths} months

<i>Based on industry averages for ${roi.sector} in Colombia</i>`;
}

/**
 * Format pitch for Telegram display
 */
export function formatPitchForTelegram(pitch: PitchResult): string {
  const painPointsList = pitch.painPoints.map((p) => `• ${p}`).join("\n");

  return `🎯 <b>${pitch.headline}</b>

<b>Pain Points:</b>
${painPointsList}

<b>Solution:</b>
${pitch.solution}

${formatROIForTelegram(pitch.roi)}

<b>Next Step:</b>
${pitch.callToAction}`;
}

/**
 * Format proposal for Telegram display
 */
export function formatProposalForTelegram(result: ProposalResult): string {
  const p = result.proposal;
  const deliverablesList = p.deliverables
    .slice(0, 5)
    .map((d) => `• ${d}`)
    .join("\n");

  return `📋 <b>PROPOSAL: ${p.investment.tier}</b>

<b>Executive Summary:</b>
${p.executive_summary.slice(0, 200)}...

<b>Deliverables:</b>
${deliverablesList}

<b>Investment:</b>
• Setup: $${p.investment.setup.toLocaleString()}
• Monthly: $${p.investment.monthly.toLocaleString()}

<b>Timeline:</b> ${p.timeline}

<b>ROI:</b> ${p.roi.roiMultiple}x return | Payback in ${p.roi.paybackMonths} months

<b>Next Steps:</b>
${p.next_steps
  .slice(0, 2)
  .map((s) => `• ${s}`)
  .join("\n")}`;
}
