/**
 * ENGINE PROTOCOLS - The Intelligence Layer for Genesis Builds
 *
 * Three integrated systems that transform every build into a masterpiece:
 * 1. APEX FINISHING ENGINE - 12-dimension excellence audit
 * 2. INTERFACE PERFECTION ENGINE - Typography, color, spacing, accessibility
 * 3. SIGNATURE EXPERIENCE ENGINE - 12 categories of memorable experiences
 *
 * Every project built through Genesis inherits these DNA patterns.
 */

// ============================================================================
// APEX FINISHING ENGINE - 12 Dimensions of Excellence
// ============================================================================

export const APEX_FINISHING_ENGINE = {
  name: "APEX FINISHING ENGINE",
  version: "v3",
  description:
    "12-dimension excellence audit + blue ocean enhancement + blind spot scan",

  dimensions: {
    visual_hierarchy: {
      name: "Visual Hierarchy",
      checklist: [
        "Single focal point per viewport",
        "Clear visual flow (F-pattern or Z-pattern)",
        "Progressive disclosure of information",
        "Intentional negative space allocation",
        "Typography hierarchy (3 levels max)",
      ],
      implementation:
        "Each section has ONE primary action, typography scales 1.25x between levels",
    },

    interaction_design: {
      name: "Interaction Design",
      checklist: [
        "Every clickable element has hover state",
        "Loading states for all async operations",
        "Smooth transitions (300ms default)",
        "Touch targets minimum 44x44px (prefer 56px)",
        "Clear feedback for all user actions",
      ],
      implementation:
        "Use transition-all duration-300, min-h-14 for touch targets",
    },

    content_clarity: {
      name: "Content Clarity",
      checklist: [
        "Headlines scannable in 3 seconds",
        "Value proposition in first viewport",
        "Benefits over features in copy",
        "Reading level appropriate for audience",
        "CTAs action-oriented (verbs not nouns)",
      ],
      implementation: "Hero: 8 words max headline, 25 words max subtitle",
    },

    brand_consistency: {
      name: "Brand Consistency",
      checklist: [
        "Color palette used consistently",
        "Typography matches brand voice",
        "Imagery style unified throughout",
        "Tone of voice consistent in all copy",
        "Logo properly sized and placed",
      ],
      implementation:
        "CSS variables for all brand colors, Tailwind config for fonts",
    },

    performance: {
      name: "Performance",
      checklist: [
        "LCP < 2.5 seconds",
        "FID < 100ms",
        "CLS < 0.1",
        "Images optimized (WebP, lazy loading)",
        "Critical CSS inlined",
      ],
      implementation:
        "next/image with priority for hero, dynamic imports for below-fold",
    },

    accessibility: {
      name: "Accessibility",
      checklist: [
        "WCAG 2.1 AA color contrast (4.5:1 text, 3:1 large text)",
        "All images have alt text",
        "Keyboard navigation works",
        "Focus states visible",
        "ARIA labels on interactive elements",
      ],
      implementation:
        "focus:ring-2 focus:ring-gold, aria-label on buttons/links",
    },

    mobile_excellence: {
      name: "Mobile Excellence",
      checklist: [
        "Thumb-zone friendly navigation",
        "Readable without zooming",
        "Forms optimized for mobile input",
        "Sticky CTAs accessible",
        "Content prioritized for mobile context",
      ],
      implementation: "Bottom-fixed CTA bar on mobile, hamburger at top-right",
    },

    conversion_optimization: {
      name: "Conversion Optimization",
      checklist: [
        "Clear primary CTA per section",
        "Social proof near CTAs",
        "Urgency/scarcity when appropriate",
        "Friction minimized in forms",
        "Exit intent strategy",
      ],
      implementation: "WhatsApp as primary CTA, testimonials above fold",
    },

    seo_technical: {
      name: "SEO & Technical",
      checklist: [
        "Meta title + description unique per page",
        "Open Graph tags complete",
        "Structured data (JSON-LD)",
        "Sitemap generated",
        "Canonical URLs set",
      ],
      implementation:
        "generateMetadata in layout.tsx, JSON-LD in page components",
    },

    trust_signals: {
      name: "Trust Signals",
      checklist: [
        "Business information visible",
        "Contact options prominent",
        "Reviews/testimonials displayed",
        "Security badges if applicable",
        "Professional imagery",
      ],
      implementation: "Footer with full contact, floating WhatsApp button",
    },

    emotional_resonance: {
      name: "Emotional Resonance",
      checklist: [
        "Copy evokes target emotion",
        "Imagery supports emotional goal",
        "Color psychology applied",
        "Story elements woven throughout",
        "Aspirational positioning",
      ],
      implementation: "Luxury positioning, gold accents evoke premium quality",
    },

    future_ready: {
      name: "Future Ready",
      checklist: [
        "Code modular and extensible",
        "Integration points documented",
        "Analytics ready (placeholder events)",
        "Internationalization structure",
        "AI-ready architecture",
      ],
      implementation: "Component-based architecture, Supabase for data layer",
    },
  },

  blueOceanEnhancement: {
    description: "Identify one unexplored capability intersection",
    vectors: [
      {
        id: "data_moat",
        question: "What data accumulates that competitors can't get?",
      },
      {
        id: "workflow_lockin",
        question: "What habit forms that's painful to break?",
      },
      {
        id: "distribution_loop",
        question: "How does usage generate more users?",
      },
      {
        id: "compliance_shield",
        question: "What regulation do we handle that others avoid?",
      },
      {
        id: "automation_arbitrage",
        question: "What manual process becomes impossible to return to?",
      },
      {
        id: "integration_gravity",
        question: "What connections make switching costly?",
      },
      {
        id: "intelligence_layer",
        question: "What insights emerge that create dependency?",
      },
    ],
  },

  blindSpotScan: {
    description: "Identify gaps in typical implementations",
    categories: [
      {
        area: "structural",
        question: "What obvious improvement do competitors miss?",
      },
      {
        area: "technical",
        question: "What technical capability would transform experience?",
      },
      {
        area: "market",
        question: "What adjacent opportunity is being ignored?",
      },
      {
        area: "future",
        question: "What emerging trend could we build for now?",
      },
    ],
  },
};

