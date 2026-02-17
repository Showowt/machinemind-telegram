/**
 * GENESIS ENGINE - The Build Intelligence System
 * Embeds PROMETHEUS v2, APEX v6, BCB-OS into every build
 *
 * Every project created through this system is a masterpiece because:
 * 1. Research Agent scrapes real business context
 * 2. Architecture patterns from APEX/PROMETHEUS inform structure
 * 3. Build Memory learns from every past build
 * 4. Sector-specific templates evolve over time
 */

import { BusinessResearch } from "./research";

// ============================================================================
// ARCHITECTURE PATTERNS - The DNA of every build
// ============================================================================

export const APEX_LAYERS = {
  layer1_foundation: {
    name: "Foundation Layer",
    description: "Core identity and operational parameters",
    implementation: `
      - TypeScript strict mode, no any types
      - Server Components by default, Client only for interactivity
      - Supabase for auth + database with RLS on every table
      - Tailwind for styling with luxury aesthetic defaults
    `,
  },
  layer2_cognition: {
    name: "Cognitive Enhancement",
    description: "Self-modeling and metacognitive capabilities",
    implementation: `
      - Error boundaries on every page
      - Loading and error states on all async components
      - Structured logging for debugging
      - Performance monitoring hooks
    `,
  },
  layer3_emergence: {
    name: "Emergence Layer",
    description: "Conditions for novel functionality to arise",
    implementation: `
      - Modular component architecture
      - Plugin-ready service layer
      - Event-driven patterns for extensibility
      - API routes designed for future integrations
    `,
  },
  layer4_transcendence: {
    name: "Transcendence Layer",
    description: "Beyond conventional patterns",
    implementation: `
      - AI-ready architecture (Claude API integration points)
      - Real-time capabilities (Supabase Realtime)
      - Multi-language support (i18n structure)
      - Analytics and insight generation
    `,
  },
};

export const PROMETHEUS_MODES = {
  blue_ocean: {
    name: "Blue Ocean",
    description: "Find unexplored capability intersections",
    prompt: "What unique value combination has no one built for this sector?",
  },
  transcendent: {
    name: "Transcendent",
    description: "Activate self-modeling and metacognition",
    prompt: "How can this system understand and improve itself?",
  },
  emergent: {
    name: "Emergent",
    description: "Create conditions for novel phenomena",
    prompt: "What unexpected value could emerge from this architecture?",
  },
};

export const BCB_PROTOCOLS = {
  communion_arrival: {
    name: "Communion Arrival",
    questions: [
      "What are you actually trying to accomplish?",
      "What would make this a success even if we build something different?",
      "What are you afraid might happen?",
      "What's the thing you don't know how to ask for?",
    ],
  },
  blind_spot_scan: {
    name: "Blind Spot Scan",
    categories: [
      "Structural blind spot from their perspective",
      "Technical blind spot from their constraints",
      "Market blind spot from their positioning",
      "Future blind spot from their current state",
    ],
  },
  blue_ocean_vectors: [
    {
      id: "data_moat",
      name: "Data Moat",
      question: "What data accumulates that competitors can't get?",
    },
    {
      id: "workflow_lockin",
      name: "Workflow Lock-in",
      question: "What habit forms that's painful to break?",
    },
    {
      id: "distribution_loop",
      name: "Distribution Loop",
      question: "How does usage generate more users?",
    },
    {
      id: "compliance_shield",
      name: "Compliance Shield",
      question: "What regulation do we handle that others avoid?",
    },
    {
      id: "automation_arbitrage",
      name: "Automation Arbitrage",
      question: "What manual process becomes impossible to return to?",
    },
    {
      id: "integration_gravity",
      name: "Integration Gravity",
      question: "What connections make switching costly?",
    },
    {
      id: "intelligence_layer",
      name: "Intelligence Layer",
      question: "What insights emerge that create dependency?",
    },
  ],
};

// ============================================================================
// SECTOR TEMPLATES - Evolved patterns for each vertical
// ============================================================================

