/**
 * CONTENT GENERATION ENGINE
 * Copy writing, translation, image generation
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

export interface CopyResult {
  success: boolean;
  section: string;
  spanish: string;
  english: string;
  error?: string;
}

export interface TranslationResult {
  success: boolean;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  error?: string;
}

// Copy templates by section
const COPY_TEMPLATES: Record<string, { spanish: string; english: string }> = {
  hero: {
    spanish: "Experiencias Excepcionales, Cada Momento",
    english: "Exceptional Experiences, Every Moment",
  },
  cta: {
    spanish: "Reservar Ahora",
    english: "Book Now",
  },
  about: {
    spanish: "Comprometidos con la excelencia en cada detalle",
    english: "Committed to excellence in every detail",
  },
  contact: {
    spanish: "Contáctenos para una experiencia personalizada",
    english: "Contact us for a personalized experience",
  },
  services: {
    spanish: "Nuestros Servicios Premium",
    english: "Our Premium Services",
  },
};

/**
 * Generate marketing copy for a specific section
 */
export async function generateCopy(
  businessName: string,
  sector: string,
  section: string,
): Promise<CopyResult> {
  // Use template if no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    const template = COPY_TEMPLATES[section] || COPY_TEMPLATES.hero;
    return {
      success: true,
      section,
      spanish: template.spanish.replace("Excepcionales", businessName),
      english: template.english.replace("Exceptional", businessName),
    };
  }

  const prompt = `You are a luxury hospitality copywriter for MachineMind.

BUSINESS: ${businessName}
SECTOR: ${sector}
SECTION: ${section}

Write compelling marketing copy for the "${section}" section of a luxury ${sector} website.

Requirements:
- Evoke luxury, exclusivity, sophistication
- Action-oriented language
- Specific to ${sector} industry
- Maximum 2 sentences for headlines, 3-4 for body copy

Return JSON:
{
  "spanish": "Copy in Spanish (Colombian Spanish, formal but warm)",
  "english": "Copy in English"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        section,
        spanish: parsed.spanish || "",
        english: parsed.english || "",
      };
    }

    return {
      success: true,
      section,
      spanish: text.slice(0, 200),
      english: "",
    };
  } catch (error) {
    return {
      success: false,
      section,
      spanish: "",
      english: "",
      error: error instanceof Error ? error.message : "Copy generation failed",
    };
  }
}

/**
 * Translate text between Spanish and English
 */
export async function translateText(
  text: string,
  targetLang: "es" | "en" = "es",
): Promise<TranslationResult> {
  const fromLang = targetLang === "es" ? "English" : "Spanish";
  const toLang = targetLang === "es" ? "Spanish" : "English";

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      original: text,
      translated: "",
      fromLang,
      toLang,
      error: "ANTHROPIC_API_KEY not configured",
    };
  }

  const prompt = `Translate the following text from ${fromLang} to ${toLang}.

For Spanish: Use Colombian Spanish, formal but warm tone, appropriate for luxury hospitality.
For English: Use American English, sophisticated tone.

TEXT:
${text}

Return ONLY the translated text, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const translated = content.type === "text" ? content.text.trim() : "";

    return {
      success: true,
      original: text,
      translated,
      fromLang,
      toLang,
    };
  } catch (error) {
    return {
      success: false,
      original: text,
      translated: "",
      fromLang,
      toLang,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

/**
 * Generate image prompt for AI image generation
 * (Returns prompt that can be used with DALL-E, Midjourney, etc.)
 */
export async function generateImagePrompt(
  description: string,
  style: "luxury" | "modern" | "minimal" = "luxury",
): Promise<{ success: boolean; prompt: string; error?: string }> {
  const styleGuides = {
    luxury:
      "elegant, sophisticated, gold accents, dark moody lighting, high-end hospitality, professional photography",
    modern:
      "clean lines, minimalist, bright, contemporary design, sleek, tech-forward",
    minimal: "simple, white space, subtle, refined, understated elegance",
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: true,
      prompt: `${description}, ${styleGuides[style]}, 8k, professional photography`,
    };
  }

  const prompt = `Generate a detailed image prompt for AI image generation (DALL-E/Midjourney style).

DESCRIPTION: ${description}
STYLE: ${style} (${styleGuides[style]})

Create a detailed prompt that will generate a stunning image for a luxury hospitality website.
Include: lighting, mood, composition, camera angle, quality descriptors.

Return ONLY the image prompt, nothing else. Maximum 100 words.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const imagePrompt = content.type === "text" ? content.text.trim() : "";

    return {
      success: true,
      prompt: imagePrompt,
    };
  } catch (error) {
    return {
      success: false,
      prompt: "",
      error:
        error instanceof Error ? error.message : "Prompt generation failed",
    };
  }
}

/**
 * Generate full i18n strings for a project
 */
export async function generateI18nStrings(
  businessName: string,
  sector: string,
): Promise<{
  success: boolean;
  strings: {
    es: Record<string, string>;
    en: Record<string, string>;
  };
  error?: string;
}> {
  const baseStrings = {
    es: {
      "nav.home": "Inicio",
      "nav.services": "Servicios",
      "nav.about": "Nosotros",
      "nav.contact": "Contacto",
      "nav.book": "Reservar",
      "hero.title": `Bienvenido a ${businessName}`,
      "hero.subtitle": "Experiencias excepcionales que perduran",
      "cta.primary": "Reservar Ahora",
      "cta.secondary": "Explorar",
      "cta.whatsapp": "WhatsApp",
      "footer.rights": "Todos los derechos reservados",
      "footer.privacy": "Privacidad",
      "footer.terms": "Términos",
    },
    en: {
      "nav.home": "Home",
      "nav.services": "Services",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.book": "Book",
      "hero.title": `Welcome to ${businessName}`,
      "hero.subtitle": "Exceptional experiences that last",
      "cta.primary": "Book Now",
      "cta.secondary": "Explore",
      "cta.whatsapp": "WhatsApp",
      "footer.rights": "All rights reserved",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms",
    },
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: true,
      strings: baseStrings,
    };
  }

  // Enhance with AI-generated sector-specific strings
  const prompt = `Generate i18n strings for a ${sector} website called "${businessName}".

Add 5 more key-value pairs specific to ${sector} businesses (e.g., menu items for restaurants, room types for hotels).

Return JSON with "es" and "en" objects containing the additional strings only.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const additional = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        strings: {
          es: { ...baseStrings.es, ...(additional.es || {}) },
          en: { ...baseStrings.en, ...(additional.en || {}) },
        },
      };
    }

    return { success: true, strings: baseStrings };
  } catch (error) {
    return {
      success: false,
      strings: baseStrings,
      error: error instanceof Error ? error.message : "i18n generation failed",
    };
  }
}

/**
 * Format copy result for Telegram
 */
export function formatCopyForTelegram(result: CopyResult): string {
  return `✍️ <b>COPY: ${result.section.toUpperCase()}</b>

<b>🇪🇸 Spanish:</b>
${result.spanish}

<b>🇺🇸 English:</b>
${result.english}`;
}

/**
 * Format translation for Telegram
 */
export function formatTranslationForTelegram(
  result: TranslationResult,
): string {
  return `🌐 <b>TRANSLATION</b>

<b>${result.fromLang}:</b>
${result.original}

<b>${result.toLang}:</b>
${result.translated}`;
}
