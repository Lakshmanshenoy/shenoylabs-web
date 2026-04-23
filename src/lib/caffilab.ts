export type BrewMethod =
  | "espresso"
  | "pour_over"
  | "chemex"
  | "french_press"
  | "cold_brew"
  | "aeropress"
  | "moka_pot"
  | "drip_machine"
  | "siphon"
  | "turkish"
  | "cold_drip"
  | "immersion"
  | "percolator"
  | "indian_filter";

export type BeanType = "unknown" | "arabica" | "robusta" | "blend";
export type BeanDetail = "generic" | "high_altitude" | "low_altitude" | "custom";
export type WeightUnit = "g" | "oz" | "lb";
export type VolumeUnit = "ml" | "l" | "fl_oz";
export type TimeUnit = "min" | "hr";
export type TemperatureUnit = "c" | "f";
export type PriceCurrency =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SGD"
  | "JPY"
  | "AED";
export type PriceUnit = "kg" | "lb";
export type PackageClue =
  | "none"
  | "specialty_single_origin"
  | "espresso_blend"
  | "south_indian_filter"
  | "commercial_instant";
export type RoastLevel = "light" | "medium" | "dark";
export type AgitationLevel = "none" | "gentle" | "moderate" | "high";
export type WaterMinerals = "unknown" | "soft" | "balanced" | "hard";
export type Freshness = "unknown" | "fresh" | "rested" | "stale";
export type FilterType = "paper" | "metal" | "cloth" | "none";

// Expert-mode types: modular foundation for future scientific improvements.
// Features are scaffolded for extension; some affect the model, others are structural placeholders.

/** Arabica quality tier. Narrows the caffeine fraction range.
 * Commercial (1.0–1.2 %) is the lower tier; Specialty (1.2–1.6 %) the upper tier. */
export type ArabicaGrade = "specialty" | "commercial";

/** Farm elevation band. Shifts the caffeine fraction range slightly.
 * Higher altitude correlates with slightly elevated caffeine content (UV / stress effects). */
export type ElevationBand = "unknown" | "low" | "mid" | "high";

/** Espresso extraction quality. Models channeling and puck preparation.
 * Only applicable to pressure-based methods (espresso). */
export type ExtractionQuality = "average" | "poor" | "well_prepared";

/** Cultivar-level F-range shift for known arabica cultivars.
 * Based on published HPLC caffeine measurements (Ky et al., 2001; Bertrand et al., 2003).
 * Returns an absolute shift (in dry-weight fraction) weighted by arabica proportion.
 * Unknown/unspecified cultivars return 0 (backward compatible default). */
export type Cultivar = "unknown" | "geisha" | "sl28" | "caturra" | "catimor";

export type GrindSize =
  | "extra_fine"
  | "fine"
  | "medium_fine"
  | "medium"
  | "medium_coarse"
  | "coarse"
  | "extra_coarse";

type ConfidenceLabel = "Low" | "Medium" | "High" | "Very High";

export type CaffiLabInput = {
  brewMethod: BrewMethod;
  coffeeAmount: number;
  coffeeUnit: WeightUnit;
  brewWaterAmount: number;
  brewWaterUnit: VolumeUnit;
  servingAmount: number;
  servingUnit: VolumeUnit;
  beanType: BeanType;
  beanDetail?: BeanDetail;
  customCaffeinePercent?: number;
  arabicaPercent?: number;
  robustaPercent?: number;
  coffeePrice?: number;
  priceCurrency?: PriceCurrency;
  priceUnit?: PriceUnit;
  packageClue?: PackageClue;
  brewTimeAmount?: number;
  brewTimeUnit: TimeUnit;
  dilutionAmount?: number;
  dilutionUnit: VolumeUnit;
  grindSize: GrindSize;
  roastLevel: RoastLevel;
  temperatureAmount?: number;
  temperatureUnit: TemperatureUnit;
  extractionYieldPercent?: number;
  pressureBars?: number;
  agitation: AgitationLevel;
  waterMinerals: WaterMinerals;
  waterPh?: number;
  freshness: Freshness;
  filterType: FilterType;
  chicoryPercent?: number;
  // Expert inputs (see ArabicaGrade, ElevationBand, ExtractionQuality, Cultivar)
  arabicaGrade?: ArabicaGrade;
  elevationBand?: ElevationBand;
  extractionQuality?: ExtractionQuality;
  /** Cultivar-based shift on the arabica caffeine fraction range.
   * Geisha: ~0.9–1.1 % (notably lower). SL28: ~1.3–1.7 % (higher, Kenyan).
   * Caturra: ~1.0–1.3 % (typical Bourbon-derived). Catimor: ~1.5–2.0 % (Robusta hybrid). */
  cultivar?: Cultivar;
};

export type CaffiLabEstimate = {
  estimatedMg: number;
  lowerMg: number;
  upperMg: number;
  practicalLowerMg: number;
  practicalUpperMg: number;
  beanLowerMg: number;
  beanUpperMg: number;
  concentrationMgPer100Ml: number;
  confidenceLabel: ConfidenceLabel;
  confidencePercent: number;
  beanUncertaintyPercent: number;
  brewingUncertaintyPercent: number;
  caffeineRecovery: number;
  caffeineFraction: number;
  caffeineFractionMin: number;
  caffeineFractionMax: number;
  effectiveCaffeineFraction: number;
  effectiveCaffeineFractionMin: number;
  effectiveCaffeineFractionMax: number;
  dilutionFactor: number;
  brewRatio: number;
  targetBrewRatio: number;
  coffeeGrams: number;
  brewWaterMl: number;
  beverageMl: number;
  dilutionMl: number;
  knownInputs: number;
  availableInputs: number;
  assumedBeanProfile: string;
  beanDetailLabel: string;
  extractionYieldPercent: number;
  explanation: string;
};

/**
 * BrewPhysics describes the dominant extraction mechanism. Four core physics
 * families (+ cold variants for methods that run at low temperature):
 *
 * - "pressure"        : High-pressure percolation (espresso). Extraction is governed by
 *                       pressure differential, grind resistance, and flow dynamics.
 *                       Time sensitivity is high but brew completes in < 60 s.
 *                       Temperature above ~88 °C is mandatory.
 *
 * - "percolation"     : Gravity-driven or vacuum/recirculating flow (pour over, Chemex,
 *                       drip machine, siphon, percolator). Water passes through the bed
 *                       once or recycles. Sensitive to grind, temperature, ratio, flow rate.
 *
 * - "immersion"       : Coffee steeps until separated (French press, Turkish). Extraction
 *                       follows an exponential saturation curve (τ ≈ 4 min). Turkish's
 *                       extra-fine grind and near-boiling temperature drive its default
 *                       recovery to the top of the immersion range.
 *
 * - "cold_immersion"  : Cold brew. Diffusivity follows Arrhenius kinetics; equilibrium is
 *                       approached over 8–24 h (Fuller & Rao, 2017). Time is dominant.
 *
 * - "cold_percolation": Cold drip (Kyoto). Same Arrhenius kinetics but per-particle
 *                       contact time is shorter, so the equilibrium ceiling is lower.
 *
 * - "hybrid"          : Combines two extraction mechanisms.
 *                       • AeroPress: immersion phase + manual pressure.
 *                       • Moka pot: steam pressure through a compacted basket
 *                         (pressure-percolation hybrid).
 *                       • Indian filter: gravity + steam-assisted slow drip with long
 *                         immersion characteristics (immersion-percolation hybrid).
 */
export type BrewPhysics =
  | "pressure"
  | "percolation"
  | "immersion"
  | "cold_immersion"
  | "cold_percolation"
  | "hybrid";