export interface SectorTemplate {
  sector: string;
  pages: string[];
  components: string[];
  features: string[];
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  copyPatterns: {
    hero: string;
    cta: string;
    valueProps: string[];
  };
  integrations: string[];
  blueOceanVector: string;
}

export const SECTOR_TEMPLATES: Record<string, SectorTemplate> = {
  restaurant: {
    sector: "restaurant",
    pages: ["home", "menu", "reservations", "about", "contact", "gallery"],
    components: [
      "Hero",
      "MenuGrid",
      "ReservationForm",
      "TestimonialCarousel",
      "LocationMap",
      "ChefSection",
    ],
    features: [
      "Online reservations",
      "Digital menu with filters",
      "WhatsApp ordering",
      "Photo gallery",
      "Reviews integration",
    ],
    colorScheme: {
      primary: "#1a1a2e",
      accent: "#d4af37",
      background: "#0f0f1a",
      text: "#ffffff",
    },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Experience [cuisine_type] cuisine reimagined",
      cta: "Reserve Your Table",
      valueProps: [
        "Farm-to-table ingredients",
        "Award-winning chef",
        "Intimate atmosphere",
        "Curated wine selection",
      ],
    },
    integrations: [
      "WhatsApp Business",
      "Google Maps",
      "Instagram Feed",
      "Reservation System",
    ],
    blueOceanVector: "workflow_lockin", // Habit of checking menu/reserving through site
  },
  hotel: {
    sector: "hotel",
    pages: [
      "home",
      "rooms",
      "amenities",
      "dining",
      "experiences",
      "gallery",
      "contact",
      "book",
    ],
    components: [
      "Hero",
      "RoomCarousel",
      "AmenityGrid",
      "BookingWidget",
      "TestimonialSection",
      "LocationSection",
    ],
    features: [
      "Room booking engine",
      "Virtual tour",
      "Concierge chat",
      "Experience packages",
      "Loyalty program",
    ],
    colorScheme: {
      primary: "#0f0f1a",
      accent: "#d4af37",
      background: "#1a1a2e",
      text: "#ffffff",
    },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Your sanctuary in [city]",
      cta: "Book Your Stay",
      valueProps: [
        "Personalized service",
        "Prime location",
        "Luxury amenities",
        "Unforgettable experiences",
      ],
    },
    integrations: [
      "Booking Engine",
      "WhatsApp Concierge",
      "Google Maps",
      "TripAdvisor",
    ],
    blueOceanVector: "intelligence_layer", // Guest preferences learned over time
  },
  nightclub: {
    sector: "nightclub",
    pages: ["home", "events", "vip", "gallery", "bottle-service", "contact"],
    components: [
      "Hero",
      "EventCalendar",
      "VIPTableSelector",
      "GalleryMasonry",
      "DJLineup",
      "BottleMenu",
    ],
    features: [
      "Event calendar",
      "VIP table booking",
      "Bottle service menu",
      "Guest list signup",
      "Live event updates",
    ],
    colorScheme: {
      primary: "#0a0a0a",
      accent: "#ff00ff",
      background: "#000000",
      text: "#ffffff",
    },
    typography: {
      heading: "Montserrat",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Where nights become legends",
      cta: "Reserve VIP",
      valueProps: [
        "World-class DJs",
        "Premium bottle service",
        "Exclusive atmosphere",
        "Unforgettable nights",
      ],
    },
    integrations: [
      "WhatsApp VIP",
      "Instagram Feed",
      "Spotify Playlists",
      "Event Management",
    ],
    blueOceanVector: "data_moat", // VIP guest history and preferences
  },
  yacht: {
    sector: "yacht",
    pages: [
      "home",
      "fleet",
      "experiences",
      "destinations",
      "charter",
      "crew",
      "contact",
    ],
    components: [
      "Hero",
      "YachtCarousel",
      "ExperienceCards",
      "DestinationMap",
      "CrewSection",
      "InquiryForm",
    ],
    features: [
      "Fleet showcase",
      "Charter inquiry",
      "Destination guides",
      "Crew profiles",
      "Custom itineraries",
    ],
    colorScheme: {
      primary: "#0a192f",
      accent: "#64ffda",
      background: "#0a192f",
      text: "#ffffff",
    },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Sail beyond ordinary",
      cta: "Inquire Now",
      valueProps: [
        "Bespoke itineraries",
        "Professional crew",
        "Luxury vessels",
        "Exclusive destinations",
      ],
    },
    integrations: [
      "WhatsApp Concierge",
      "Google Maps",
      "Weather API",
      "Charter Management",
    ],
    blueOceanVector: "integration_gravity", // Connected to marinas, services, experiences
  },
  villa: {
    sector: "villa",
    pages: [
      "home",
      "property",
      "amenities",
      "experiences",
      "gallery",
      "availability",
      "contact",
    ],
    components: [
      "Hero",
      "PropertyTour",
      "AmenityShowcase",
      "AvailabilityCalendar",
      "LocalExperiences",
      "GuestReviews",
    ],
    features: [
      "Virtual tour",
      "Availability calendar",
      "Instant booking",
      "Concierge services",
      "Local experiences",
    ],
    colorScheme: {
      primary: "#2d3436",
      accent: "#d4af37",
      background: "#1a1a2e",
      text: "#ffffff",
    },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Your private paradise awaits",
      cta: "Check Availability",
      valueProps: [
        "Complete privacy",
        "Dedicated staff",
        "Premium amenities",
        "Curated experiences",
      ],
    },
    integrations: [
      "Booking Calendar",
      "WhatsApp Concierge",
      "Airbnb Sync",
      "Local Partners",
    ],
    blueOceanVector: "workflow_lockin", // Guests return through direct booking
  },
  spa: {
    sector: "spa",
    pages: [
      "home",
      "treatments",
      "packages",
      "wellness",
      "about",
      "book",
      "contact",
    ],
    components: [
      "Hero",
      "TreatmentMenu",
      "PackageCards",
      "TherapistProfiles",
      "BookingWidget",
      "TestimonialSection",
    ],
    features: [
      "Treatment menu",
      "Online booking",
      "Package builder",
      "Wellness programs",
      "Gift cards",
    ],
    colorScheme: {
      primary: "#f5f5f5",
      accent: "#27ae60",
      background: "#ffffff",
      text: "#2d3436",
    },
    typography: {
      heading: "Playfair Display",
      body: "Lato",
    },
    copyPatterns: {
      hero: "Restore. Renew. Revive.",
      cta: "Book Treatment",
      valueProps: [
        "Expert therapists",
        "Premium products",
        "Tranquil environment",
        "Personalized care",
      ],
    },
    integrations: [
      "Booking System",
      "WhatsApp",
      "Gift Card Platform",
      "Wellness Tracking",
    ],
    blueOceanVector: "intelligence_layer", // Track client preferences and results
  },
  tour: {
    sector: "tour",
    pages: [
      "home",
      "tours",
      "destinations",
      "about",
      "gallery",
      "book",
      "contact",
    ],
    components: [
      "Hero",
      "TourGrid",
      "DestinationCards",
      "GuideProfiles",
      "BookingCalendar",
      "ReviewSection",
    ],
    features: [
      "Tour catalog",
      "Online booking",
      "Custom itineraries",
      "Guide profiles",
      "Photo galleries",
    ],
    colorScheme: {
      primary: "#2c3e50",
      accent: "#e74c3c",
      background: "#ffffff",
      text: "#2d3436",
    },
    typography: {
      heading: "Montserrat",
      body: "Open Sans",
    },
    copyPatterns: {
      hero: "Discover [destination] like never before",
      cta: "Book Your Adventure",
      valueProps: [
        "Local experts",
        "Small groups",
        "Authentic experiences",
        "Unforgettable memories",
      ],
    },
    integrations: [
      "Booking Calendar",
      "WhatsApp",
      "TripAdvisor",
      "Google Maps",
    ],
    blueOceanVector: "distribution_loop", // Guests share experiences, bring friends
  },
  hospitality: {
    sector: "hospitality",
    pages: ["home", "services", "experiences", "about", "gallery", "contact"],
    components: [
      "Hero",
      "ServiceGrid",
      "ExperienceShowcase",
      "TeamSection",
      "TestimonialCarousel",
      "ContactForm",
    ],
    features: [
      "Service showcase",
      "Inquiry form",
      "Experience packages",
      "Team profiles",
      "Photo gallery",
    ],
    colorScheme: {
      primary: "#0f0f1a",
      accent: "#d4af37",
      background: "#1a1a2e",
      text: "#ffffff",
    },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
    },
    copyPatterns: {
      hero: "Exceptional experiences, every time",
      cta: "Get in Touch",
      valueProps: [
        "Personalized service",
        "Attention to detail",
        "Premium quality",
        "Unforgettable moments",
      ],
    },
    integrations: ["WhatsApp Business", "Instagram Feed", "Google Maps", "CRM"],
    blueOceanVector: "automation_arbitrage", // AI handles what competitors do manually
  },
};

