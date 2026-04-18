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
};

export type CaffiLabEstimate = {
  estimatedMg: number;
  lowerMg: number;
  upperMg: number;
  concentrationMgPer100Ml: number;
  confidenceLabel: ConfidenceLabel;
  confidencePercent: number;
  caffeineRecovery: number;
  caffeineFraction: number;
  effectiveCaffeineFraction: number;
  dilutionFactor: number;
  brewRatio: number;
  targetBrewRatio: number;
  coffeeGrams: number;
  brewWaterMl: number;
  beverageMl: number;
  dilutionMl: number;
  knownInputs: number;
  assumedBeanProfile: string;
  extractionYieldPercent: number;
  explanation: string;
};

export type BrewMethodConfig = {
  label: string;
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
    note: "High strength, short contact time, pressure-driven extraction.",
  },
  pour_over: {
    label: "Pour Over (V60)",
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
    note: "A V60-style percolation brew usually sits around 1:15 to 1:17.",
  },
  chemex: {
    label: "Chemex",
    defaultRecovery: 0.8,
    defaultTimeMinutes: 4.5,
    defaultGrind: "medium_coarse",
    defaultTemperatureC: 94,
    ratioRange: [15, 18],
    defaultYieldPercent: 20,
    defaultFilter: "paper",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    supportsAgitation: true,
    note: "Thicker filters and a coarser grind make Chemex extraction slightly slower.",
  },
  french_press: {
    label: "French Press",
    defaultRecovery: 0.84,
    defaultTimeMinutes: 4,
    defaultGrind: "coarse",
    defaultTemperatureC: 94,
    ratioRange: [12, 16],
    defaultYieldPercent: 21,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "low",
    supportsAgitation: true,
    note: "Immersion and metal filtration keep body high while grind effects stay moderate.",
  },
  cold_brew: {
    label: "Cold Brew",
    defaultRecovery: 0.8,
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
    note: "Cold brew is time-driven; caffeine approaches equilibrium well before a full day.",
  },
  aeropress: {
    label: "AeroPress",
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
    note: "AeroPress recipes vary widely, so time and ratio carry extra uncertainty.",
  },
  moka_pot: {
    label: "Moka Pot (Stovetop)",
    defaultRecovery: 0.74,
    defaultTimeMinutes: 4,
    defaultGrind: "fine",
    defaultTemperatureC: 94,
    ratioRange: [7, 10],
    defaultYieldPercent: 20,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    note: "Moka pot brews a concentrated cup with steam pressure below espresso.",
  },
  drip_machine: {
    label: "Drip Coffee (Machine)",
    defaultRecovery: 0.83,
    defaultTimeMinutes: 5,
    defaultGrind: "medium",
    defaultTemperatureC: 93,
    ratioRange: [15, 18],
    defaultYieldPercent: 20,
    defaultFilter: "paper",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    note: "Automatic drip sits close to the classic filter-coffee control chart region.",
  },
  siphon: {
    label: "Siphon (Vacuum brew)",
    defaultRecovery: 0.82,
    defaultTimeMinutes: 2,
    defaultGrind: "medium",
    defaultTemperatureC: 92,
    ratioRange: [14, 17],
    defaultYieldPercent: 20,
    defaultFilter: "cloth",
    timeSensitivity: "high",
    grindSensitivity: "medium",
    supportsAgitation: true,
    note: "Siphon combines immersion with a hot drawdown phase.",
  },
  turkish: {
    label: "Turkish Coffee",
    defaultRecovery: 0.9,
    defaultTimeMinutes: 3,
    defaultGrind: "extra_fine",
    defaultTemperatureC: 96,
    ratioRange: [8, 12],
    defaultYieldPercent: 24,
    defaultFilter: "none",
    timeSensitivity: "medium",
    grindSensitivity: "high",
    supportsAgitation: true,
    note: "Extra-fine grounds and direct heating push caffeine recovery high.",
  },
  cold_drip: {
    label: "Cold Drip (Kyoto style)",
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
    note: "Cold drip depends on flow rate, bed depth, and contact time.",
  },
  immersion: {
    label: "Immersion Brew",
    defaultRecovery: 0.82,
    defaultTimeMinutes: 4,
    defaultGrind: "coarse",
    defaultTemperatureC: 93,
    ratioRange: [12, 16],
    defaultYieldPercent: 21,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "low",
    supportsAgitation: true,
    note: "A general immersion profile for Clever, cupping-style, or steep-and-release brews.",
  },
  percolator: {
    label: "Percolator",
    defaultRecovery: 0.88,
    defaultTimeMinutes: 7,
    defaultGrind: "coarse",
    defaultTemperatureC: 96,
    ratioRange: [14, 18],
    defaultYieldPercent: 22,
    defaultFilter: "metal",
    timeSensitivity: "high",
    grindSensitivity: "medium",
    note: "Repeated hot-water cycling can raise extraction and bitterness.",
  },
  indian_filter: {
    label: "Indian Filter Coffee",
    defaultRecovery: 0.78,
    defaultTimeMinutes: 12,
    defaultGrind: "fine",
    defaultTemperatureC: 96,
    ratioRange: [4, 7],
    defaultYieldPercent: 22,
    defaultFilter: "metal",
    timeSensitivity: "medium",
    grindSensitivity: "medium",
    note: "A slow metal-filter decoction, often brewed with a coffee-chicory blend.",
  },
};