export type BrewMethodConfig = {
  label: string;
  /** Caffeine recovery baseline (fraction of available caffeine entering the beverage).
   *  Calibrated from published HPLC extraction studies per method. */
  defaultRecovery: number;
  defaultTimeMinutes: number;
  defaultGrind: GrindSize;
  defaultTemperatureC: number;
  ratioRange: [number, number];
  defaultYieldPercent: number;
  defaultFilter: FilterType;
  timeSensitivity: "low" | "medium" | "high" | "cold";
  grindSensitivity: "low" | "medium" | "high";
  supportsPressure?: boolean;
  supportsAgitation?: boolean;
  requiresTimeInput?: boolean;
  /** Dominant extraction physics — used to route to method-specific sub-models. */
  physics: BrewPhysics;
  /** Temperature floor below which the hot-extraction model should not apply. */
  minBrewTempC: number;
  note: string;
};

export const GRIND_SIZES: Record<GrindSize, { label: string; order: number }> = {
  extra_fine: { label: "Extra Fine (Turkish)", order: 0 },
  fine: { label: "Fine (Espresso)", order: 1 },
  medium_fine: { label: "Medium-Fine (Pour over - V60)", order: 2 },
  medium: { label: "Medium (Drip coffee makers)", order: 3 },
  medium_coarse: { label: "Medium-Coarse (Chemex)", order: 4 },
  coarse: { label: "Coarse (French press)", order: 5 },
  extra_coarse: { label: "Extra Coarse (Cold brew)", order: 6 },
};

export const BREW_METHODS: Record<BrewMethod, BrewMethodConfig> = {
  espresso: {
    label: "Espresso",
    // Recovery: Andueza et al. (2003) measured 60–80 % for 25–35 ml shots.
    // Ludwig et al. (2014) typical double shots: 68–72 %. 0.67 is conservative midpoint.
    defaultRecovery: 0.67,
    defaultTimeMinutes: 0.5,
    defaultGrind: "fine",
    defaultTemperatureC: 93,
    ratioRange: [1.8, 2.5],
    defaultYieldPercent: 20,
    defaultFilter: "metal",
    timeSensitivity: "high",
    grindSensitivity: "high",
    supportsPressure: true,
    physics: "pressure",
    minBrewTempC: 88,
    note: "High strength, short contact time, pressure-driven extraction.",
  },
  pour_over: {
    label: "Pour Over (V60)",
    // Recovery: Gloess et al. (2013) filter-drip methods 75–90 %; V60 at 1:15 sits ~82 %.
    defaultRecovery: 0.82,
    defaultTimeMinutes: 3.5,
    defaultGrind: "medium_fine",
    defaultTemperatureC: 94,
    ratioRange: [15, 17],
    defaultYieldPercent: 20,
    defaultFilter: "paper",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    supportsAgitation: true,
    physics: "percolation",
    minBrewTempC: 80,
    note: "A V60-style percolation brew usually sits around 1:15 to 1:17.",
  },
  chemex: {
    label: "Chemex",
    // Chemex thick bonded filter impedes flow; recovery ~78–82 % (Gloess et al., 2013).
    defaultRecovery: 0.79,
    defaultTimeMinutes: 4.5,
    defaultGrind: "medium_coarse",
    defaultTemperatureC: 94,
    ratioRange: [15, 18],
    defaultYieldPercent: 19,
    defaultFilter: "paper",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    supportsAgitation: true,
    physics: "percolation",
    minBrewTempC: 80,
    note: "Thicker bonded filter and coarser grind; slightly lower yield than V60.",
  },
  french_press: {
    label: "French Press",
    // Full immersion, metal mesh. Gloess et al. (2013): 78–84 %.
    defaultRecovery: 0.80,
    defaultTimeMinutes: 4,
    defaultGrind: "coarse",
    defaultTemperatureC: 94,
    ratioRange: [12, 16],
    defaultYieldPercent: 21,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "low",
    supportsAgitation: true,
    physics: "immersion",
    minBrewTempC: 80,
    note: "Full-immersion with metal mesh; equilibrium-driven extraction at coarse grind.",
  },
  cold_brew: {
    label: "Cold Brew",
    // Fuller & Rao (2017): cold brew at 12–16 h approaches 85–90 % of hot-brew
    // caffeine per gram at equivalent ratios. 0.83 is calibrated midpoint.
    defaultRecovery: 0.83,
    defaultTimeMinutes: 960,
    defaultGrind: "extra_coarse",
    defaultTemperatureC: 22,
    ratioRange: [4, 8],
    defaultYieldPercent: 18,
    defaultFilter: "cloth",
    timeSensitivity: "cold",
    grindSensitivity: "low",
    supportsAgitation: true,
    requiresTimeInput: true,
    physics: "cold_immersion",
    minBrewTempC: 0,
    note: "Long cold-water immersion; caffeine equilibrium approached after ~10 h.",
  },
  aeropress: {
    label: "AeroPress",
    // Gloess et al. (2013): AeroPress 72–79 % typical 2-min recipes.
    // Higher technique variance than any other method.
    defaultRecovery: 0.76,
    defaultTimeMinutes: 2,
    defaultGrind: "medium_fine",
    defaultTemperatureC: 88,
    ratioRange: [8, 14],
    defaultYieldPercent: 20,
    defaultFilter: "paper",
    timeSensitivity: "high",
    grindSensitivity: "medium",
    supportsAgitation: true,
    physics: "hybrid",
    minBrewTempC: 70,
    note: "Hybrid: immersion phase followed by manual pressure; technique variance is the largest uncertainty source.",
  },
  moka_pot: {
    label: "Moka Pot (Stovetop)",
    // 1–2 bar steam pressure. Espinosa-Álvarez et al. (2021): ~68–72 % recovery.
    defaultRecovery: 0.70,
    defaultTimeMinutes: 4,
    defaultGrind: "fine",
    defaultTemperatureC: 94,
    ratioRange: [7, 10],
    defaultYieldPercent: 20,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    physics: "hybrid",
    minBrewTempC: 88,
    note: "Pressure-percolation hybrid: steam pressure forced through a compacted fine-ground basket.",
  },
  drip_machine: {
    label: "Drip Coffee (Machine)",
    // Ludwig et al. (2014): well-calibrated drip machines 85–90 %.
    defaultRecovery: 0.85,
    defaultTimeMinutes: 5,
    defaultGrind: "medium",
    defaultTemperatureC: 93,
    ratioRange: [15, 18],
    defaultYieldPercent: 20,
    defaultFilter: "paper",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    physics: "percolation",
    minBrewTempC: 88,
    note: "Automatic percolation; calibrated flow rate and temperature.",
  },
  siphon: {
    label: "Siphon (Vacuum brew)",
    // Immersion + vacuum drawdown. Consistent temperature: ~80–85 %.
    defaultRecovery: 0.83,
    defaultTimeMinutes: 2,
    defaultGrind: "medium",
    defaultTemperatureC: 92,
    ratioRange: [14, 17],
    defaultYieldPercent: 20,
    defaultFilter: "cloth",
    timeSensitivity: "high",
    grindSensitivity: "medium",
    supportsAgitation: true,
    physics: "percolation",
    minBrewTempC: 80,
    note: "Vacuum-assisted percolation; drawdown ensures consistent contact temperature.",
  },
  turkish: {
    label: "Turkish Coffee",
    // Gloess et al. (2013): Turkish coffee 90–93 %.
    // Extra-fine grind, no filtration, near-boiling with multiple heat cycles.
    defaultRecovery: 0.91,
    defaultTimeMinutes: 3,
    defaultGrind: "extra_fine",
    defaultTemperatureC: 96,
    ratioRange: [8, 12],
    defaultYieldPercent: 24,
    defaultFilter: "none",
    timeSensitivity: "medium",
    grindSensitivity: "high",
    supportsAgitation: true,
    physics: "immersion",
    minBrewTempC: 90,
    note: "Full-immersion at near-boiling; extra-fine grind and no filtration drive recovery to the immersion ceiling.",
  },
  cold_drip: {
    label: "Cold Drip (Kyoto style)",
    // Lower than cold brew immersion due to shorter contact time. Est. 70–80 %.
    defaultRecovery: 0.76,
    defaultTimeMinutes: 480,
    defaultGrind: "extra_coarse",
    defaultTemperatureC: 22,
    ratioRange: [5, 10],
    defaultYieldPercent: 17,
    defaultFilter: "cloth",
    timeSensitivity: "cold",
    grindSensitivity: "low",
    requiresTimeInput: true,
    physics: "cold_percolation",
    minBrewTempC: 0,
    note: "Slow cold-water drip; shorter per-particle contact than immersion cold brew.",
  },
  immersion: {
    label: "Immersion Brew",
    // General hot immersion (Clever, cupping). Equivalent to French press profile.
    defaultRecovery: 0.81,
    defaultTimeMinutes: 4,
    defaultGrind: "coarse",
    defaultTemperatureC: 93,
    ratioRange: [12, 16],
    defaultYieldPercent: 21,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "low",
    supportsAgitation: true,
    physics: "immersion",
    minBrewTempC: 80,
    note: "General hot immersion: Clever, cupping, steep-and-release.",
  },
  percolator: {
    label: "Percolator",
    // Near-boiling + multiple passes: 88–93 % (Ludwig et al., 2014).
    defaultRecovery: 0.90,
    defaultTimeMinutes: 7,
    defaultGrind: "coarse",
    defaultTemperatureC: 96,
    ratioRange: [14, 18],
    defaultYieldPercent: 22,
    defaultFilter: "metal",
    timeSensitivity: "high",
    grindSensitivity: "medium",
    physics: "percolation",
    minBrewTempC: 90,
    note: "Recirculating percolation; near-boiling temperature and multiple hot-water passes drive high extraction.",
  },
  indian_filter: {
    label: "Indian Filter Coffee",
    // Gravity + steam-assisted percolation through fine metal filter.
    // Closer to moka pot dynamics. Recovery ~70–75 %.
    defaultRecovery: 0.73,
    defaultTimeMinutes: 12,
    defaultGrind: "fine",
    defaultTemperatureC: 96,
    ratioRange: [4, 7],
    defaultYieldPercent: 22,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    physics: "hybrid",
    minBrewTempC: 88,
    note: "Immersion-percolation hybrid: gravity and steam-assisted slow drip with long contact time.",
  },
};