// ============================================================================
// INTERFACE PERFECTION ENGINE - Visual Excellence Standards
// ============================================================================

export const INTERFACE_PERFECTION_ENGINE = {
  name: "INTERFACE PERFECTION ENGINE",
  version: "v2",
  description:
    "Typography, color, spacing, component-level perfection, accessibility",

  typography: {
    scale: "1.25 (major third)",
    levels: {
      display: {
        size: "text-5xl md:text-7xl",
        weight: "font-bold",
        family: "font-display",
      },
      h1: {
        size: "text-4xl md:text-5xl",
        weight: "font-bold",
        family: "font-display",
      },
      h2: {
        size: "text-3xl md:text-4xl",
        weight: "font-semibold",
        family: "font-display",
      },
      h3: {
        size: "text-xl md:text-2xl",
        weight: "font-semibold",
        family: "font-display",
      },
      body: { size: "text-base", weight: "font-normal", family: "font-body" },
      small: { size: "text-sm", weight: "font-normal", family: "font-body" },
      caption: { size: "text-xs", weight: "font-normal", family: "font-body" },
    },
    rules: [
      "Maximum 2 font families (heading + body)",
      "Line height 1.5 for body, 1.2 for headings",
      "Letter spacing -0.02em for headings, 0 for body",
      "Uppercase only for labels/captions, with tracking-widest",
    ],
  },

  colorSystem: {
    luxuryPalette: {
      gold: "#d4af37",
      dark: "#0f0f1a",
      darker: "#0a0a12",
      white: "#ffffff",
      gray: {
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
      },
    },
    rules: [
      "Background: dark (#0f0f1a)",
      "Accent: gold (#d4af37) - use sparingly for impact",
      "Text: white on dark, dark on light",
      "WCAG 4.5:1 contrast ratio minimum for text",
      "No pure black (#000) - use dark (#0f0f1a)",
    ],
    sectorVariants: {
      nightclub: { accent: "#ff00ff", background: "#000000" },
      spa: { accent: "#27ae60", background: "#ffffff" },
      yacht: { accent: "#64ffda", background: "#0a192f" },
    },
  },

  spacing: {
    system: "8px base unit (Tailwind 2)",
    sections: {
      hero: "min-h-screen pt-16",
      section: "py-24 px-4",
      container: "max-w-6xl mx-auto",
      card: "p-8",
      button: "px-10 py-4",
    },
    rules: [
      "Consistent vertical rhythm (24px section padding)",
      "Content max-width 1152px (6xl)",
      "Mobile: 16px horizontal padding",
      "Desktop: 24px+ horizontal padding",
    ],
  },

  components: {
    buttons: {
      primary:
        "bg-gold text-dark font-semibold hover:bg-gold/90 transition px-10 py-4",
      secondary:
        "border-2 border-gold text-gold hover:bg-gold/10 transition px-10 py-4",
      ghost: "text-gold hover:text-gold/80 transition",
      whatsapp: "bg-green-500 text-white hover:bg-green-600 transition",
    },
    cards: {
      default: "bg-dark border border-gray-800 p-8",
      hover: "hover:border-gold transition",
      elevated: "bg-darker border border-gray-800 p-8",
    },
    inputs: {
      default:
        "bg-dark border border-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition",
    },
    navigation: {
      fixed:
        "fixed top-0 w-full z-50 bg-dark/90 backdrop-blur-sm border-b border-gray-800",
      height: "h-16",
    },
  },

  animations: {
    transitions: {
      default: "transition-all duration-300",
      fast: "transition-all duration-150",
      slow: "transition-all duration-500",
    },
    effects: {
      hover: "hover:scale-[1.02]",
      fadeIn: "animate-fade-in",
      slideUp: "animate-slide-up",
    },
    rules: [
      "Never animate layout properties (width, height) - use transform",
      "Respect prefers-reduced-motion",
      "Subtle is better - 2-5% scale changes max",
    ],
  },

  noRoundedCorners: {
    rule: "APEX aesthetic uses square edges exclusively",
    implementation: "* { border-radius: 0 !important; } in globals.css",
    exceptions: "Only for brand-specific requirements",
  },
};