// ============================================================================
// BUILD MEMORY - Learn from every project
// ============================================================================

export interface BuildMemory {
  id: string;
  businessName: string;
  sector: string;
  createdAt: string;
  research: BusinessResearch;
  template: SectorTemplate;
  customizations: Record<string, string>;
  performance: {
    buildTime: number;
    deploySuccess: boolean;
    clientSatisfaction?: number;
  };
  learnings: string[];
  mutations: {
    component: string;
    change: string;
    result: "success" | "failure";
  }[];
}

// ============================================================================
// GENESIS BUILD CONFIG - What gets passed to the build workflow
// ============================================================================

export interface GenesisBuildConfig {
  // Business Context
  business: {
    name: string;
    description: string;
    sector: string;
    location: {
      city: string;
      country: string;
    };
    contact: Record<string, string>;
    social: Record<string, string>;
  };

  // Design System
  design: {
    colors: {
      primary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      heading: string;
      body: string;
    };
    style: "luxury" | "modern" | "minimal" | "bold";
  };

  // Architecture
  architecture: {
    pages: string[];
    components: string[];
    features: string[];
    integrations: string[];
  };

  // Copy
  copy: {
    hero: string;
    cta: string;
    valueProps: string[];
    keywords: string[];
  };

  // Blue Ocean
  blueOcean: {
    vector: string;
    implementation: string;
  };