const ARABICA_CAFFEINE_FRACTION = 0.012;
const ROBUSTA_CAFFEINE_FRACTION = 0.022;
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

function getRoastAdjustment(roastLevel: RoastLevel) {
  if (roastLevel === "light") {
    return 0.015;
  }

  if (roastLevel === "dark") {
    return -0.035;
  }

  return 0.01;
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

  const distanceFromNine = Math.abs(pressureBars - 9);
  return clamp(0.012 - distanceFromNine * 0.006, -0.025, 0.012);
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
  let adjustment = 0;

  if (waterMinerals === "soft") {
    adjustment -= 0.012;
  } else if (waterMinerals === "balanced") {
    adjustment += 0.008;
  } else if (waterMinerals === "hard") {
    adjustment -= 0.006;
  }

  if (waterPh !== undefined) {
    if (waterPh < 6.5) {
      adjustment -= 0.006;
    } else if (waterPh > 7.8) {
      adjustment -= 0.01;
    }
  }

  return adjustment;
}

function getFreshnessAdjustment(freshness: Freshness) {
  if (freshness === "fresh") {
    return -0.008;
  }

  if (freshness === "stale") {
    return -0.018;
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

function getCaffeineRecovery(
  method: BrewMethodConfig,
  input: CaffiLabInput,
  brewRatio: number,
  brewTimeMinutes: number,
  grindSize: GrindSize,
  temperatureC: number,
  extractionYieldPercent: number,
) {
  return clamp(
    method.defaultRecovery +
      getTimeAdjustment(method, brewTimeMinutes) +
      getGrindAdjustment(method, grindSize) +
      getTemperatureAdjustment(method, temperatureC) +
      getRatioAdjustment(method, brewRatio) +
      getRoastAdjustment(input.roastLevel) +
      getExtractionYieldAdjustment(method, extractionYieldPercent) +
      getPressureAdjustment(method, input.pressureBars) +
      getAgitationAdjustment(method, input.agitation) +
      getWaterAdjustment(input.waterMinerals, input.waterPh) +
      getFreshnessAdjustment(input.freshness) +
      getFilterAdjustment(input.filterType),
    0.42,
    0.97,
  );
}

function getUncertaintyPercent(input: CaffiLabInput, beanProfileStrength: "direct" | "package" | "price" | "none") {
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

  if (input.pressureBars !== undefined && BREW_METHODS[input.brewMethod].supportsPressure) {
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

  return clamp(uncertainty, 5, 35);
}

function getKnownInputCount(input: CaffiLabInput) {
  return [
    input.beanType !== "unknown" ||
      Boolean(input.coffeePrice) ||
      (input.packageClue !== undefined && input.packageClue !== "none"),
    input.brewTimeAmount !== undefined,
    input.dilutionAmount !== undefined,
    input.coffeeAmount > 0 && input.brewWaterAmount > 0,
    Boolean(input.grindSize),
    Boolean(input.roastLevel),
    input.temperatureAmount !== undefined,
    input.extractionYieldPercent !== undefined,
    input.pressureBars !== undefined && BREW_METHODS[input.brewMethod].supportsPressure,
    input.agitation !== "none",
    input.waterMinerals !== "unknown" || input.waterPh !== undefined,
    input.freshness !== "unknown",
    Boolean(input.filterType),
    input.brewMethod !== "indian_filter" || input.chicoryPercent !== undefined,
  ].filter(Boolean).length;
}

function buildExplanation(
  input: CaffiLabInput,
  estimate: number,
  uncertainty: number,
  beanLabel: string,
  method: BrewMethodConfig,
  chicoryPercent: number,
  brewRatio: number,
) {
  const chicoryPhrase =
    input.brewMethod === "indian_filter"
      ? ` The Indian filter profile treats ${chicoryPercent}% of the powder as chicory, which adds body but essentially no caffeine.`
      : "";

  return `${method.label} starts from a ${(method.defaultRecovery * 100).toFixed(0)}% caffeine recovery baseline. ${beanLabel} sets the bean caffeine fraction. Brew water sets a 1:${brewRatio.toFixed(1)} coffee-to-water ratio, while dilution only changes final cup strength, not the caffeine mass. The selected extraction variables place this serving near ${round(estimate)} mg with +/-${uncertainty}% uncertainty.${chicoryPhrase}`;
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
  const caffeineFraction =
    (beanProfile.arabica / 100) * ARABICA_CAFFEINE_FRACTION +
    (beanProfile.robusta / 100) * ROBUSTA_CAFFEINE_FRACTION;
  const chicoryPercent =
    input.brewMethod === "indian_filter"
      ? normalizePercent(input.chicoryPercent, DEFAULT_INDIAN_CHICORY_PERCENT)
      : 0;
  const effectiveCaffeineFraction = caffeineFraction * (1 - chicoryPercent / 100);
  const caffeineRecovery = getCaffeineRecovery(
    method,
    input,
    brewRatio,
    brewTimeMinutes,
    input.grindSize,
    temperatureC,
    extractionYieldPercent,
  );
  const dilutionFactor = (beverageMl - dilutionMl) / beverageMl;
  const estimatedMg = coffeeGrams * effectiveCaffeineFraction * caffeineRecovery * 1000;
  const uncertainty = getUncertaintyPercent(input, beanProfile.strength);
  const lowerMg = estimatedMg * (1 - uncertainty / 100);
  const upperMg = estimatedMg * (1 + uncertainty / 100);

  return {
    estimatedMg: round(estimatedMg),
    lowerMg: round(lowerMg),
    upperMg: round(upperMg),
    concentrationMgPer100Ml: Math.round((estimatedMg / beverageMl) * 100),
    confidenceLabel: getConfidenceLabel(uncertainty),
    confidencePercent: uncertainty,
    caffeineRecovery: Number(caffeineRecovery.toFixed(3)),
    caffeineFraction: Number(caffeineFraction.toFixed(4)),
    effectiveCaffeineFraction: Number(effectiveCaffeineFraction.toFixed(4)),
    dilutionFactor: Number(dilutionFactor.toFixed(3)),
    brewRatio: Number(brewRatio.toFixed(1)),
    targetBrewRatio: Number(targetBrewRatio.toFixed(1)),
    coffeeGrams: Number(coffeeGrams.toFixed(1)),
    brewWaterMl: Number(brewWaterMl.toFixed(1)),
    beverageMl: Number(beverageMl.toFixed(1)),
    dilutionMl: Number(dilutionMl.toFixed(1)),
    knownInputs: getKnownInputCount(input),
    assumedBeanProfile: beanProfile.label,
    extractionYieldPercent: Number(extractionYieldPercent.toFixed(1)),
    explanation: buildExplanation(
      input,
      estimatedMg,
      uncertainty,
      beanProfile.label,
      method,
      chicoryPercent,
      brewRatio,
    ),
  };
}
