/**
 * Research Agent - Scrapes business information before builds
 * Pulls data from web sources to customize demos and sites
 */

export interface BusinessResearch {
  name: string;
  description: string;
  sector: string;
  location: {
    city: string;
    country: string;
    address?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  hours?: string;
  priceRange?: string;
  features: string[];
  images: string[];
  reviews: {
    rating?: number;
    count?: number;
    highlights: string[];
  };
  competitors: string[];
  brandColors: string[];
  keywords: string[];
  rawData?: string;
}

/**
 * Research a business using Claude to analyze web data
 */
export async function researchBusiness(
  businessName: string,
  sector?: string,
  location?: string,
): Promise<BusinessResearch> {
  const searchQuery = buildSearchQuery(businessName, sector, location);

  // Use Claude to research and structure the data
  const research = await callClaudeResearch(searchQuery, businessName, sector);

  return research;
}

function buildSearchQuery(
  name: string,
  sector?: string,
  location?: string,
): string {
  const parts = [name];
  if (sector) parts.push(sector);
  if (location) parts.push(location);
  return parts.join(" ");
}

async function callClaudeResearch(
  query: string,
  businessName: string,
  sector?: string,
): Promise<BusinessResearch> {
  // Read API key inline - not at module load time
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not configured - using mock research");
    return getMockResearch(businessName, sector);
  }

  const systemPrompt = `You are a business research agent. Your job is to gather comprehensive information about businesses to help build their websites.

Given a business name, search query, and sector, provide structured research data. Be thorough but realistic - if you can't find specific information, make educated guesses based on the sector and location.

Always respond with valid JSON matching this structure:
{
  "name": "Official business name",
  "description": "2-3 sentence description of the business",
  "sector": "hospitality|restaurant|nightclub|hotel|villa|yacht|tour|spa|other",
  "location": {
    "city": "City name",
    "country": "Country",
    "address": "Full address if known"
  },
  "contact": {
    "phone": "+1234567890",
    "email": "contact@business.com",
    "website": "https://business.com"
  },
  "social": {
    "instagram": "@handle",
    "facebook": "page-name",
    "whatsapp": "+1234567890"
  },
  "hours": "Mon-Sun 9AM-10PM",
  "priceRange": "$$$",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "images": ["description of key images to use"],
  "reviews": {
    "rating": 4.5,
    "count": 150,
    "highlights": ["Great service", "Amazing views"]
  },
  "competitors": ["Competitor 1", "Competitor 2"],
  "brandColors": ["#hex1", "#hex2"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const userPrompt = `Research this business for website development:

Business: ${businessName}
Search Query: ${query}
Sector: ${sector || "unknown - please determine"}

Find and structure all available information. For a ${sector || "hospitality"} business, focus on:
- What makes them unique
- Their target audience
- Key services/offerings
- Visual style and brand identity
- Competitive positioning

Return ONLY valid JSON, no markdown or explanations.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error: status", response.status);
      return getMockResearch(businessName, sector);
    }

    interface AnthropicResponse {
      content: Array<{ type: string; text: string }>;
      stop_reason: string;
    }

    const data = (await response.json()) as AnthropicResponse;
    if (!data.content?.[0]?.text) {
      console.error("Unexpected Anthropic API response structure");
      return getMockResearch(businessName, sector);
    }

    const content = data.content[0].text;

    // Parse JSON from response with defensive handling
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<BusinessResearch>;
      // Merge with defaults to ensure all fields exist
      const research: BusinessResearch = {
        name: parsed.name ?? businessName,
        description: parsed.description ?? "",
        sector: parsed.sector ?? sector ?? "hospitality",
        location: parsed.location ?? { city: "Cartagena", country: "Colombia" },
        contact: parsed.contact ?? {},
        social: parsed.social ?? {},
        features: parsed.features ?? [],
        images: parsed.images ?? [],
        reviews: { highlights: [], ...parsed.reviews },
        competitors: parsed.competitors ?? [],
        brandColors: parsed.brandColors ?? [],
        keywords: parsed.keywords ?? [],
        priceRange: parsed.priceRange,
        hours: parsed.hours,
        rawData: content,
      };
      return research;
    }

    return getMockResearch(businessName, sector);
  } catch (error) {
    console.error("Research error:", error);
    return getMockResearch(businessName, sector);
  }
}