const F_RANGE = {
  arabica: { min: 0.01, max: 0.016 },
  robusta: { min: 0.02, max: 0.027 },
} as const;
const DEFAULT_BLEND = { arabica: 70, robusta: 30 };
const DEFAULT_INDIAN_CHICORY_PERCENT = 20;

const CURRENCY_TO_USD: Record<PriceCurrency, number> = {
  INR: 0.012,
  USD: 1,
  EUR: 1.08,
  GBP: 1.25,
  AUD: 0.65,
  CAD: 0.73,
  SGD: 0.74,
  JPY: 0.0067,
  AED: 0.272,
};

const UNCERTAINTY_WEIGHTS = {
  beanType: 8,
  priceInference: 4,
  packageClue: 5,
  brewTime: 5,
  dilution: 4,
  brewRatio: 5,
  grindSize: 3,
  roast: 3,
  temperature: 4,
  extractionYield: 6,
  pressure: 2,
  agitation: 2,
  water: 3,
  freshness: 3,
  filter: 2,
  chicory: 3,
  arabicaGrade: 3,
  elevationBand: 2,
  extractionQuality: 4,
  cultivar: 3,
};

export function toGrams(amount: number, unit: WeightUnit) {
  if (unit === "lb") {
    return amount * 453.59237;
  }

  if (unit === "oz") {
    return amount * 28.349523125;
  }

  return amount;
}

export function toMilliliters(amount: number, unit: VolumeUnit) {
  if (unit === "l") {
    return amount * 1000;
  }

  if (unit === "fl_oz") {
    return amount * 29.5735295625;
  }

  return amount;
}

export function toMinutes(amount: number, unit: TimeUnit) {
  return unit === "hr" ? amount * 60 : amount;
}

export function toCelsius(amount: number, unit: TemperatureUnit) {
  return unit === "f" ? (amount - 32) * (5 / 9) : amount;
}

export function defaultBrewTimeValue(method: BrewMethod, unit: TimeUnit) {
  const minutes = BREW_METHODS[method].defaultTimeMinutes;
  return unit === "hr" ? minutes / 60 : minutes;
}

export function defaultTemperatureValue(method: BrewMethod, unit: TemperatureUnit) {
  const celsius = BREW_METHODS[method].defaultTemperatureC;
  return unit === "f" ? celsius * (9 / 5) + 32 : celsius;
}

export function defaultBrewWaterMl(method: BrewMethod, coffeeGrams: number) {
  const [low, high] = BREW_METHODS[method].ratioRange;
  return coffeeGrams * ((low + high) / 2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value);
}

function midpoint(min: number, max: number) {
  return (min + max) / 2;
}

function normalizePercent(value: number | undefined, fallback: number) {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return clamp(value, 0, 100);
}

function getConfidenceLabel(confidencePercent: number): ConfidenceLabel {
  if (confidencePercent >= 25) {
    return "Low";
  }

  if (confidencePercent >= 15) {
    return "Medium";
  }

  if (confidencePercent >= 8) {
    return "High";
  }

  return "Very High";
}

function getBeanDetailLabel(beanDetail: BeanDetail, customCaffeinePercent: number | undefined) {
  if (beanDetail === "high_altitude") {
    return "High-altitude profile";
  }

  if (beanDetail === "low_altitude") {
    return "Low-altitude profile";
  }

  if (beanDetail === "custom") {
    return customCaffeinePercent !== undefined
      ? `Custom caffeine content (${customCaffeinePercent.toFixed(2)}%)`
      : "Custom caffeine content";
  }

  return "Generic species range";
}

function getBeanDetailWindow(beanDetail: BeanDetail) {
  if (beanDetail === "high_altitude") {
    return { start: 0, end: 0.5 };
  }

  if (beanDetail === "low_altitude") {
    return { start: 0.5, end: 1 };
  }

  return { start: 0, end: 1 };
}

function adjustSpeciesRange(
  range: { min: number; max: number },
  beanDetail: BeanDetail,
  customCaffeinePercent: number | undefined,
) {
  if (beanDetail === "custom") {
    const fraction = clamp((customCaffeinePercent ?? midpoint(range.min, range.max) * 100) / 100, 0.001, 0.06);
    return { min: fraction, max: fraction };
  }

  const { start, end } = getBeanDetailWindow(beanDetail);
  const width = range.max - range.min;

  return {
    min: range.min + width * start,
    max: range.min + width * end,
  };
}

function getPackageClueProfile(clue: PackageClue | undefined) {
  if (clue === "specialty_single_origin") {
    return {
      arabica: 90,
      robusta: 10,
      label: "Package clue suggests an Arabica-forward specialty coffee",
      inferred: true,
      strength: "package" as const,
    };
  }

  if (clue === "espresso_blend") {
    return {
      arabica: 75,
      robusta: 25,
      label: "Package clue suggests a classic Arabica-Robusta espresso blend",
      inferred: true,
      strength: "package" as const,
    };
  }

  if (clue === "south_indian_filter") {
    return {
      arabica: 50,
      robusta: 50,
      label: "Package clue suggests a robusta-capable South Indian filter blend",
      inferred: true,
      strength: "package" as const,
    };
  }

  if (clue === "commercial_instant") {
    return {
      arabica: 25,
      robusta: 75,
      label: "Package clue suggests a robusta-forward commercial coffee",
      inferred: true,
      strength: "package" as const,
    };
  }

  return null;
}