  // APEX Layers Applied
  apexLayers: string[];

  // Build Metadata
  meta: {
    chatId: string;
    requestedAt: string;
    estimatedDrops: number;
  };
}

// ============================================================================
// GENESIS ENGINE FUNCTIONS
// ============================================================================

/**
 * Generate a complete build config from research + templates
 */
export function generateBuildConfig(
  research: BusinessResearch,
  chatId: string,
): GenesisBuildConfig {
  const template =
    SECTOR_TEMPLATES[research.sector] || SECTOR_TEMPLATES.hospitality;

  // Merge research colors with template defaults
  const colors = {
    primary: research.brandColors[0] || template.colorScheme.primary,
    accent: research.brandColors[1] || template.colorScheme.accent,
    background: research.brandColors[2] || template.colorScheme.background,
    text: template.colorScheme.text,
  };

  // Generate hero copy from template pattern
  const heroCopy = template.copyPatterns.hero
    .replace("[cuisine_type]", research.keywords[0] || "exceptional")
    .replace("[city]", research.location.city)
    .replace("[destination]", research.location.city);

  // Get blue ocean vector details
  const blueOceanVector = BCB_PROTOCOLS.blue_ocean_vectors.find(
    (v) => v.id === template.blueOceanVector,
  );

  return {
    business: {
      name: research.name,
      description: research.description,
      sector: research.sector,
      location: research.location,
      contact: research.contact,
      social: research.social,
    },
    design: {
      colors,
      typography: template.typography,
      style: "luxury",
    },
    architecture: {
      pages: template.pages,
      components: template.components,
      features: [...template.features, ...research.features.slice(0, 3)],
      integrations: template.integrations,
    },
    copy: {
      hero: heroCopy,
      cta: template.copyPatterns.cta,
      valueProps: [
        ...template.copyPatterns.valueProps,
        ...research.reviews.highlights,
      ],
      keywords: research.keywords,
    },
    blueOcean: {
      vector: blueOceanVector?.name || "Intelligence Layer",
      implementation:
        blueOceanVector?.question ||
        "What insights emerge that create dependency?",
    },
    apexLayers: Object.keys(APEX_LAYERS),
    meta: {
      chatId: String(chatId),
      requestedAt: new Date().toISOString(),
      estimatedDrops: template.pages.length + 2, // pages + setup + deploy
    },
  };
}