// ============================================================================
// SIGNATURE EXPERIENCE ENGINE - 12 Categories of Memorable Experiences
// ============================================================================

export const SIGNATURE_EXPERIENCE_ENGINE = {
  name: "SIGNATURE EXPERIENCE ENGINE",
  version: "v2",
  description:
    "12 categories of signature experiences that make sites memorable",

  categories: {
    physics_magic: {
      name: "Physics & Magic",
      description: "Elements that defy expectations through physics simulation",
      examples: [
        "Parallax layers at different speeds",
        "Floating elements with subtle animation",
        "Magnetic cursor effects",
        "Gravity-defying scroll animations",
      ],
      implementation: {
        simple: "CSS transforms with scroll-triggered animations",
        advanced: "Framer Motion physics, Three.js for 3D",
      },
      sectorRelevance: {
        nightclub: "Essential - particle systems, glow effects",
        yacht: "High - water/wave physics",
        hotel: "Medium - parallax backgrounds",
        restaurant: "Low - subtle hover effects",
      },
    },

    interactive_3d: {
      name: "Interactive 3D",
      description: "Three-dimensional elements users can manipulate",
      examples: [
        "Product viewers (rotate, zoom)",
        "Virtual tours",
        "3D room configurators",
        "Interactive maps with depth",
      ],
      implementation: {
        simple: "CSS 3D transforms",
        advanced: "Three.js, React Three Fiber, Spline",
      },
      sectorRelevance: {
        yacht: "Essential - boat tours",
        villa: "High - property walkthroughs",
        hotel: "High - room tours",
        restaurant: "Low - optional menu visualization",
      },
    },

    sound_design: {
      name: "Sound & Haptics",
      description: "Audio feedback and tactile responses",
      examples: [
        "Subtle UI sounds on interaction",
        "Ambient background audio (opt-in)",
        "Haptic feedback on mobile",
        "Audio cues for notifications",
      ],
      implementation: {
        simple: "Howler.js for audio, Vibration API for haptics",
        advanced: "Web Audio API, custom sound design",
      },
      sectorRelevance: {
        nightclub: "Essential - audio preview, ambient beats",
        spa: "High - ambient soundscapes",
        yacht: "Medium - ocean sounds",
        restaurant: "Low - optional ambient",
      },
    },

    gamification: {
      name: "Gamification",
      description: "Game-like elements that increase engagement",
      examples: [
        "Progress bars",
        "Achievement unlocks",
        "Points/rewards systems",
        "Interactive quizzes",
        "Spin-to-win promotions",
      ],
      implementation: {
        simple: "CSS progress bars, confetti on actions",
        advanced: "Full rewards system with Supabase backend",
      },
      sectorRelevance: {
        nightclub: "High - loyalty points, VIP unlocks",
        tour: "High - destination checklist",
        hotel: "Medium - loyalty program visualization",
        restaurant: "Medium - menu explorer achievements",
      },
    },

    personalization: {
      name: "Personalization",
      description: "Experiences tailored to individual users",
      examples: [
        "Name insertion in copy",
        "Location-based content",
        "Return visitor recognition",
        "Preference remembering",
        "AI-driven recommendations",
      ],
      implementation: {
        simple: "localStorage for preferences",
        advanced: "Supabase user profiles + Claude AI recommendations",
      },
      sectorRelevance: {
        hotel: "Essential - guest preferences",
        spa: "High - treatment recommendations",
        restaurant: "High - dietary preferences",
        villa: "High - concierge personalization",
      },
    },

    visual_storytelling: {
      name: "Visual Storytelling",
      description: "Narrative experiences through visuals",
      examples: [
        "Scroll-triggered story progression",
        "Before/after sliders",
        "Timeline visualizations",
        "Photo narratives",
      ],
      implementation: {
        simple: "Intersection Observer for scroll triggers",
        advanced: "GSAP ScrollTrigger, custom story engines",
      },
      sectorRelevance: {
        tour: "Essential - destination stories",
        hotel: "High - property history",
        restaurant: "High - chef journey",
        villa: "Medium - property features",
      },
    },

    real_time_social: {
      name: "Real-time & Social",
      description: "Live data and social elements",
      examples: [
        "Live availability indicators",
        "Social proof notifications",
        "Live chat/support",
        "Real-time booking updates",
        "Recent activity feeds",
      ],
      implementation: {
        simple: "Static social proof cards",
        advanced: "Supabase Realtime subscriptions",
      },
      sectorRelevance: {
        nightclub: "Essential - live event updates",
        hotel: "High - room availability",
        restaurant: "High - table availability",
        tour: "High - tour capacity",
      },
    },

    micro_interactions: {
      name: "Micro-interactions",
      description: "Small details that delight",
      examples: [
        "Button ripple effects",
        "Icon animations on hover",
        "Input validation animations",
        "Loading skeleton animations",
        "Success state celebrations",
      ],
      implementation: {
        simple: "CSS transitions and keyframes",
        advanced: "Lottie animations, custom SVG animations",
      },
      sectorRelevance: {
        all: "Essential - applies to every sector",
      },
    },

    immersive_media: {
      name: "Immersive Media",
      description: "Full-screen media experiences",
      examples: [
        "Full-bleed video backgrounds",
        "360-degree photos",
        "Drone footage integration",
        "Immersive photo galleries",
      ],
      implementation: {
        simple: "Native video element with autoplay",
        advanced: "Video.js, custom gallery engines",
      },
      sectorRelevance: {
        yacht: "Essential - aerial footage",
        villa: "Essential - property showcase",
        hotel: "High - amenity showcase",
        tour: "High - destination preview",
      },
    },

    easter_eggs: {
      name: "Easter Eggs & Secrets",
      description: "Hidden delights for discovery",
      examples: [
        "Konami code unlocks",
        "Console messages for developers",
        "Hidden pages or features",
        "Secret menus",
        "Double-tap surprises",
      ],
      implementation: {
        simple: "Event listeners for key sequences",
        advanced: "Custom secret detection with rewards",
      },
      sectorRelevance: {
        nightclub: "High - secret events",
        restaurant: "Medium - secret menu items",
        hotel: "Low - optional",
        corporate: "Medium - developer nods",
      },
    },

    intelligent_assistance: {
      name: "Intelligent Assistance",
      description: "AI-powered help and guidance",
      examples: [
        "Chatbot concierge",
        "Smart search suggestions",
        "Contextual help tooltips",
        "AI-powered recommendations",
      ],
      implementation: {
        simple: "Pre-scripted FAQ bot",
        advanced: "Claude AI integration via API",
      },
      sectorRelevance: {
        hotel: "Essential - Sofia concierge",
        villa: "High - booking assistance",
        tour: "High - trip planning",
        restaurant: "Medium - menu recommendations",
      },
    },

    ambient_atmosphere: {
      name: "Ambient & Atmosphere",
      description: "Background elements that set mood",
      examples: [
        "Particle systems (fire, snow, bubbles)",
        "Dynamic backgrounds",
        "Weather effects",
        "Time-of-day theming",
        "Seasonal decorations",
      ],
      implementation: {
        simple: "CSS gradients, SVG patterns",
        advanced: "Canvas particle systems, WebGL shaders",
      },
      sectorRelevance: {
        nightclub: "Essential - particles, glow",
        spa: "High - zen particles",
        restaurant: "Medium - fire effects for grills",
        yacht: "Medium - water effects",
      },
    },
  },

  sectorProfiles: {
    restaurant: {
      essential: ["micro_interactions", "visual_storytelling"],
      recommended: ["personalization", "real_time_social"],
      optional: ["ambient_atmosphere", "sound_design"],
    },
    hotel: {
      essential: [
        "personalization",
        "intelligent_assistance",
        "interactive_3d",
      ],
      recommended: ["real_time_social", "visual_storytelling"],
      optional: ["immersive_media", "gamification"],
    },
    nightclub: {
      essential: ["physics_magic", "ambient_atmosphere", "sound_design"],
      recommended: ["gamification", "real_time_social"],
      optional: ["easter_eggs", "interactive_3d"],
    },
    yacht: {
      essential: ["interactive_3d", "immersive_media"],
      recommended: ["visual_storytelling", "ambient_atmosphere"],
      optional: ["personalization", "intelligent_assistance"],
    },
    villa: {
      essential: ["interactive_3d", "immersive_media", "personalization"],
      recommended: ["intelligent_assistance", "visual_storytelling"],
      optional: ["micro_interactions"],
    },
    spa: {
      essential: ["ambient_atmosphere", "personalization"],
      recommended: ["sound_design", "visual_storytelling"],
      optional: ["intelligent_assistance"],
    },
    tour: {
      essential: ["visual_storytelling", "gamification", "immersive_media"],
      recommended: ["intelligent_assistance", "real_time_social"],
      optional: ["personalization"],
    },
    hospitality: {
      essential: ["micro_interactions", "real_time_social"],
      recommended: ["personalization", "intelligent_assistance"],
      optional: ["visual_storytelling"],
    },
  },
};