function inferBeanFromPrice(input: CaffiLabInput) {
  const packageProfile = getPackageClueProfile(input.packageClue);

  if (packageProfile) {
    return packageProfile;
  }

  const price = input.coffeePrice;

  if (!price || price <= 0 || !input.priceCurrency || !input.priceUnit) {
    return {
      arabica: 100,
      robusta: 0,
      label: "Unknown bean type: conservative Arabica baseline",
      inferred: false,
      strength: "none" as const,
    };
  }

  const usdPerKg =
    (price * CURRENCY_TO_USD[input.priceCurrency]) /
    (input.priceUnit === "lb" ? 0.45359237 : 1);
  const usdPerLb = usdPerKg * 0.45359237;

  if (usdPerLb < 6) {
    return {
      arabica: 30,
      robusta: 70,
      label: "Price suggests a robusta-forward value blend",
      inferred: true,
      strength: "price" as const,
    };
  }

  if (usdPerLb < 15) {
    return {
      arabica: 60,
      robusta: 40,
      label: "Price suggests a mixed Arabica-Robusta blend",
      inferred: true,
      strength: "price" as const,
    };
  }

  return {
    arabica: 85,
    robusta: 15,
    label: "Price suggests an Arabica-forward specialty coffee",
    inferred: true,
    strength: "price" as const,
  };
}

function getBeanProfile(input: CaffiLabInput) {
  if (input.beanType === "arabica") {
    return { arabica: 100, robusta: 0, label: "100% Arabica", inferred: false, strength: "direct" as const };
  }

  if (input.beanType === "robusta") {
    return { arabica: 0, robusta: 100, label: "100% Robusta", inferred: false, strength: "direct" as const };
  }

  if (input.beanType === "blend") {
    const arabica = normalizePercent(input.arabicaPercent, DEFAULT_BLEND.arabica);
    const robusta = normalizePercent(input.robustaPercent, 100 - arabica);
    const total = Math.max(arabica + robusta, 1);

    return {
      arabica: (arabica / total) * 100,
      robusta: (robusta / total) * 100,
      label: `${round((arabica / total) * 100)}% Arabica / ${round((robusta / total) * 100)}% Robusta blend`,
      inferred: false,
      strength: "direct" as const,
    };
  }

  return inferBeanFromPrice(input);
}

function getBeanFractionRange(input: CaffiLabInput, beanProfile: ReturnType<typeof getBeanProfile>) {
  const beanDetail = input.beanDetail ?? "generic";

  // Architecture: F = f(species, quality, elevation, cultivar, roast)

  // Step 1 — Determine base arabica range, optionally narrowed by quality grade.
  //           Custom caffeine % bypasses grade narrowing: the user value is already final.
  const arabicaBaseRange =
    beanDetail !== "custom" && input.arabicaGrade !== undefined
      ? getArabicaBaseRange(input.arabicaGrade)
      : F_RANGE.arabica;

  // Step 2 — Apply bean detail window (high_altitude / low_altitude / custom / generic).
  const arabicaRange = adjustSpeciesRange(arabicaBaseRange, beanDetail, input.customCaffeinePercent);
  const robustaRange = adjustSpeciesRange(F_RANGE.robusta, beanDetail, input.customCaffeinePercent);

  // Step 3 — Blend arabica + robusta fractions.
  let blendedMin =
    (beanProfile.arabica / 100) * arabicaRange.min +
    (beanProfile.robusta / 100) * robustaRange.min;
  let blendedMax =
    (beanProfile.arabica / 100) * arabicaRange.max +
    (beanProfile.robusta / 100) * robustaRange.max;

  // Steps 4–6 — Expert adjustments are skipped for custom caffeine % because the
  //             user-supplied value already reflects roasted-bean final content.
  if (beanDetail !== "custom") {
    // Step 4 — Elevation shift: higher altitude → slightly higher caffeine fraction.
    const elevation = input.elevationBand;
    if (elevation !== undefined && elevation !== "unknown") {
      const shift = getElevationShift(elevation, blendedMin, blendedMax);
      blendedMin = Math.max(0.001, blendedMin + shift);
      blendedMax = Math.max(blendedMin, blendedMax + shift);
    }

    // Step 5 — Roast mass-balance: roasting converts ~1–4 % of caffeine to methyluric acids.
    const massBalance = getRoastMassBalance(input.roastLevel);
    blendedMin *= massBalance;
    blendedMax *= massBalance;

    // Step 6 — Cultivar adjustment: shift range based on per-cultivar HPLC data.
    // Only meaningful for arabica or arabica-dominant blends; weighted by arabica proportion.
    if (input.cultivar !== undefined && input.cultivar !== "unknown" && beanProfile.arabica > 0) {
      const rawShift = getCultivarShift(input.cultivar);
      const shift = rawShift * (beanProfile.arabica / 100);
      blendedMin = Math.max(0.001, blendedMin + shift);
      blendedMax = Math.max(blendedMin, blendedMax + shift);
    }
  }

  return {
    min: blendedMin,
    max: blendedMax,
    detailLabel: getBeanDetailLabel(beanDetail, input.customCaffeinePercent),
  };
}

function getRoastAdjustment(roastLevel: RoastLevel) {
  // Medium roast is the reference point (zero adjustment).
  // Light roasts retain slightly more caffeine per gram: Ludwig et al. (2014) found
  // ~2–3% higher caffeine in light vs medium filter brews.
  // Dark roast penalty kept modest: HPLC studies show only 2–3% difference vs medium,
  // not the 3.5% that was previously applied.
  if (roastLevel === "light") {
    return 0.012;
  }

  if (roastLevel === "dark") {
    return -0.018;
  }

  return 0;
}

function getGrindAdjustment(method: BrewMethodConfig, grindSize: GrindSize) {
  const selectedOrder = GRIND_SIZES[grindSize].order;
  const defaultOrder = GRIND_SIZES[method.defaultGrind].order;
  const delta = defaultOrder - selectedOrder;

  if (method.timeSensitivity === "cold") {
    if (grindSize === "coarse" || grindSize === "extra_coarse") {
      return 0.01;
    }

    if (selectedOrder < GRIND_SIZES.coarse.order) {
      return -0.01;
    }

    return 0;
  }

  const sensitivity =
    method.grindSensitivity === "high" ? 0.018 : method.grindSensitivity === "medium" ? 0.012 : 0.006;

  return clamp(delta * sensitivity, -0.045, 0.045);
}

function getTimeAdjustment(method: BrewMethodConfig, brewTimeMinutes: number) {
  const target = Math.max(method.defaultTimeMinutes, 0.1);
  const ratio = brewTimeMinutes / target;

  if (method.timeSensitivity === "cold") {
    if (brewTimeMinutes <= 0) {
      return -0.2;
    }

    const equilibrium = 420;
    const normalized = (1 - Math.exp(-brewTimeMinutes / equilibrium)) / (1 - Math.exp(-target / equilibrium));
    return clamp((normalized - 1) * 0.08, -0.16, 0.04);
  }

  const sensitivity =
    method.timeSensitivity === "high" ? 0.07 : method.timeSensitivity === "medium" ? 0.045 : 0.02;

  return clamp((ratio - 1) * sensitivity, -0.08, 0.07);
}

function getTemperatureAdjustment(method: BrewMethodConfig, temperatureC: number) {
  if (method.timeSensitivity === "cold") {
    return clamp((temperatureC - method.defaultTemperatureC) * 0.002, -0.025, 0.025);
  }

  return clamp((temperatureC - method.defaultTemperatureC) * 0.0025, -0.045, 0.045);
}

