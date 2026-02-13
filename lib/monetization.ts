// ============================================
// Config central de monetizacion - Cuentos IA
// Editar este archivo para cambiar precios/limites
// ============================================

export type PlanType = 'free' | 'premium';
export type ImageQuality = 'standard' | 'high';

// --- Plan Free: limites ---
export const FREE_LIMITS = {
  storiesPerWeek: 1,
  storiesPerMonth: 4,
  maxLibraryStories: 10,
  allowedLengths: ['corto'] as string[],
  allowedArtStyleValues: ['watercolor', 'cartoon'] as string[],
  pdfWatermark: true,
  imageQuality: 'standard' as ImageQuality,
};

// --- Plan Premium: features ---
export const PREMIUM_FEATURES = {
  monthlyCredits: 60,
  allowedLengths: ['corto', 'medio', 'largo'] as string[],
  allowedArtStyleValues: ['watercolor', 'cartoon', 'digital', 'storybook', 'pastel'] as string[],
  pdfWatermark: false,
  imageQuality: 'high' as ImageQuality,
  maxLibraryStories: Infinity,
};

// --- Costos en creditos ---
export const CREDIT_COSTS = {
  generateText: 5,
  generateImageStandard: 8,
  generateImageHigh: 12,
  exportPdfClean: 3,
  proCover: 10,
};

// --- Packs de top-up ---
export const TOPUP_PACKS = [
  { id: 'pack_30', credits: 30, priceCLP: 2990, label: '30 creditos' },
  { id: 'pack_80', credits: 80, priceCLP: 6990, label: '80 creditos' },
  { id: 'pack_200', credits: 200, priceCLP: 14990, label: '200 creditos' },
];

// --- Precios de suscripcion ---
export const SUBSCRIPTION_PLANS = {
  monthly: { priceCLP: 4990, label: 'Premium Mensual' },
  annual: { priceCLP: 39990, label: 'Premium Anual' },
};

// --- Paginas por largo ---
export const PAGES_PER_LENGTH: Record<string, number> = {
  corto: 4,
  medio: 6,
  largo: 8,
};

// --- Helpers ---

export function estimateStoryCost(length: string, imageQuality: ImageQuality): number {
  const pages = PAGES_PER_LENGTH[length] || 4;
  const imgCost = imageQuality === 'high'
    ? CREDIT_COSTS.generateImageHigh
    : CREDIT_COSTS.generateImageStandard;
  return CREDIT_COSTS.generateText + (pages * imgCost);
}

export function isStylePremium(styleValue: string): boolean {
  return !FREE_LIMITS.allowedArtStyleValues.includes(styleValue);
}

export function isLengthPremium(lengthValue: string): boolean {
  return !FREE_LIMITS.allowedLengths.includes(lengthValue);
}

export function getImageCost(quality: ImageQuality): number {
  return quality === 'high'
    ? CREDIT_COSTS.generateImageHigh
    : CREDIT_COSTS.generateImageStandard;
}