// ============================================================================
// GENESIS PROTOCOL SELECTOR - Choose experiences based on sector
// ============================================================================

export interface GenesisProtocolConfig {
  sector: string;
  apexDimensions: string[];
  interfaceTokens: Record<string, string>;
  signatureExperiences: {
    essential: string[];
    recommended: string[];
    implemented: string[];
  };
  blueOceanVector: {
    id: string;
    question: string;
  };
}

type SectorKey = keyof typeof SIGNATURE_EXPERIENCE_ENGINE.sectorProfiles;
type ColorVariantKey =
  keyof typeof INTERFACE_PERFECTION_ENGINE.colorSystem.sectorVariants;

export function selectGenesisProtocol(sector: string): GenesisProtocolConfig {
  const sectorKey = sector as SectorKey;
  const sectorProfile =
    SIGNATURE_EXPERIENCE_ENGINE.sectorProfiles[sectorKey] ||
    SIGNATURE_EXPERIENCE_ENGINE.sectorProfiles.hospitality;

  const colorKey = sector as ColorVariantKey;
  const colorVariant = INTERFACE_PERFECTION_ENGINE.colorSystem.sectorVariants[
    colorKey
  ] || { accent: "#d4af37", background: "#0f0f1a" };

  // Select blue ocean vector based on sector
  const blueOceanMap: Record<string, string> = {
    restaurant: "workflow_lockin",
    hotel: "intelligence_layer",
    nightclub: "data_moat",
    yacht: "integration_gravity",
    villa: "workflow_lockin",
    spa: "intelligence_layer",
    tour: "distribution_loop",
    hospitality: "automation_arbitrage",
  };

  const vectorId = blueOceanMap[sector] || "automation_arbitrage";
  const vector = APEX_FINISHING_ENGINE.blueOceanEnhancement.vectors.find(
    (v) => v.id === vectorId,
  )!;

  return {
    sector,
    apexDimensions: Object.keys(APEX_FINISHING_ENGINE.dimensions),
    interfaceTokens: {
      accent: colorVariant.accent,
      background: colorVariant.background,
      typography_heading: "Playfair Display",
      typography_body: "Inter",
      border_radius: "0",
    },
    signatureExperiences: {
      essential: sectorProfile.essential,
      recommended: sectorProfile.recommended,
      implemented: [
        "micro_interactions", // Always implemented
        ...sectorProfile.essential.slice(0, 2), // Top 2 essentials
      ],
    },
    blueOceanVector: {
      id: vectorId,
      question: vector.question,
    },
  };
}