function getRatioAdjustment(method: BrewMethodConfig, brewRatio: number) {
  const midpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
  return clamp(((brewRatio - midpoint) / midpoint) * 0.055, -0.045, 0.045);
}

function getExtractionYieldAdjustment(method: BrewMethodConfig, extractionYieldPercent: number) {
  return clamp((extractionYieldPercent - method.defaultYieldPercent) * 0.008, -0.06, 0.06);
}

function getPressureAdjustment(method: BrewMethodConfig, pressureBars: number | undefined) {
  if (!method.supportsPressure || pressureBars === undefined) {
    return 0;
  }

  // E₀ is already calibrated at 9 bar; model only the signed deviation from reference.
  // Above 9 bar: modest over-pressure boost. Below 9 bar: under-extraction penalty.
  return clamp((pressureBars - 9) * 0.004, -0.025, 0.010);
}

function getAgitationAdjustment(method: BrewMethodConfig, agitation: AgitationLevel) {
  if (!method.supportsAgitation) {
    return 0;
  }

  if (agitation === "gentle") {
    return 0.008;
  }

  if (agitation === "moderate") {
    return 0.018;
  }

  if (agitation === "high") {
    return 0.026;
  }

  return 0;
}

function getWaterAdjustment(waterMinerals: WaterMinerals, waterPh: number | undefined) {
  // Caffeine extraction is relatively mineral-independent compared to aromatic compounds
  // (Hendon et al., 2014 focused primarily on flavor-active acids, not caffeine).
  // Penalties are reduced accordingly; balanced water is kept as a mild positive signal.
  let adjustment = 0;

  if (waterMinerals === "soft") {
    adjustment -= 0.005;
  } else if (waterMinerals === "balanced") {
    adjustment += 0.005;
  } else if (waterMinerals === "hard") {
    adjustment -= 0.007;
  }

  if (waterPh !== undefined) {
    // Caffeine pKa ~10.4: neutral across the entire brewing pH range (6–8).
    // Slightly acidic water has a minor positive effect on caffeine solubility;
    // alkaline water (>7.8) slightly inhibits extraction.
    if (waterPh < 6.5) {
      adjustment += 0.003;
    } else if (waterPh > 7.8) {
      adjustment -= 0.006;
    }
  }

  return adjustment;
}

function getFreshnessAdjustment(freshness: Freshness) {
  // Fresh beans: CO2 off-gassing can impede even extraction (channeling in espresso,
  // uneven wetting in pour-over), justifying a small extraction penalty.
  // Stale beans: caffeine is thermostable and oxidation-resistant; staleness mainly
  // degrades volatile aromatics, not caffeine content. Penalty reduced accordingly.
  if (freshness === "fresh") {
    return -0.008;
  }

  if (freshness === "stale") {
    return -0.010;
  }

  return 0;
}

function getFilterAdjustment(filterType: FilterType) {
  if (filterType === "paper") {
    return -0.004;
  }

  if (filterType === "metal" || filterType === "none") {
    return 0.006;
  }

  return 0;
}