/**
 * Fallback mock research when API unavailable
 */
function getMockResearch(name: string, sector?: string): BusinessResearch {
  const sectorDefaults: Record<string, Partial<BusinessResearch>> = {
    restaurant: {
      features: [
        "Fine Dining",
        "Private Events",
        "Outdoor Seating",
        "Full Bar",
      ],
      priceRange: "$$$",
      keywords: ["dining", "cuisine", "restaurant", "food", "chef"],
      brandColors: ["#1a1a2e", "#d4af37", "#ffffff"],
    },
    hotel: {
      features: ["Luxury Suites", "Spa", "Pool", "Concierge", "Room Service"],
      priceRange: "$$$$",
      keywords: ["hotel", "accommodation", "luxury", "stay", "resort"],
      brandColors: ["#0f0f1a", "#d4af37", "#ffffff"],
    },
    nightclub: {
      features: ["VIP Tables", "World-Class DJs", "Premium Bottles", "Events"],
      priceRange: "$$$$",
      keywords: ["nightlife", "club", "party", "VIP", "entertainment"],
      brandColors: ["#0a0a0a", "#ff00ff", "#00ffff"],
    },
    yacht: {
      features: [
        "Private Charters",
        "Crew Service",
        "Gourmet Catering",
        "Water Sports",
      ],
      priceRange: "$$$$",
      keywords: ["yacht", "charter", "sailing", "luxury", "ocean"],
      brandColors: ["#0a192f", "#64ffda", "#ffffff"],
    },
    villa: {
      features: [
        "Private Pool",
        "Chef Service",
        "Concierge",
        "Ocean Views",
        "Staff",
      ],
      priceRange: "$$$$",
      keywords: ["villa", "vacation", "rental", "luxury", "private"],
      brandColors: ["#2d3436", "#dfe6e9", "#d4af37"],
    },
    spa: {
      features: [
        "Massage Therapy",
        "Facials",
        "Wellness Programs",
        "Sauna",
        "Pool",
      ],
      priceRange: "$$$",
      keywords: ["spa", "wellness", "relaxation", "massage", "beauty"],
      brandColors: ["#f5f5f5", "#7f8c8d", "#27ae60"],
    },
    tour: {
      features: [
        "Guided Tours",
        "Private Groups",
        "Local Experts",
        "Transportation",
      ],
      priceRange: "$$",
      keywords: ["tour", "experience", "adventure", "guide", "explore"],
      brandColors: ["#2c3e50", "#e74c3c", "#f39c12"],
    },
    hospitality: {
      features: [
        "Premium Service",
        "Exclusive Access",
        "Personalized Experience",
      ],
      priceRange: "$$$",
      keywords: ["luxury", "service", "exclusive", "premium", "hospitality"],
      brandColors: ["#0f0f1a", "#d4af37", "#ffffff"],
    },
  };

  const defaults =
    sectorDefaults[sector || "hospitality"] || sectorDefaults.hospitality;

  return {
    name,
    description: `${name} is a premier ${sector || "hospitality"} establishment offering exceptional experiences and world-class service.`,
    sector: sector || "hospitality",
    location: {
      city: "Cartagena",
      country: "Colombia",
    },
    contact: {},
    social: {},
    features: defaults.features || [],
    images: ["Hero image", "Interior shot", "Signature experience", "Team"],
    reviews: {
      rating: 4.8,
      count: 127,
      highlights: ["Exceptional service", "Unforgettable experience"],
    },
    competitors: [],
    brandColors: defaults.brandColors || ["#0f0f1a", "#d4af37", "#ffffff"],
    keywords: defaults.keywords || [],
    priceRange: defaults.priceRange,
  };
}