// ============================================================================
// SIGNATURE EXPERIENCE COMPONENTS - Ready-to-use implementations
// ============================================================================

export const SIGNATURE_COMPONENTS = {
  fireParticles: {
    name: "Fire Particles",
    experience: "ambient_atmosphere",
    component: "FireParticles.tsx",
    description: "Canvas-based ember particles for hero sections",
    sectors: ["nightclub", "restaurant"],
  },

  konamiEasterEgg: {
    name: "Konami Code Easter Egg",
    experience: "easter_eggs",
    component: "KonamiCode.tsx",
    description: "↑↑↓↓←→←→BA triggers secret effect",
    sectors: ["nightclub", "restaurant"],
  },

  consoleEasterEgg: {
    name: "Console Easter Egg",
    experience: "easter_eggs",
    component: "ConsoleEasterEgg.tsx",
    description: "ASCII art + window object secrets for developers",
    sectors: ["all"],
  },

  scrollProgress: {
    name: "Scroll Progress Bar",
    experience: "micro_interactions",
    component: "ScrollProgress.tsx",
    description: "Gold progress bar showing page scroll position",
    sectors: ["all"],
  },

  socialProofNotifications: {
    name: "Social Proof Notifications",
    experience: "real_time_social",
    component: "SocialProofToast.tsx",
    description: '"Juan just booked..." notifications',
    sectors: ["hotel", "restaurant", "tour"],
  },

  parallaxHero: {
    name: "Parallax Hero",
    experience: "physics_magic",
    component: "ParallaxHero.tsx",
    description: "Multi-layer parallax background effect",
    sectors: ["yacht", "villa", "hotel"],
  },

  magneticCursor: {
    name: "Magnetic Cursor",
    experience: "physics_magic",
    component: "MagneticCursor.tsx",
    description: "Buttons attract cursor with magnetic effect",
    sectors: ["nightclub"],
  },

  ambientSoundToggle: {
    name: "Ambient Sound Toggle",
    experience: "sound_design",
    component: "AmbientSound.tsx",
    description: "Optional background audio with fade in/out",
    sectors: ["spa", "nightclub"],
  },

  liveAvailability: {
    name: "Live Availability",
    experience: "real_time_social",
    component: "LiveAvailability.tsx",
    description: "Real-time availability indicators",
    sectors: ["hotel", "restaurant", "tour"],
  },

  beforeAfterSlider: {
    name: "Before/After Slider",
    experience: "visual_storytelling",
    component: "BeforeAfterSlider.tsx",
    description: "Draggable comparison slider for transformations",
    sectors: ["spa", "villa"],
  },
};