function getMinorAdjustment(
  waterMinerals: WaterMinerals,
  waterPh: number | undefined,
  freshness: Freshness,
  filterType: FilterType,
): number {
  // Group weak secondary variables into a single bounded factor.
  // Each individual source is small; clamping prevents stacking of marginal
  // signals into a spuriously large combined effect.
  return clamp(
    getWaterAdjustment(waterMinerals, waterPh) +
      getFreshnessAdjustment(freshness) +
      getFilterAdjustment(filterType),
    -0.02,
    0.02,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expert-mode helpers  (Architecture: F = f(species, quality, elevation, cultivar, roast))
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the base arabica caffeine-fraction range for the given quality tier. */
function getArabicaBaseRange(grade: ArabicaGrade): { min: number; max: number } {
  if (grade === "commercial") return { min: 0.010, max: 0.012 };
  if (grade === "specialty") return { min: 0.012, max: 0.016 };
  return F_RANGE.arabica;
}

/** Shifts the blended caffeine-fraction range based on growing elevation.
 * Higher altitude → small upward shift (±15 % of the current range width). */
function getElevationShift(elevationBand: ElevationBand, min: number, max: number): number {
  const width = max - min;
  if (elevationBand === "high") return width * 0.15;
  if (elevationBand === "low") return -width * 0.15;
  return 0;
}

/** Returns the caffeine-fraction multiplier representing roasting mass loss.
 * Literature: 1–5 % of caffeine is converted to methyluric acids during roasting. */
function getRoastMassBalance(roastLevel: RoastLevel): number {
  if (roastLevel === "light") return 0.99; // ~1 % loss
  if (roastLevel === "dark") return 0.96;  // ~4 % loss
  return 0.98;                             // medium: ~2 % loss
}

/** Adjusts extraction recovery for espresso channeling / puck preparation quality.
 * Only active for pressure-based methods. Architecture: E = f(…, technique). */
function getExtractionQualityAdjustment(
  method: BrewMethodConfig,
  quality: ExtractionQuality | undefined,
): number {
  if (!method.supportsPressure || quality === undefined || quality === "average") {
    return 0;
  }
  if (quality === "poor") return -0.09;        // channeling / uneven puck
  if (quality === "well_prepared") return 0.03; // clean puck, consistent extraction
  return 0;
}

// Cultivar scaffold: per-cultivar F-range data not yet calibrated.
// getCultivarAdjustment will return a meaningful shift once data is confirmed.

/**
 * Returns the absolute shift (in dry-weight caffeine fraction) for a named cultivar,
 * applied to the arabica-weighted portion of the blended range.
 *
 * Calibration sources:
 * - Geisha (~0.9–1.1 %): Ky et al. (2001); Panama Geisha HPLC studies.
 * - SL28 (~1.3–1.7 %): Bertrand et al. (2003); Kenyan cultivar assessments.
 * - Caturra (~1.0–1.3 %): Bourbon-derived, typical mid-range arabica.
 * - Catimor (~1.5–2.0 %): Timor hybrid with Robusta genes (Ky et al., 2001).
 */
function getCultivarShift(cultivar: Cultivar | undefined): number {
  switch (cultivar) {
    case "geisha":  return -0.002; // ~−0.2 % dry-weight — distinctly lower caffeine
    case "sl28":   return  0.002; // ~+0.2 % dry-weight — Kenyan high-caffeine variety
    case "caturra": return -0.001; // slight below-midpoint Bourbon derivative
    case "catimor": return  0.004; // ~+0.4 % dry-weight — Robusta-introgressed hybrid
    default:        return  0;     // unknown — no shift
  }
}

function getCaffeineRecovery(
  method: BrewMethodConfig,
  input: CaffiLabInput,
  brewRatio: number,
  brewTimeMinutes: number,
  grindSize: GrindSize,
  temperatureC: number,
  extractionYieldPercent: number,
) {
  // Shared adjustments applied by all sub-models unless overridden.
  const minorAdj = getMinorAdjustment(input.waterMinerals, input.waterPh, input.freshness, input.filterType);
  const roastAdj = getRoastAdjustment(input.roastLevel);
  const yieldAdj = getExtractionYieldAdjustment(method, extractionYieldPercent);

  switch (method.physics) {

    // ── Pressure-driven (espresso) ───────────────────────────────────────────
    //
    // E = E_base × (1 + ΔP + ΔG + ΔT + ΔTime + ΔRatio + ΔYield + ΔTechnique + shared)
    //
    // Key physics: pressure differential drives rapid extraction through a compacted bed.
    // Andueza et al. (2003): extraction peaks near 9 bar. Grind controls flow resistance
    // and surface area. Time is high-sensitivity but bounded to the pull window (20–35 s).
    // Ratio effect is muted: a wider pull mainly dilutes rather than raising caffeine %.
    case "pressure": {
      const pressureAdj = getPressureAdjustment(method, input.pressureBars);
      const grindAdj = getGrindAdjustment(method, grindSize);
      const tempAdj = getTemperatureAdjustment(method, temperatureC);
      const timeAdj = getTimeAdjustment(method, brewTimeMinutes);
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.025, -0.025, 0.025);
      const techniqueAdj = getExtractionQualityAdjustment(method, input.extractionQuality);
      const totalDelta =
        pressureAdj + grindAdj + tempAdj + timeAdj +
        ratioAdj + yieldAdj + techniqueAdj +
        roastAdj + minorAdj;
      return clamp(method.defaultRecovery * (1 + totalDelta), 0.45, 0.88);
    }

    // ── Gravity / vacuum / recirculating percolation ─────────────────────────
    // (pour_over, chemex, drip_machine, siphon, percolator)
    //
    // E = E_base × (1 + ΔG + ΔT + ΔTime + ΔRatio + ΔAgitation + ΔYield + shared)
    //
    // Key physics: water passes through the bed (once for gravity methods; vacuum
    // drawdown for siphon; recirculating for percolator). Gloess et al. (2013): filter
    // methods reach 75–90 %. Ratio has a larger effect than for pressure methods since
    // more solvent through the same bed extracts a higher fraction up to the ceiling.
    // Percolator's defaultRecovery (0.90) encodes near-boiling + recirculation.
    case "percolation": {
      const grindAdj = getGrindAdjustment(method, grindSize);
      const tempAdj = getTemperatureAdjustment(method, temperatureC);
      const timeAdj = getTimeAdjustment(method, brewTimeMinutes);
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      // Higher ratio = more solvent → higher % extraction (up to ceiling).
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.040, -0.035, 0.035);
      const agitAdj = getAgitationAdjustment(method, input.agitation);
      const totalDelta =
        grindAdj + tempAdj + timeAdj +
        ratioAdj + agitAdj + yieldAdj +
        roastAdj + minorAdj;
      return clamp(method.defaultRecovery * (1 + totalDelta), 0.55, 0.97);
    }

    // ── Hot immersion (french_press, turkish, immersion) ────────────────────
    //
    // E = E_base × (1 + ΔTime + ΔG + ΔT + ΔRatio + ΔAgitation + ΔYield + shared)
    //
    // Key physics: coffee steeps in water until mechanically separated. Extraction
    // follows an exponential saturation curve (τ = 4 min); equilibrium near ~8 min.
    // Turkish's ultra-fine grind, no filtration, and near-boiling temperature push
    // its defaultRecovery (0.91) to the top of the immersion range. Adjustments
    // scale multiplicatively from each method's calibrated baseline.
    case "immersion": {
      const tau = 4.0; // minutes to ~63 % of equilibrium extraction
      const eqTime = method.defaultTimeMinutes; // reference equilibrium time
      const normalized = (1 - Math.exp(-brewTimeMinutes / tau)) /
                         (1 - Math.exp(-eqTime / tau));
      const timeAdj = clamp((normalized - 1) * 0.07, -0.12, 0.04);

      const grindAdj = getGrindAdjustment(method, grindSize);
      const tempAdj = getTemperatureAdjustment(method, temperatureC);
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.020, -0.020, 0.020);
      const agitAdj = getAgitationAdjustment(method, input.agitation);
      const totalDelta =
        timeAdj + grindAdj + tempAdj +
        ratioAdj + agitAdj + yieldAdj +
        roastAdj + minorAdj;
      return clamp(method.defaultRecovery * (1 + totalDelta), 0.55, 0.95);
    }

    // ── Cold immersion (cold_brew) ───────────────────────────────────────────
    //
    // Diffusivity follows Arrhenius kinetics. Fuller & Rao (2017): cold brew at
    // 12–16 h approaches hot-brew caffeine recovery at equivalent ratios.
    // τ = 420 min at 22 °C. Secondary factors applied multiplicatively to the
    // Arrhenius base (cold base recovery).
    case "cold_immersion": {
      if (brewTimeMinutes <= 0) return method.defaultRecovery - 0.20;

      // Temperature scaling: k ∝ exp(-Ea/RT). Using simplified ratio relative to 22 °C.
      // At 4 °C (fridge): k ≈ 0.55 × k(22°C). At 30 °C: k ≈ 1.25 × k(22°C).
      const tempRatio = temperatureC <= 0 ? 0.4 : Math.exp(0.025 * (temperatureC - 22));
      const tau = 420 / Math.max(tempRatio, 0.1); // effective τ in minutes

      // Equilibrium recovery ceiling (cannot match hot extraction):
      const recoveryEquilibrium = 0.88;
      // Fractional approach to equilibrium:
      const fractional = 1 - Math.exp(-brewTimeMinutes / tau);
      const coldBaseRecovery = recoveryEquilibrium * fractional;

      // Grind: minimal effect after equilibrium is approached.
      const grindAdj = clamp(getGrindAdjustment(method, grindSize) * 0.3, -0.012, 0.012);
      const agitAdj = getAgitationAdjustment(method, input.agitation) * 0.5;
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.015, -0.015, 0.015);

      const totalDelta =
        grindAdj + agitAdj + ratioAdj +
        roastAdj + minorAdj;
      return clamp(coldBaseRecovery * (1 + totalDelta), 0.30, 0.90);
    }

    // ── Cold percolation (cold_drip) ─────────────────────────────────────────
    //
    // Same Arrhenius kinetics as cold immersion but each water drop has limited
    // contact time per particle — equilibrium is never reached. Recovery ceiling
    // is lower (0.80 vs 0.88 for cold immersion).
    case "cold_percolation": {
      if (brewTimeMinutes <= 0) return method.defaultRecovery - 0.15;

      const tempRatio = temperatureC <= 0 ? 0.4 : Math.exp(0.025 * (temperatureC - 22));
      const tau = 420 / Math.max(tempRatio, 0.1);

      const recoveryEquilibrium = 0.80;
      const fractional = 1 - Math.exp(-brewTimeMinutes / tau);
      const coldBaseRecovery = recoveryEquilibrium * fractional;

      const grindAdj = clamp(getGrindAdjustment(method, grindSize) * 0.2, -0.010, 0.010);
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.015, -0.015, 0.015);

      const totalDelta =
        grindAdj + ratioAdj +
        roastAdj + minorAdj;
      return clamp(coldBaseRecovery * (1 + totalDelta), 0.25, 0.83);
    }

    // ── Hybrid (aeropress, moka_pot, indian_filter) ──────────────────────────
    //
    // E = E_base × (1 + ΔTime + ΔG + ΔT + ΔRatio + ΔAgitation + ΔPressure + shared)
    //
    // Three hybrid sub-types share this physics class:
    //   • AeroPress (immersion + pressure): short steep (τ = 2.5 min) + manual press.
    //     Detected by timeSensitivity === "high" and defaultTimeMinutes ≤ 2.5.
    //   • Moka pot (pressure-percolation): steam pressure through compacted basket.
    //     Standard medium-sensitivity time/grind adjustments apply.
    //   • Indian filter (immersion-percolation): gravity + steam-assisted slow drip.
    //     Long contact time; standard medium-sensitivity adjustments apply.
    case "hybrid": {
      const grindAdj = getGrindAdjustment(method, grindSize);
      const tempAdj = getTemperatureAdjustment(method, temperatureC);
      const ratioMidpoint = (method.ratioRange[0] + method.ratioRange[1]) / 2;
      const ratioAdj = clamp(((brewRatio - ratioMidpoint) / ratioMidpoint) * 0.025, -0.025, 0.025);
      const agitAdj = getAgitationAdjustment(method, input.agitation);
      const pressureAdj = getPressureAdjustment(method, input.pressureBars) * 0.5;
      // AeroPress: short immersion — exponential saturation curve (τ = 2.5 min).
      // Moka / Indian Filter: standard linear time adjustment.
      const isShortImmersion =
        method.timeSensitivity === "high" && method.defaultTimeMinutes <= 2.5;
      let timeAdj: number;
      if (isShortImmersion) {
        const tau = 2.5;
        const eqTime = method.defaultTimeMinutes;
        const normalized = (1 - Math.exp(-brewTimeMinutes / tau)) /
                           (1 - Math.exp(-eqTime / tau));
        timeAdj = clamp((normalized - 1) * 0.08, -0.12, 0.05);
      } else {
        timeAdj = getTimeAdjustment(method, brewTimeMinutes);
      }
      const totalDelta =
        timeAdj + grindAdj + tempAdj +
        ratioAdj + agitAdj + pressureAdj + yieldAdj +
        roastAdj + minorAdj;
      return clamp(method.defaultRecovery * (1 + totalDelta), 0.48, 0.88);
    }
  }
}