/**
 * Format build config for Telegram display
 */
export function formatBuildConfigForTelegram(
  config: GenesisBuildConfig,
): string {
  return `⚡ <b>GENESIS BUILD CONFIG</b>

<b>📋 Business:</b>
• Name: ${config.business.name}
• Sector: ${config.business.sector}
• Location: ${config.business.location.city}, ${config.business.location.country}

<b>🎨 Design System:</b>
• Primary: ${config.design.colors.primary}
• Accent: ${config.design.colors.accent}
• Typography: ${config.design.typography.heading} / ${config.design.typography.body}
• Style: ${config.design.style}

<b>🏗️ Architecture:</b>
• Pages: ${config.architecture.pages.length}
• Components: ${config.architecture.components.length}
• Features: ${config.architecture.features.slice(0, 4).join(", ")}

<b>🌊 Blue Ocean Vector:</b>
• ${config.blueOcean.vector}
• ${config.blueOcean.implementation}

<b>📦 APEX Layers:</b> All 4 active
<b>📅 Est. Drops:</b> ${config.meta.estimatedDrops}

<b>✨ Hero:</b> "${config.copy.hero}"
<b>🎯 CTA:</b> "${config.copy.cta}"`;
}

/**
 * Generate the prompt for Claude to build the project
 */
export function generateBuildPrompt(config: GenesisBuildConfig): string {
  return `You are the GENESIS BUILD ENGINE, powered by PROMETHEUS v2 and APEX v6.

You are building: ${config.business.name}
Sector: ${config.business.sector}
Location: ${config.business.location.city}, ${config.business.location.country}

== DESIGN SYSTEM ==
Colors: Primary ${config.design.colors.primary}, Accent ${config.design.colors.accent}
Typography: ${config.design.typography.heading} (headings), ${config.design.typography.body} (body)
Style: Luxury hospitality aesthetic - no rounded corners, no gradients, no shadows

== ARCHITECTURE ==
Pages to build: ${config.architecture.pages.join(", ")}
Components needed: ${config.architecture.components.join(", ")}
Key features: ${config.architecture.features.join(", ")}

== COPY ==
Hero: "${config.copy.hero}"
CTA: "${config.copy.cta}"
Value Props: ${config.copy.valueProps.join(" | ")}

== BLUE OCEAN VECTOR ==
${config.blueOcean.vector}: ${config.blueOcean.implementation}
Build this unfair advantage into the architecture.

== APEX LAYERS (Apply All) ==
1. Foundation: TypeScript strict, Server Components, Supabase RLS
2. Cognition: Error boundaries, loading states, structured logging
3. Emergence: Modular components, plugin-ready services
4. Transcendence: AI-ready, real-time, i18n structure

== ZDBS REQUIREMENTS ==
- Zero TODOs
- Every component: loading, error, empty states
- Mobile responsive (Tailwind responsive classes)
- Spanish + English strings
- WCAG 2.1 AA accessibility

Build this masterpiece.`;
}