// ============================================================================
// GENESIS BUILD PROMPT GENERATOR - Creates AI prompts with full protocol context
// ============================================================================

export function generateProtocolPrompt(config: GenesisProtocolConfig): string {
  const apexSummary = Object.values(APEX_FINISHING_ENGINE.dimensions)
    .map((d) => `- ${d.name}: ${d.checklist[0]}`)
    .join("\n");

  const signatureComponents = Object.entries(SIGNATURE_COMPONENTS)
    .filter(
      ([_, c]) =>
        c.sectors.includes(config.sector) || c.sectors.includes("all"),
    )
    .filter(([_, c]) =>
      config.signatureExperiences.implemented.includes(c.experience),
    )
    .map(([name, c]) => `- ${c.name}: ${c.description}`)
    .join("\n");

  return `
== ENGINE PROTOCOLS ACTIVE ==

APEX FINISHING ENGINE v3:
${apexSummary}

INTERFACE PERFECTION ENGINE v2:
- Colors: Accent ${config.interfaceTokens.accent}, Background ${config.interfaceTokens.background}
- Typography: ${config.interfaceTokens.typography_heading} (headings), ${config.interfaceTokens.typography_body} (body)
- Border Radius: ${config.interfaceTokens.border_radius} (APEX square aesthetic)
- Touch targets: 56px minimum

SIGNATURE EXPERIENCE ENGINE v2:
Essential experiences for ${config.sector}:
${config.signatureExperiences.essential.map((e) => `- ${e}`).join("\n")}

Implementing these signature components:
${signatureComponents || "- micro_interactions (base)"}

BLUE OCEAN VECTOR:
${config.blueOceanVector.id}: ${config.blueOceanVector.question}
Build this unfair advantage into the architecture.

== ZDBS QUALITY GATE ==
- Zero TODOs in code
- TypeScript strict (no any)
- Every component: loading, error, empty states
- Mobile-first responsive
- Spanish + English ready
- WCAG 2.1 AA accessibility
`;
}