function getBrewingUncertaintyPercent(
  input: CaffiLabInput,
  beanProfileStrength: "direct" | "package" | "price" | "none",
  method: BrewMethodConfig,
) {
  let uncertainty = 36;

  if (input.beanType !== "unknown") {
    uncertainty -= UNCERTAINTY_WEIGHTS.beanType;
  } else if (beanProfileStrength === "package") {
    uncertainty -= UNCERTAINTY_WEIGHTS.packageClue;
  } else if (beanProfileStrength === "price") {
    uncertainty -= UNCERTAINTY_WEIGHTS.priceInference;
  }

  if (input.brewTimeAmount !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.brewTime;
  }

  if (input.dilutionAmount !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.dilution;
  }

  uncertainty -= UNCERTAINTY_WEIGHTS.brewRatio;
  uncertainty -= UNCERTAINTY_WEIGHTS.grindSize;
  uncertainty -= UNCERTAINTY_WEIGHTS.roast;
  uncertainty -= UNCERTAINTY_WEIGHTS.filter;

  if (input.temperatureAmount !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.temperature;
  }

  if (input.extractionYieldPercent !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.extractionYield;
  }

  if (input.pressureBars !== undefined && method.supportsPressure) {
    uncertainty -= UNCERTAINTY_WEIGHTS.pressure;
  }

  if (input.agitation !== "none") {
    uncertainty -= UNCERTAINTY_WEIGHTS.agitation;
  }

  if (input.waterMinerals !== "unknown" || input.waterPh !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.water;
  }

  if (input.freshness !== "unknown") {
    uncertainty -= UNCERTAINTY_WEIGHTS.freshness;
  }

  if (input.brewMethod === "indian_filter" && input.chicoryPercent !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.chicory;
  }

  // Expert inputs
  if (input.arabicaGrade !== undefined && (input.beanType === "arabica" || input.beanType === "blend")) {
    uncertainty -= UNCERTAINTY_WEIGHTS.arabicaGrade;
  }

  if (input.elevationBand !== undefined && input.elevationBand !== "unknown") {
    uncertainty -= UNCERTAINTY_WEIGHTS.elevationBand;
  }

  if (method.supportsPressure && input.extractionQuality !== undefined) {
    uncertainty -= UNCERTAINTY_WEIGHTS.extractionQuality;
    // Poor technique has higher inherent variance; partially cancel the credit.
    if (input.extractionQuality === "poor") {
      uncertainty += 5;
    }
  }

  if (
    input.cultivar !== undefined &&
    input.cultivar !== "unknown" &&
    (input.beanType === "arabica" || input.beanType === "blend")
  ) {
    uncertainty -= UNCERTAINTY_WEIGHTS.cultivar;
  }

  // Method-class inherent technique variance adjustments.
  // AeroPress (hybrid): recipe-style variation (inverted vs standard, ratio, steep time)
  // is the largest single uncertainty source for this method. Add +5 % base penalty.
  if (method.physics === "hybrid") {
    uncertainty += 5;
  }

  // Cold methods: temperature at brew time is typically unknown and strongly
  // affects extraction rate. Add +3 % base penalty for cold methods.
  if (method.physics === "cold_immersion" || method.physics === "cold_percolation") {
    uncertainty += 3;
  }

  return clamp(uncertainty, 5, 35);
}

function getBeanUncertaintyPercent(caffeineFractionMin: number, caffeineFractionMax: number) {
  const fractionMid = midpoint(caffeineFractionMin, caffeineFractionMax);

  if (fractionMid <= 0) {
    return 0;
  }

  return ((caffeineFractionMax - caffeineFractionMin) / (2 * fractionMid)) * 100;
}

function getInputCountBuckets(input: CaffiLabInput) {
  const method = BREW_METHODS[input.brewMethod];

  return [
    {
      applicable: true,
      known:
        input.beanType !== "unknown" ||
        Boolean(input.coffeePrice) ||
        (input.packageClue !== undefined && input.packageClue !== "none"),
    },
    { applicable: true, known: input.brewTimeAmount !== undefined },
    { applicable: true, known: input.dilutionAmount !== undefined },
    {
      applicable: true,
      known: input.coffeeAmount > 0 && input.brewWaterAmount > 0,
    },
    { applicable: true, known: Boolean(input.grindSize) },
    { applicable: true, known: Boolean(input.roastLevel) },
    { applicable: true, known: input.temperatureAmount !== undefined },
    { applicable: true, known: input.extractionYieldPercent !== undefined },
    {
      applicable: method.supportsPressure ?? false,
      known: method.supportsPressure ? input.pressureBars !== undefined : false,
    },
    {
      applicable: method.supportsAgitation ?? false,
      known: method.supportsAgitation ? input.agitation !== "none" : false,
    },
    {
      applicable: true,
      known: input.waterMinerals !== "unknown" || input.waterPh !== undefined,
    },
    { applicable: true, known: input.freshness !== "unknown" },
    { applicable: true, known: Boolean(input.filterType) },
    {
      applicable: true,
      known: input.beanDetail !== undefined && input.beanDetail !== "generic",
    },
    {
      applicable: input.beanDetail === "custom",
      known: input.beanDetail === "custom" && input.customCaffeinePercent !== undefined,
    },
    {
      applicable: input.brewMethod === "indian_filter",
      known: input.brewMethod === "indian_filter" && input.chicoryPercent !== undefined,
    },
    {
      applicable: input.beanType === "arabica" || input.beanType === "blend",
      known:
        (input.beanType === "arabica" || input.beanType === "blend") &&
        input.arabicaGrade !== undefined,
    },
    {
      applicable: true,
      known: input.elevationBand !== undefined && input.elevationBand !== "unknown",
    },
    {
      applicable: method.supportsPressure ?? false,
      known: method.supportsPressure ? input.extractionQuality !== undefined : false,
    },
    {
      applicable: input.beanType === "arabica" || input.beanType === "blend",
      known:
        (input.beanType === "arabica" || input.beanType === "blend") &&
        input.cultivar !== undefined &&
        input.cultivar !== "unknown",
    },
  ];
}

function getKnownInputCount(input: CaffiLabInput) {
  return getInputCountBuckets(input).filter((bucket) => bucket.applicable && bucket.known).length;
}

function getAvailableInputCount(input: CaffiLabInput) {
  return getInputCountBuckets(input).filter((bucket) => bucket.applicable).length;
}