/**
 * Format research for Telegram display
 */
export function formatResearchForTelegram(research: BusinessResearch): string {
  let msg = `🔍 <b>Research: ${research.name}</b>\n\n`;

  msg += `📝 ${research.description}\n\n`;

  msg += `<b>📍 Location:</b> ${research.location.city}, ${research.location.country}\n`;
  if (research.location.address) {
    msg += `   ${research.location.address}\n`;
  }

  msg += `\n<b>🏷️ Sector:</b> ${research.sector}\n`;
  if (research.priceRange) {
    msg += `<b>💰 Price:</b> ${research.priceRange}\n`;
  }

  if (research.features.length > 0) {
    msg += `\n<b>✨ Features:</b>\n`;
    research.features.slice(0, 5).forEach((f) => {
      msg += `  • ${f}\n`;
    });
  }

  if (research.contact.website || research.contact.phone) {
    msg += `\n<b>📞 Contact:</b>\n`;
    if (research.contact.website) msg += `  🌐 ${research.contact.website}\n`;
    if (research.contact.phone) msg += `  📱 ${research.contact.phone}\n`;
    if (research.contact.email) msg += `  ✉️ ${research.contact.email}\n`;
  }

  if (Object.values(research.social).some(Boolean)) {
    msg += `\n<b>📱 Social:</b>\n`;
    if (research.social.instagram)
      msg += `  IG: ${research.social.instagram}\n`;
    if (research.social.facebook) msg += `  FB: ${research.social.facebook}\n`;
    if (research.social.whatsapp) msg += `  WA: ${research.social.whatsapp}\n`;
  }

  if (research.reviews.rating) {
    msg += `\n<b>⭐ Reviews:</b> ${research.reviews.rating}/5 (${research.reviews.count || 0} reviews)\n`;
    if (research.reviews.highlights.length > 0) {
      msg += `  "${research.reviews.highlights[0]}"\n`;
    }
  }

  if (research.brandColors.length > 0) {
    msg += `\n<b>🎨 Brand Colors:</b> ${research.brandColors.join(", ")}\n`;
  }

  if (research.keywords.length > 0) {
    msg += `\n<b>🔑 Keywords:</b> ${research.keywords.slice(0, 6).join(", ")}\n`;
  }

  return msg;
}

/**
 * Convert research to build config for templates
 */
export function researchToBuildConfig(
  research: BusinessResearch,
): Record<string, string> {
  return {
    BUSINESS_NAME: research.name,
    BUSINESS_DESCRIPTION: research.description,
    BUSINESS_SECTOR: research.sector,
    BUSINESS_CITY: research.location.city,
    BUSINESS_COUNTRY: research.location.country,
    BUSINESS_ADDRESS: research.location.address || "",
    BUSINESS_PHONE: research.contact.phone || "",
    BUSINESS_EMAIL: research.contact.email || "",
    BUSINESS_WEBSITE: research.contact.website || "",
    BUSINESS_INSTAGRAM: research.social.instagram || "",
    BUSINESS_FACEBOOK: research.social.facebook || "",
    BUSINESS_WHATSAPP: research.social.whatsapp || "",
    BUSINESS_HOURS: research.hours || "",
    BUSINESS_PRICE_RANGE: research.priceRange || "",
    BUSINESS_FEATURES: research.features.join("|"),
    BUSINESS_KEYWORDS: research.keywords.join("|"),
    BRAND_PRIMARY: research.brandColors[0] || "#0f0f1a",
    BRAND_ACCENT: research.brandColors[1] || "#d4af37",
    BRAND_TEXT: research.brandColors[2] || "#ffffff",
    REVIEW_RATING: String(research.reviews.rating || 0),
    REVIEW_COUNT: String(research.reviews.count || 0),
  };
}