function buildExplanation(
  input: CaffiLabInput,
  estimate: number,
  uncertainty: number,
  beanUncertainty: number,
  brewingUncertainty: number,
  beanLabel: string,
  beanDetailLabel: string,
  method: BrewMethodConfig,
  chicoryPercent: number,
  brewRatio: number,
) {
  const chicoryPhrase =
    input.brewMethod === "indian_filter"
      ? ` The Indian filter profile treats ${chicoryPercent}% of the powder as chicory, which adds body but essentially no caffeine.`
      : "";

  return `${method.label} starts from a ${(method.defaultRecovery * 100).toFixed(0)}% caffeine recovery baseline. ${beanLabel} with the ${beanDetailLabel.toLowerCase()} sets a caffeine range instead of a single bean fraction. Brew water sets a 1:${brewRatio.toFixed(1)} coffee-to-water ratio, while dilution only changes final cup strength, not the caffeine mass. The selected extraction variables place this serving near ${round(estimate)} mg. Bean variability contributes about ${round(beanUncertainty)}% uncertainty, brewing inputs contribute about ${round(brewingUncertainty)}%, and the practical estimate is capped at +/-${uncertainty}%.${chicoryPhrase}`;
}

export function estimateCaffeine(input: CaffiLabInput): CaffiLabEstimate {
  const method = BREW_METHODS[input.brewMethod];
  const coffeeGrams = clamp(toGrams(input.coffeeAmount, input.coffeeUnit), 0, 1000);
  const brewWaterMl = clamp(toMilliliters(input.brewWaterAmount, input.brewWaterUnit), 1, 10000);
  const beverageMl = clamp(toMilliliters(input.servingAmount, input.servingUnit), 1, 5000);
  const dilutionMl = clamp(
    input.dilutionAmount === undefined
      ? 0
      : toMilliliters(input.dilutionAmount, input.dilutionUnit),
    0,
    beverageMl * 0.95,
  );
  const brewRatio = brewWaterMl / Math.max(coffeeGrams, 1);
  const targetBrewRatio = (method.ratioRange[0] + method.ratioRange[1]) / 2;
  const brewTimeMinutes = clamp(
    input.brewTimeAmount === undefined
      ? method.defaultTimeMinutes
      : toMinutes(input.brewTimeAmount, input.brewTimeUnit),
    0,
    2880,
  );
  const temperatureC = clamp(
    input.temperatureAmount === undefined
      ? method.defaultTemperatureC
      : toCelsius(input.temperatureAmount, input.temperatureUnit),
    0,
    110,
  );
  const extractionYieldPercent = clamp(
    input.extractionYieldPercent ?? method.defaultYieldPercent,
    8,
    32,
  );
  const beanProfile = getBeanProfile(input);
  const beanFractionRange = getBeanFractionRange(input, beanProfile);
  const caffeineFractionMin = beanFractionRange.min;
  const caffeineFractionMax = beanFractionRange.max;
  const caffeineFraction = midpoint(caffeineFractionMin, caffeineFractionMax);
  const chicoryPercent =
    input.brewMethod === "indian_filter"
      ? normalizePercent(input.chicoryPercent, DEFAULT_INDIAN_CHICORY_PERCENT)
      : 0;
  const effectiveCaffeineFraction = caffeineFraction * (1 - chicoryPercent / 100);
  const effectiveCaffeineFractionMin = caffeineFractionMin * (1 - chicoryPercent / 100);
  const effectiveCaffeineFractionMax = caffeineFractionMax * (1 - chicoryPercent / 100);
  const caffeineRecovery = getCaffeineRecovery(
    method,
    input,
    brewRatio,
    brewTimeMinutes,
    input.grindSize,
    temperatureC,
    extractionYieldPercent,
  );
  if (process.env.NODE_ENV !== "production") {
    if (caffeineRecovery <= 0 || caffeineRecovery >= 1) {
      console.error(
        `[CaffiLab] E out of range (0, 1): ${caffeineRecovery} for method ${input.brewMethod}`,
      );
    }
  }
  const dilutionFactor = (beverageMl - dilutionMl) / beverageMl;
  const estimatedMg = coffeeGrams * effectiveCaffeineFraction * caffeineRecovery * 1000;
  const beanLowerMg = coffeeGrams * effectiveCaffeineFractionMin * caffeineRecovery * 1000;
  const beanUpperMg = coffeeGrams * effectiveCaffeineFractionMax * caffeineRecovery * 1000;
  if (process.env.NODE_ENV !== "production") {
    if (estimatedMg < beanLowerMg || estimatedMg > beanUpperMg) {
      console.error(
        `[CaffiLab] estimate ${estimatedMg} outside bean bounds [${beanLowerMg}, ${beanUpperMg}]`,
      );
    }
  }
  const beanUncertainty = getBeanUncertaintyPercent(caffeineFractionMin, caffeineFractionMax);
  const brewingUncertainty = getBrewingUncertaintyPercent(input, beanProfile.strength, method);
  // Quadrature combination: independent sources add in orthogonal uncertainty space.
  const uncertainty = Math.sqrt(beanUncertainty ** 2 + brewingUncertainty ** 2);
  const roundedUncertainty = Number(uncertainty.toFixed(1));
  const practicalLowerMg = estimatedMg * (1 - uncertainty / 100);
  const practicalUpperMg = estimatedMg * (1 + uncertainty / 100);

  return {
    estimatedMg: round(estimatedMg),
    lowerMg: round(beanLowerMg),
    upperMg: round(beanUpperMg),
    practicalLowerMg: round(practicalLowerMg),
    practicalUpperMg: round(practicalUpperMg),
    beanLowerMg: round(beanLowerMg),
    beanUpperMg: round(beanUpperMg),
    concentrationMgPer100Ml: Math.round((estimatedMg / beverageMl) * 100),
    confidenceLabel: getConfidenceLabel(roundedUncertainty),
    confidencePercent: roundedUncertainty,
    beanUncertaintyPercent: Number(beanUncertainty.toFixed(1)),
    brewingUncertaintyPercent: Number(brewingUncertainty.toFixed(1)),
    caffeineRecovery: Number(caffeineRecovery.toFixed(3)),
    caffeineFraction: Number(caffeineFraction.toFixed(4)),
    caffeineFractionMin: Number(caffeineFractionMin.toFixed(4)),
    caffeineFractionMax: Number(caffeineFractionMax.toFixed(4)),
    effectiveCaffeineFraction: Number(effectiveCaffeineFraction.toFixed(4)),
    effectiveCaffeineFractionMin: Number(effectiveCaffeineFractionMin.toFixed(4)),
    effectiveCaffeineFractionMax: Number(effectiveCaffeineFractionMax.toFixed(4)),
    dilutionFactor: Number(dilutionFactor.toFixed(3)),
    brewRatio: Number(brewRatio.toFixed(1)),
    targetBrewRatio: Number(targetBrewRatio.toFixed(1)),
    coffeeGrams: Number(coffeeGrams.toFixed(1)),
    brewWaterMl: Number(brewWaterMl.toFixed(1)),
    beverageMl: Number(beverageMl.toFixed(1)),
    dilutionMl: Number(dilutionMl.toFixed(1)),
    knownInputs: getKnownInputCount(input),
    availableInputs: getAvailableInputCount(input),
    assumedBeanProfile: beanProfile.label,
    beanDetailLabel: beanFractionRange.detailLabel,
    extractionYieldPercent: Number(extractionYieldPercent.toFixed(1)),
    explanation: buildExplanation(
      input,
      estimatedMg,
      roundedUncertainty,
      beanUncertainty,
      brewingUncertainty,
      beanProfile.label,
      beanFractionRange.detailLabel,
      method,
      chicoryPercent,
      brewRatio,
    ),
  };
}
