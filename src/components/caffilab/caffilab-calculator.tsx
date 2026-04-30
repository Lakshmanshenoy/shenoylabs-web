"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ActivityIcon,
  BeakerIcon,
  BookOpenIcon,
  ChevronDownIcon,
  FlaskConicalIcon,
  GaugeIcon,
  HeartIcon,
  MessageCircleIcon,
  MicroscopeIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import {
  BREW_METHODS,
  CALIBRATION_ALPHA,
  GRIND_SIZES,
  ORIGIN_REGIONS,
  PER_METHOD_BETA,
  defaultBrewWaterMl,
  defaultBrewTimeValue,
  defaultTemperatureValue,
  estimateCaffeine,
  type AgitationLevel,
  type ArabicaGrade,
  type Cultivar,
  type BeanDetail,
  type BeanType,
  type BrewMethod,
  type BrewPhysics,
  type ElevationBand,
  type ExtractionQuality,
  type FilterType,
  type Freshness,
  type GrindSize,
  type GrinderType,
  type OriginRegion,
  type PackageClue,
  type PriceCurrency,
  type PriceUnit,
  type ProcessingMethod,
  type RoastLevel,
  type TemperatureUnit,
  type TimeUnit,
  type VolumeUnit,
  type WeightUnit,
} from "@/lib/caffilab";
import { cn } from "@/lib/utils";

type FocusTopic =
  | "result"
  | "method"
  | "coffee"
  | "water"
  | "serving"
  | "bean"
  | "bean_detail"
  | "blend"
  | "package"
  | "price"
  | "time"
  | "dilution"
  | "grind"
  | "roast"
  | "temperature"
  | "yield"
  | "pressure"
  | "agitation"
  | "water_chemistry"
  | "freshness"
  | "filter"
  | "chicory"
  | "arabica_grade"
  | "elevation"
  | "extraction_quality"
  | "cultivar"
  | "origin_region";

const brewMethods = Object.entries(BREW_METHODS) as Array<
  [BrewMethod, (typeof BREW_METHODS)[BrewMethod]]
>;

const grindSizes = Object.entries(GRIND_SIZES) as Array<
  [GrindSize, (typeof GRIND_SIZES)[GrindSize]]
>;

const METHOD_DESCRIPTIONS: Record<BrewMethod, string> = {
  espresso: "High pressure · Fast extraction · Incomplete recovery",
  pour_over: "Gravity percolation · Clean cup · Sequential flow",
  chemex: "Thick paper filter · Slow percolation · Very clean cup",
  french_press: "Full immersion · Near-complete extraction · Oils retained",
  cold_brew: "Low temperature · Time-driven equilibrium · Slow diffusion",
  aeropress: "Hybrid pressure & immersion · High technique variance",
  moka_pot: "Steam pressure percolation · Concentrated stovetop brew",
  drip_machine: "Automated percolation · Consistent temperature · High recovery",
  siphon: "Vacuum-assisted percolation · Precise temperature · Clean cup",
  turkish: "Near-boil · Unfiltered immersion · Maximum extraction",
  cold_drip: "Slow cold drip · Kyoto-style · Extended contact time",
  immersion: "Full hot immersion · Steep-and-release · Even extraction",
  percolator: "Recirculating hot water · Multiple passes · High extraction",
  indian_filter: "Gravity drip · Slow percolation · Chicory blend tradition",
};

const TOPIC_LABELS: Partial<Record<FocusTopic, string>> = {
  method: "Brew method",
  coffee: "Dose",
  water: "Brew water",
  serving: "Serving vol.",
  bean: "Bean species",
  bean_detail: "Bean detail",
  blend: "Blend ratio",
  package: "Package clue",
  price: "Price",
  time: "Brew time",
  dilution: "Dilution",
  grind: "Grind size",
  roast: "Roast level",
  temperature: "Temperature",
  yield: "Extr. yield",
  pressure: "Pressure",
  agitation: "Agitation",
  water_chemistry: "Water",
  freshness: "Freshness",
  filter: "Filter type",
  chicory: "Chicory",
  arabica_grade: "Arabica grade",
  elevation: "Elevation",
  extraction_quality: "Extr. quality",
  cultivar: "Cultivar",
  origin_region: "Origin / Region",
};

const priceCurrencies: PriceCurrency[] = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "JPY",
  "AED",
];

const brewMethodValues = Object.keys(BREW_METHODS) as BrewMethod[];
const grindSizeValues = Object.keys(GRIND_SIZES) as GrindSize[];
const beanTypeValues: BeanType[] = ["unknown", "arabica", "robusta", "blend"];
const beanDetailValues: BeanDetail[] = ["generic", "high_altitude", "low_altitude", "custom"];
const volumeUnitValues: VolumeUnit[] = ["ml", "l", "fl_oz"];
const weightUnitValues: WeightUnit[] = ["g", "oz", "lb"];
const timeUnitValues: TimeUnit[] = ["min", "hr"];
const temperatureUnitValues: TemperatureUnit[] = ["c", "f"];
const priceUnitValues: PriceUnit[] = ["kg", "lb"];
const packageClueValues: PackageClue[] = [
  "none",
  "specialty_single_origin",
  "espresso_blend",
  "south_indian_filter",
  "commercial_instant",
];
const roastLevelValues: RoastLevel[] = ["light", "medium", "dark", "very_dark"];
const agitationValues: AgitationLevel[] = ["none", "gentle", "moderate", "high"];
const processingMethodValues: ProcessingMethod[] = ["unknown", "washed", "honey", "natural"];
const grinderTypeValues: GrinderType[] = ["unknown", "burr", "blade"];
const freshnessValues: Freshness[] = ["unknown", "fresh", "rested", "stale"];
const filterTypeValues: FilterType[] = ["paper", "metal", "cloth", "none"];
const arabicaGradeValues: ArabicaGrade[] = ["specialty", "commercial"];
const elevationBandValues: ElevationBand[] = ["unknown", "low", "mid", "high"];
const extractionQualityValues: ExtractionQuality[] = ["average", "poor", "well_prepared"];
const cultivarValues: Cultivar[] = ["unknown", "geisha", "sl28", "caturra", "catimor"];
const originRegionValues: OriginRegion[] = ["unknown", "india_sea", "africa", "latin_america"];

type CaffiLabSessionInputs = {
  brewMethod: BrewMethod;
  coffeeAmount: string;
  coffeeUnit: WeightUnit;
  brewWaterAmount: string;
  brewWaterUnit: VolumeUnit;
  servingAmount: string;
  servingUnit: VolumeUnit;
  beanType: BeanType;
  beanDetail: BeanDetail;
  customCaffeinePercent: string;
  arabicaPercent: string;
  robustaPercent: string;
  coffeePrice: string;
  priceCurrency: PriceCurrency;
  priceUnit: PriceUnit;
  packageClue: PackageClue;
  brewTimeAmount: string;
  brewTimeUnit: TimeUnit;
  dilutionAmount: string;
  dilutionUnit: VolumeUnit;
  grindSize: GrindSize;
  roastLevel: RoastLevel;
  temperatureAmount: string;
  temperatureUnit: TemperatureUnit;
  extractionYieldPercent: string;
  pressureBars: string;
  agitation: AgitationLevel;
  waterHardnessPpm: string;
  waterPh: string;
  freshness: Freshness;
  filterType: FilterType;
  chicoryPercent: string;
  processingMethod: ProcessingMethod;
  grinderType: GrinderType;
  arabicaGrade: ArabicaGrade | "";
  elevationBand: ElevationBand;
  extractionQuality: ExtractionQuality;
  cultivar: Cultivar;
  originRegion: OriginRegion;
};

type CaffiLabSessionPayload = {
  version: "1.0";
  timestamp: string;
  inputs: CaffiLabSessionInputs;
  model: {
    estimateFormula: string;
    decayFormula: string;
  };
  results: ReturnType<typeof estimateCaffeine>;
};

const inputClass =
  "h-11 w-full rounded-[6px] border border-[#3c4337] bg-[#11130f] px-3 text-sm text-[#f5f1e8] outline-none transition focus:border-[#9adf8f] focus:ring-2 focus:ring-[#9adf8f]/30";
const labelClass = "text-xs font-medium uppercase text-[#a9b39c] [letter-spacing:0]";

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function formatIsoTimestamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function sanitizeFileStem(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "-");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not convert image to data URL."));
    };
    reader.onerror = () => reject(new Error("Could not read image blob."));
    reader.readAsDataURL(blob);
  });
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function unitLabel(unit: VolumeUnit | WeightUnit | TimeUnit | TemperatureUnit) {
  const labels: Record<string, string> = {
    c: "C",
    f: "F",
    fl_oz: "fl oz",
    g: "g",
    hr: "hr",
    l: "L",
    lb: "lb",
    min: "min",
    ml: "ml",
    oz: "oz",
  };

  return labels[unit] ?? unit;
}

function Field({
  children,
  hint,
  label,
  topic,
  onFocus,
}: {
  children: React.ReactNode;
  hint?: string;
  label: string;
  topic: FocusTopic;
  onFocus: (topic: FocusTopic) => void;
}) {
  return (
    <label className="grid gap-2" onFocusCapture={() => onFocus(topic)}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-[#8f9886]">{hint}</span> : null}
    </label>
  );
}

function SplitInput({
  amount,
  amountLabel,
  children,
  min = "0",
  onAmountChange,
}: {
  amount: string;
  amountLabel: string;
  children: React.ReactNode;
  min?: string;
  onAmountChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-2">
      <input
        aria-label={amountLabel}
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
        inputMode="decimal"
        min={min}
        type="number"
        className={inputClass}
      />
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "gold";
}) {
  return (
    <div className="min-h-24 rounded-[8px] border border-[#33392f] bg-[#10120e] p-4">
      <p className={labelClass}>{label}</p>
      <p
        className={cn(
          "mt-2 break-words font-mono text-2xl font-semibold leading-snug [letter-spacing:0]",
          tone === "green" && "text-[#9adf8f]",
          tone === "gold" && "text-[#f2c36b]",
          tone === "neutral" && "text-[#f5f1e8]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function getTopicExplanation({
  beanType,
  brewMethod,
  chicoryPercent,
  coffeeUnit,
  dilutionUnit,
  estimate,
  focusTopic,
  grindSize,
  servingUnit,
  temperatureUnit,
  timeUnit,
  waterUnit,
}: {
  beanType: BeanType;
  brewMethod: BrewMethod;
  chicoryPercent: string;
  coffeeUnit: WeightUnit;
  dilutionUnit: VolumeUnit;
  estimate: ReturnType<typeof estimateCaffeine>;
  focusTopic: FocusTopic;
  grindSize: GrindSize;
  servingUnit: VolumeUnit;
  temperatureUnit: TemperatureUnit;
  timeUnit: TimeUnit;
  waterUnit: VolumeUnit;
}) {
  const method = BREW_METHODS[brewMethod];
  const notes: Record<FocusTopic, string> = {
    result: estimate.explanation,
    method: `${method.label}: ${method.note} Default time is ${formatNumber(defaultBrewTimeValue(brewMethod, timeUnit))} ${unitLabel(timeUnit)}, default grind is ${GRIND_SIZES[method.defaultGrind].label}, and the model expects a brew ratio near 1:${method.ratioRange[0]} to 1:${method.ratioRange[1]}.`,
    coffee: `Coffee dose is converted from ${unitLabel(coffeeUnit)} to grams before calculation. More coffee increases available caffeine directly and also tightens the brew ratio if brew water stays fixed.`,
    water: `Brew water is converted from ${unitLabel(waterUnit)} to milliliters and sets the coffee-to-water ratio. Your current brew recipe is 1:${estimate.brewRatio}; the method default is about 1:${estimate.targetBrewRatio}.`,
    serving: `Beverage volume is converted from ${unitLabel(servingUnit)} to milliliters. This is the final cup volume used for mg/100 ml concentration; it does not create or remove caffeine.`,
    bean:
      beanType === "unknown"
        ? "Not sure first uses package clues, then price, because packaging claims are more reliable than price. Without either, CaffiLab uses Arabica as the conservative baseline."
        : `${estimate.assumedBeanProfile} is being used for the bean caffeine range. ${estimate.beanDetailLabel} controls whether CaffiLab uses the full species range, a lower-caffeine high-altitude band, an upper-caffeine low-altitude band, or your custom caffeine percentage.`,
    bean_detail: `Bean detail is currently set to ${estimate.beanDetailLabel.toLowerCase()}. CaffiLab uses this to choose a caffeine range, then calculates the midpoint estimate from that range while keeping bean-driven uncertainty visible.`,
    blend: "Blend percentages are normalized to 100%. If you do not know the split, the calculator starts with a 70% Arabica / 30% Robusta assumption.",
    package: "Package clues are the best fallback when the species is unknown: single-origin/specialty usually leans Arabica, espresso blends are often mixed, and commercial instant or value coffee often leans Robusta.",
    price: "Price inference is a rough secondary clue, not a botanical test. Very low prices lean robusta-forward, middle prices lean mixed, and premium prices lean Arabica-forward.",
    time:
      method.timeSensitivity === "cold"
        ? "Cold methods use hours well: published cold brew work shows caffeine approaches equilibrium after roughly 6-7 hours, so the model rises quickly early and flattens later."
        : `Brew time is converted from ${unitLabel(timeUnit)} to minutes. Longer contact generally increases recovery, but the adjustment is capped because caffeine extracts readily.`,
    dilution: `Dilution is a volume in ${unitLabel(dilutionUnit)} added to the final cup. It lowers mg/100 ml concentration, but total caffeine stays the same if you drink the whole cup.`,
    grind: `${GRIND_SIZES[grindSize].label} is selected. The calculator auto-fills the usual grind for each brew method, then applies a small correction if you override it.`,
    roast: "Roast level nudges caffeine recovery. Recent filter-brew work found light-to-medium roasts can show higher caffeine in comparable brews than very dark roasts, partly through extraction yield and roasting loss.",
    temperature: `Temperature is converted from ${unitLabel(temperatureUnit)}. Hot methods are calibrated near 92-96 C; cold methods are calibrated near room temperature.`,
    yield: `Extraction yield defaults to ${method.defaultYieldPercent}% for ${method.label}. If you measured TDS/yield, entering it is one of the strongest ways to calibrate the estimate.`,
    pressure: "Pressure is only shown for espresso. Around 9 bar is treated as the target; pressure changes are kept modest because grind/flow usually explain more caffeine variation than pressure alone.",
    agitation: "Agitation or stirring increases contact between water and grounds, so it nudges recovery upward for immersion and manual brew methods.",
    water_chemistry: "Water hardness (ppm) and pH each shift caffeine extraction slightly. Balanced water (50–150 ppm) and near-neutral pH (6.5–7.5) are closest to specialty brewing standards. Both fields are optional and default to zero adjustment.",
    freshness: "Bean freshness changes gas, flow, and extraction behavior. Very fresh coffee can resist even extraction; stale coffee often loses volatile structure and extracts less predictably.",
    filter: "Filter type mainly changes oils and insoluble material, but it can slightly shift measured strength. Paper is a touch cleaner/lower; metal and no-filter methods retain more material.",
    chicory: `Indian filter coffee often includes chicory. CaffiLab defaults to ${chicoryPercent || "20"}% chicory for this method; chicory contributes body and bitterness but essentially no caffeine.`,
    arabica_grade: "Arabica quality grade splits the species caffeine range in two tiers. Specialty (1.2–1.6 %) represents washed/natural single-origins and high-quality lots; Commercial (1.0–1.2 %) covers commodity-grade arabica. If unsure, the default Specialty tier is used.",
    elevation: "Growing elevation slightly correlates with caffeine content through UV exposure and pest pressure. High-altitude farms (>1500 m) shift the estimated range upward by ~15 % of the range width; low-altitude (<800 m) shifts it downward by the same amount.",
    extraction_quality: "Espresso extraction quality captures channeling and puck preparation. A poorly prepared puck (uneven tamping, channeling) reduces caffeine extraction significantly; a well-prepared shot can yield a small recovery gain. Average is the neutral default.",
    cultivar: "Named arabica cultivar shifts the bean caffeine fraction range based on HPLC measurements. Geisha (~0.9–1.1 % dry weight) is distinctly lower; SL28 (~1.3–1.7 %) is elevated, typical of Kenyan lots; Caturra (~1.0–1.3 %) is a Bourbon-derived mid-range variety; Catimor (~1.5–2.0 %) is a Robusta hybrid and sits notably higher. Unknown is the safe default when you are not sure.",
    origin_region: "Growing origin applies a regional multiplier to the caffeine fraction. India and Southeast Asia tend toward higher-caffeine varieties (+7.5 % on the midpoint estimate). Africa and Latin America are the global reference baseline. Selecting any region also tightens the confidence interval slightly by reducing the baseline brewing uncertainty by 1 percentage point.",
  };

  return notes[focusTopic];
}

function CalculationBar({
  label,
  value,
  max,
  displayValue,
  color = "#9adf8f",
}: {
  label: string;
  value: number;
  max: number;
  displayValue: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#a9b39c]">{label}</span>
        <span className="font-mono text-[#f5f1e8]">{displayValue}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#252a21]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RangeVisualizer({
  lower,
  upper,
  estimateMg,
  confidencePercent,
}: {
  lower: number;
  upper: number;
  estimateMg: number;
  confidencePercent: number;
}) {
  const scaleMax = upper * 1.3;
  const leftPct = Math.max(0, Math.min(100, (lower / scaleMax) * 100));
  const rightPct = Math.max(0, Math.min(100, (upper / scaleMax) * 100));
  const markerPct = Math.max(0, Math.min(100, (estimateMg / scaleMax) * 100));
  const rangeColor =
    confidencePercent > 25 ? "#f97316" : confidencePercent > 15 ? "#f2c36b" : "#9adf8f";
  return (
    <div className="grid gap-1.5">
      <div
        className="relative h-4 overflow-hidden rounded-full"
        style={{ background: "linear-gradient(to right, #f9731628, #f2c36b28, #9adf8f33)" }}
      >
        <div
          className="absolute inset-y-0 rounded-full transition-all duration-500"
          style={{
            left: `${leftPct}%`,
            right: `${100 - rightPct}%`,
            background: `linear-gradient(to right, ${rangeColor}aa, ${rangeColor}, ${rangeColor}aa)`,
          }}
        />
        <div
          className="absolute inset-y-0 w-0.5 transition-all duration-500"
          style={{ left: `${markerPct}%`, backgroundColor: rangeColor }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="font-mono text-[#8f9886]">{lower} mg</span>
        <span className="font-mono" style={{ color: rangeColor }}>
          {estimateMg} mg
        </span>
        <span className="font-mono text-[#8f9886]">{upper} mg</span>
      </div>
    </div>
  );
}

function ExtractionCurve({ physics, extraction }: { physics: BrewPhysics; extraction: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 30);
    return () => clearTimeout(t);
  }, []);
  const paths: Record<BrewPhysics, string> = {
    pressure: "M 0 72 Q 15 72 28 12 Q 38 4 46 18 Q 60 38 85 44 L 200 46",
    percolation: "M 0 72 Q 35 70 70 32 Q 105 8 145 7 L 200 7",
    immersion: "M 0 72 Q 28 70 55 42 Q 85 16 120 10 Q 160 8 200 8",
    cold_immersion: "M 0 72 Q 55 71 95 55 Q 135 38 165 24 Q 188 16 200 14",
    cold_percolation: "M 0 72 Q 70 71 115 52 Q 155 35 200 24",
    hybrid: "M 0 72 Q 20 70 45 35 Q 72 10 95 8 Q 140 8 200 8",
  };
  const labels: Record<BrewPhysics, string> = {
    pressure: "Pressure-driven",
    percolation: "Percolation",
    immersion: "Immersion",
    cold_immersion: "Cold immersion",
    cold_percolation: "Cold drip",
    hybrid: "Hybrid",
  };
  return (
    <div className="grid gap-2 rounded-[8px] border border-[#33392f] bg-[#10120e] p-4">
      <div className="flex items-center justify-between">
        <p className={labelClass}>Extraction profile</p>
        <span className="rounded-[4px] bg-[#1e2419] px-2 py-0.5 text-xs text-[#a9b39c]">
          {labels[physics]}
        </span>
      </div>
      <div className="relative overflow-hidden rounded-[6px] border border-[#252a21] bg-[#0f110d] px-3 pb-1 pt-2">
        <svg
          viewBox="0 0 200 80"
          className="w-full"
          style={{ height: "68px" }}
          aria-hidden="true"
        >
          <line x1="0" y1="76" x2="200" y2="76" stroke="#252a21" strokeWidth="1" />
          <line x1="2" y1="0" x2="2" y2="76" stroke="#252a21" strokeWidth="1" />
          <path
            d={paths[physics]}
            fill="none"
            stroke="#9adf8f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="400 400"
            strokeDashoffset={drawn ? 0 : 400}
            style={{ transition: drawn ? "stroke-dashoffset 0.3s ease-out" : "none" }}
          />
          <g
            style={{
              transform: `translateX(${Math.max(4, Math.min(196, extraction * 200))}px)`,
              transition: "transform 0.4s ease",
              filter: "drop-shadow(0 0 4px #f2c36b99)",
            }}
          >
            <line x1="0" y1="76" x2="0" y2="5" stroke="#f2c36b" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="0" cy="73" r="8" fill="#f2c36b" className="animate-pulse" style={{ opacity: 0.2 }} />
            <circle cx="0" cy="73" r="4.5" fill="#f2c36b" />
            <text
              x={Math.max(4, Math.min(196, extraction * 200)) > 150 ? -5 : 5}
              y="16"
              fill="#f2c36b"
              fontSize="7"
              textAnchor={Math.max(4, Math.min(196, extraction * 200)) > 150 ? "end" : "start"}
              fontFamily="sans-serif"
            >
              Your brew
            </text>
          </g>
        </svg>
        <div className="flex justify-between text-[10px] text-[#8f9886]">
          <span>Start</span>
          <span>Time →</span>
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
}

export function CaffiLabCalculator() {
  const [brewMethod, setBrewMethod] = useState<BrewMethod>("pour_over");
  const [coffeeAmount, setCoffeeAmount] = useState("20");
  const [coffeeUnit, setCoffeeUnit] = useState<WeightUnit>("g");
  const [brewWaterAmount, setBrewWaterAmount] = useState("320");
  const [brewWaterUnit, setBrewWaterUnit] = useState<VolumeUnit>("ml");
  const [servingAmount, setServingAmount] = useState("320");
  const [servingUnit, setServingUnit] = useState<VolumeUnit>("ml");
  const [beanType, setBeanType] = useState<BeanType>("unknown");
  const [beanDetail, setBeanDetail] = useState<BeanDetail>("generic");
  const [customCaffeinePercent, setCustomCaffeinePercent] = useState("");
  const [arabicaPercent, setArabicaPercent] = useState("70");
  const [robustaPercent, setRobustaPercent] = useState("30");
  const [coffeePrice, setCoffeePrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>("INR");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("kg");
  const [packageClue, setPackageClue] = useState<PackageClue>("none");
  const [brewTimeAmount, setBrewTimeAmount] = useState("3.5");
  const [brewTimeUnit, setBrewTimeUnit] = useState<TimeUnit>("min");
  const [dilutionAmount, setDilutionAmount] = useState("0");
  const [dilutionUnit, setDilutionUnit] = useState<VolumeUnit>("ml");
  const [grindSize, setGrindSize] = useState<GrindSize>("medium_fine");
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("medium");
  const [temperatureAmount, setTemperatureAmount] = useState("94");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("c");
  const [extractionYieldPercent, setExtractionYieldPercent] = useState("");
  const [pressureBars, setPressureBars] = useState("9");
  const [agitation, setAgitation] = useState<AgitationLevel>("none");
  const [waterHardnessPpm, setWaterHardnessPpm] = useState("");
  const [waterPh, setWaterPh] = useState("");
  const [processingMethod, setProcessingMethod] = useState<ProcessingMethod>("unknown");
  const [grinderType, setGrinderType] = useState<GrinderType>("unknown");
  const [freshness, setFreshness] = useState<Freshness>("unknown");
  const [filterType, setFilterType] = useState<FilterType>("paper");
  const [chicoryPercent, setChicoryPercent] = useState("20");
  const [arabicaGrade, setArabicaGrade] = useState<ArabicaGrade | "">("specialty");
  const [elevationBand, setElevationBand] = useState<ElevationBand>("unknown");
  const [extractionQuality, setExtractionQuality] = useState<ExtractionQuality>("average");
  const [cultivar, setCultivar] = useState<Cultivar>("unknown");
  const [originRegion, setOriginRegion] = useState<OriginRegion>("unknown");
  const [focusTopic, setFocusTopic] = useState<FocusTopic>("result");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [showScience, setShowScience] = useState(false);
  const [deltaMg, setDeltaMg] = useState<number | null>(null);
  const prevEstimatedMgRef = useRef<number | null>(null);
  const customCaffeineInputRef = useRef<HTMLInputElement | null>(null);
  const sessionFileInputRef = useRef<HTMLInputElement | null>(null);
  const [whatChanged, setWhatChanged] = useState<Array<{ id: number; label: string; deltaMg: number }>>([]);
  const currentFocusTopicRef = useRef<FocusTopic>("result");
  const [displayedMg, setDisplayedMg] = useState(0);
  const countUpRef = useRef<number | null>(null);
  const changeIdRef = useRef(0);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionMessageTone, setSessionMessageTone] = useState<"ok" | "error">("ok");

  const method = BREW_METHODS[brewMethod];
  const estimate = useMemo(
    () =>
      estimateCaffeine({
        brewMethod,
        coffeeAmount: parseNumber(coffeeAmount),
        coffeeUnit,
        brewWaterAmount: parseNumber(brewWaterAmount),
        brewWaterUnit,
        servingAmount: parseNumber(servingAmount),
        servingUnit,
        beanType,
        beanDetail,
        customCaffeinePercent: parseOptionalNumber(customCaffeinePercent),
        arabicaPercent: parseOptionalNumber(arabicaPercent),
        robustaPercent: parseOptionalNumber(robustaPercent),
        coffeePrice: parseOptionalNumber(coffeePrice),
        priceCurrency,
        priceUnit,
        packageClue,
        brewTimeAmount: parseOptionalNumber(brewTimeAmount),
        brewTimeUnit,
        dilutionAmount: parseOptionalNumber(dilutionAmount),
        dilutionUnit,
        grindSize,
        roastLevel,
        temperatureAmount: parseOptionalNumber(temperatureAmount),
        temperatureUnit,
        extractionYieldPercent: parseOptionalNumber(extractionYieldPercent),
        pressureBars: parseOptionalNumber(pressureBars),
        agitation,
        waterHardnessPpm: parseOptionalNumber(waterHardnessPpm),
        waterPh: parseOptionalNumber(waterPh),
        processingMethod,
        grinderType,
        freshness,
        filterType,
        chicoryPercent: parseOptionalNumber(chicoryPercent),
        arabicaGrade: arabicaGrade === "" ? undefined : arabicaGrade,
        elevationBand,
        extractionQuality,
        cultivar,
        originRegion,
      }),
    [
      arabicaPercent,
      beanDetail,
      beanType,
      brewMethod,
      brewWaterAmount,
      brewWaterUnit,
      brewTimeAmount,
      brewTimeUnit,
      chicoryPercent,
      arabicaGrade,
      elevationBand,
      extractionQuality,
      cultivar,
      originRegion,
      coffeeAmount,
      coffeePrice,
      customCaffeinePercent,
      coffeeUnit,
      dilutionAmount,
      dilutionUnit,
      extractionYieldPercent,
      filterType,
      freshness,
      grindSize,
      packageClue,
      pressureBars,
      priceCurrency,
      priceUnit,
      agitation,
      roastLevel,
      servingAmount,
      servingUnit,
      temperatureAmount,
      temperatureUnit,
      waterHardnessPpm,
      waterPh,
      processingMethod,
      grinderType,
      robustaPercent,
    ],
  );

  const explanation = getTopicExplanation({
    beanType,
    brewMethod,
    chicoryPercent,
    coffeeUnit,
    dilutionUnit,
    estimate,
    focusTopic,
    grindSize,
    servingUnit,
    temperatureUnit,
    timeUnit: brewTimeUnit,
    waterUnit: brewWaterUnit,
  });

  const sessionPayload: CaffiLabSessionPayload = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    inputs: {
      brewMethod,
      coffeeAmount,
      coffeeUnit,
      brewWaterAmount,
      brewWaterUnit,
      servingAmount,
      servingUnit,
      beanType,
      beanDetail,
      customCaffeinePercent,
      arabicaPercent,
      robustaPercent,
      coffeePrice,
      priceCurrency,
      priceUnit,
      packageClue,
      brewTimeAmount,
      brewTimeUnit,
      dilutionAmount,
      dilutionUnit,
      grindSize,
      roastLevel,
      temperatureAmount,
      temperatureUnit,
      extractionYieldPercent,
      pressureBars,
      agitation,
      waterHardnessPpm,
      waterPh,
      freshness,
      filterType,
      chicoryPercent,
      processingMethod,
      grinderType,
      arabicaGrade,
      elevationBand,
      extractionQuality,
      cultivar,
      originRegion,
    },
    model: {
      estimateFormula: "Estimate = G × F_mid × E × 1000",
      decayFormula: "C(t) = C0 × (1/2)^(t / half_life)",
    },
    results: estimate,
  };

  function triggerDownload(filename: string, contentType: string, content: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleSaveSession() {
    const now = new Date();
    const fileTimestamp = sanitizeFileStem(now.toISOString().slice(0, 19));
    const filename = `caffilab-session-${fileTimestamp}.json`;
    triggerDownload(filename, "application/json;charset=utf-8", `${JSON.stringify(sessionPayload, null, 2)}\n`);
    setSessionMessage("Session saved. Use this JSON to restore your full setup anytime.");
    setSessionMessageTone("ok");
  }

  function openSessionLoader() {
    sessionFileInputRef.current?.click();
  }

  function applySessionInputs(candidate: unknown) {
    if (!isRecord(candidate)) {
      throw new Error("Invalid session format.");
    }

    if (!isOneOf(candidate.brewMethod, brewMethodValues)) {
      throw new Error("Session is missing a valid brew method.");
    }

    if (!isOneOf(candidate.beanType, beanTypeValues) || !isOneOf(candidate.beanDetail, beanDetailValues)) {
      throw new Error("Session has invalid bean settings.");
    }

    setBrewMethod(candidate.brewMethod);
    if (typeof candidate.coffeeAmount === "string") setCoffeeAmount(candidate.coffeeAmount);
    if (isOneOf(candidate.coffeeUnit, weightUnitValues)) setCoffeeUnit(candidate.coffeeUnit);
    if (typeof candidate.brewWaterAmount === "string") setBrewWaterAmount(candidate.brewWaterAmount);
    if (isOneOf(candidate.brewWaterUnit, volumeUnitValues)) setBrewWaterUnit(candidate.brewWaterUnit);
    if (typeof candidate.servingAmount === "string") setServingAmount(candidate.servingAmount);
    if (isOneOf(candidate.servingUnit, volumeUnitValues)) setServingUnit(candidate.servingUnit);
    setBeanType(candidate.beanType);
    setBeanDetail(candidate.beanDetail);
    if (typeof candidate.customCaffeinePercent === "string") setCustomCaffeinePercent(candidate.customCaffeinePercent);
    if (typeof candidate.arabicaPercent === "string") setArabicaPercent(candidate.arabicaPercent);
    if (typeof candidate.robustaPercent === "string") setRobustaPercent(candidate.robustaPercent);
    if (typeof candidate.coffeePrice === "string") setCoffeePrice(candidate.coffeePrice);
    if (isOneOf(candidate.priceCurrency, priceCurrencies)) setPriceCurrency(candidate.priceCurrency);
    if (isOneOf(candidate.priceUnit, priceUnitValues)) setPriceUnit(candidate.priceUnit);
    if (isOneOf(candidate.packageClue, packageClueValues)) setPackageClue(candidate.packageClue);
    if (typeof candidate.brewTimeAmount === "string") setBrewTimeAmount(candidate.brewTimeAmount);
    if (isOneOf(candidate.brewTimeUnit, timeUnitValues)) setBrewTimeUnit(candidate.brewTimeUnit);
    if (typeof candidate.dilutionAmount === "string") setDilutionAmount(candidate.dilutionAmount);
    if (isOneOf(candidate.dilutionUnit, volumeUnitValues)) setDilutionUnit(candidate.dilutionUnit);
    if (isOneOf(candidate.grindSize, grindSizeValues)) setGrindSize(candidate.grindSize);
    if (isOneOf(candidate.roastLevel, roastLevelValues)) setRoastLevel(candidate.roastLevel);
    if (typeof candidate.temperatureAmount === "string") setTemperatureAmount(candidate.temperatureAmount);
    if (isOneOf(candidate.temperatureUnit, temperatureUnitValues)) setTemperatureUnit(candidate.temperatureUnit);
    if (typeof candidate.extractionYieldPercent === "string") setExtractionYieldPercent(candidate.extractionYieldPercent);
    if (typeof candidate.pressureBars === "string") setPressureBars(candidate.pressureBars);
    if (isOneOf(candidate.agitation, agitationValues)) setAgitation(candidate.agitation);
    if (typeof candidate.waterHardnessPpm === "string") setWaterHardnessPpm(candidate.waterHardnessPpm);
    if (typeof candidate.waterPh === "string") setWaterPh(candidate.waterPh);
    if (isOneOf(candidate.processingMethod, processingMethodValues)) setProcessingMethod(candidate.processingMethod);
    if (isOneOf(candidate.grinderType, grinderTypeValues)) setGrinderType(candidate.grinderType);
    if (isOneOf(candidate.freshness, freshnessValues)) setFreshness(candidate.freshness);
    if (isOneOf(candidate.filterType, filterTypeValues)) setFilterType(candidate.filterType);
    if (typeof candidate.chicoryPercent === "string") setChicoryPercent(candidate.chicoryPercent);
    if (candidate.arabicaGrade === "" || isOneOf(candidate.arabicaGrade, arabicaGradeValues)) {
      setArabicaGrade(candidate.arabicaGrade);
    }
    if (isOneOf(candidate.elevationBand, elevationBandValues)) setElevationBand(candidate.elevationBand);
    if (isOneOf(candidate.extractionQuality, extractionQualityValues)) {
      setExtractionQuality(candidate.extractionQuality);
    }
    if (isOneOf(candidate.cultivar, cultivarValues)) setCultivar(candidate.cultivar);
    if (isOneOf(candidate.originRegion, originRegionValues)) setOriginRegion(candidate.originRegion);
  }

  async function handleLoadSession(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed) || !isRecord(parsed.inputs)) {
        throw new Error("JSON does not match the CaffiLab session format.");
      }

      applySessionInputs(parsed.inputs);
      setSessionMessage(`Session loaded from ${file.name}.`);
      setSessionMessageTone("ok");
      setShowAdvanced(true);
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Could not load the session file.");
      setSessionMessageTone("error");
    } finally {
      event.target.value = "";
    }
  }

  async function handleDownloadReport() {
    const generatedAt = new Date().toISOString();
    const generatedLabel = formatIsoTimestamp(generatedAt);
    const methodLabel = BREW_METHODS[brewMethod].label;
    let logoDataUrl = "";
    let horizontalFooterLogoDataUrl = "";

    try {
      const [iconResponse, footerResponse] = await Promise.all([
        fetch("/brand/icon_logo_light.png", { cache: "force-cache" }),
        fetch("/brand/Horizontal_logo_light.png", { cache: "force-cache" }),
      ]);

      if (iconResponse.ok) {
        logoDataUrl = await blobToDataUrl(await iconResponse.blob());
      }
      if (footerResponse.ok) {
        horizontalFooterLogoDataUrl = await blobToDataUrl(await footerResponse.blob());
      }
    } catch {
      logoDataUrl = "";
      horizontalFooterLogoDataUrl = "";
    }

    const brewDurationHours = brewMethod === "cold_brew" || brewMethod === "cold_drip" ? 2.5 : 0.75;
    const peakTimeHours = Math.max(0.5, brewDurationHours);
    const crashStartHours = peakTimeHours + 2.5;
    const crashEndHours = peakTimeHours + 4.5;
    const halfLifeHours = 5;
    const remainingAfterCrash = Math.round(estimate.estimatedMg * Math.pow(0.5, crashEndHours / halfLifeHours));
    const nextSafeIntakeHours = Math.max(4, Math.ceil(crashEndHours));
    const sleepImpact = estimate.estimatedMg >= 220 ? "High" : estimate.estimatedMg >= 150 ? "Moderate" : "Low";
    const intakeClassification = estimate.estimatedMg >= 300 ? "Very high intake" : estimate.estimatedMg >= 200 ? "High intake" : estimate.estimatedMg >= 100 ? "Moderate intake" : "Low intake";
    const keyInsight = `You will still have about ${remainingAfterCrash} mg of caffeine in your system after ${crashEndHours.toFixed(1)} hours.`;
    const estimatedEspressoShots = Math.max(1, Math.round(estimate.estimatedMg / 75));
    const strengthBand = estimate.estimatedMg >= 260 ? "high" : estimate.estimatedMg >= 140 ? "medium" : "low";
    const remainingPct = Math.round((remainingAfterCrash / estimate.estimatedMg) * 100);
    const intakeAdj = intakeClassification.replace(" intake", "").toLowerCase();
    const timelineRows = [0, 2, 4, 6, 8, 10]
      .map((hour) => {
        const mg = Math.round(estimate.estimatedMg * Math.pow(0.5, hour / halfLifeHours));
        return `<tr><td>${hour} h</td><td>${mg} mg</td></tr>`;
      })
      .join("");

    const brewingRows: Array<[string, string, "primary" | "secondary"]> = [
      ["Method", methodLabel, "primary"],
      ["Brew time", `${brewTimeAmount} ${brewTimeUnit}`, "primary"],
      ["Temperature", `${temperatureAmount} ${temperatureUnit.toUpperCase()}`, "primary"],
      ["Brew water", `${brewWaterAmount} ${brewWaterUnit}`, "secondary"],
      ["Serving volume", `${servingAmount} ${servingUnit}`, "primary"],
      ["Dilution", `${dilutionAmount} ${dilutionUnit}`, "secondary"],
    ];
    const compositionRows: Array<[string, string, "primary" | "secondary"]> = [
      ["Bean species", beanType, "primary"],
      ["Bean detail", beanDetail, "secondary"],
      ["Custom caffeine %", customCaffeinePercent || "Not set", "secondary"],
      ["Arabica %", arabicaPercent, "primary"],
      ["Robusta %", robustaPercent, "primary"],
      ["Chicory %", chicoryPercent, "primary"],
      ["Arabica grade", arabicaGrade || "Not set", "secondary"],
      ["Cultivar", cultivar, "secondary"],
      ["Elevation", elevationBand, "secondary"],
      ["Origin / Region", ORIGIN_REGIONS[originRegion].label, "secondary"],
    ];
    const parameterRows: Array<[string, string, "primary" | "secondary"]> = [
      ["Coffee dose", `${coffeeAmount} ${coffeeUnit}`, "primary"],
      ["Grind", grindSize, "primary"],
      ["Roast", roastLevel, "secondary"],
      ["Extraction yield %", extractionYieldPercent || "Auto", "primary"],
      ["Pressure (bar)", pressureBars || "Not set", "secondary"],
      ["Agitation", agitation, "secondary"],
      ["Water hardness (ppm)", waterHardnessPpm || "Not set", "primary"],
      ["Water pH", waterPh || "Not set", "secondary"],
      ["Freshness", freshness, "secondary"],
      ["Filter", filterType, "secondary"],
      ["Extraction quality", extractionQuality, "secondary"],
      ["Package clue", packageClue, "secondary"],
      ["Price", coffeePrice ? `${coffeePrice} ${priceCurrency}/${priceUnit}` : "Not set", "secondary"],
    ];

    // Phase 8 (v3.1) + Phase 6 (v3.2): Model factors section — shows the actual
    // adjustments applied to F and E, for transparency and auditability.
    const elevationInteractionApplied =
      elevationBand !== "unknown" && estimate.regionFactor !== ORIGIN_REGIONS[originRegion].factor;
    const modelFactorRows: Array<[string, string, "primary" | "secondary"]> = [
      ["Cultivar", cultivar === "unknown" ? "None (default)" : cultivar, "primary"],
      ["Region", ORIGIN_REGIONS[originRegion].label, "primary"],
      ["Region factor applied", `×${estimate.regionFactor.toFixed(4)}`, "primary"],
      ["Elevation × region interaction", elevationInteractionApplied ? "×0.95 applied" : "Not applied", "secondary"],
      ["Elevation E correction (v3.2)", elevationBand === "high" ? "×0.98 applied (dense bean)" : "Not applied", "secondary"],
      ["Elevation", elevationBand === "unknown" ? "Not set" : elevationBand, "secondary"],
      ["Method β (physics class)", `×${estimate.methodBeta.toFixed(3)} (${BREW_METHODS[brewMethod].physics})`, "secondary"],
      ["F constraint", "[0.008, 0.030]", "secondary"],
      ["Calibration α", estimate.calibrationAlpha.toFixed(3), "secondary"],
    ];

    const rowsToHtml = (rows: Array<[string, string, "primary" | "secondary"]>) =>
      rows
        .map(([k, v, tone]) => `<div class="row ${tone === "secondary" ? "row-secondary" : ""}"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`)
        .join("");

    const reportHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Caffeine Impact Report</title>
  <style>
    :root {
      --ink: #111318;
      --muted: #596273;
      --line: #dde3ed;
      --panel: #f7fbff;
      --brand: #0f766e;
      --peak: #15803d;
      --crash: #c2410c;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef2f8;
      color: var(--ink);
      font: 400 14px/1.5 var(--font);
      padding: 24px;
    }
    .sheet {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
      max-width: 980px;
      margin: 0 auto 22px;
      overflow: hidden;
      box-shadow: 0 16px 44px rgba(15, 23, 42, 0.08);
    }
    .page { padding: 28px; }
    .page + .page { border-top: 1px solid var(--line); }
    .top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
    }
    .eyebrow { color: var(--brand); font: 700 11px/1.2 var(--font); letter-spacing: 0.14em; text-transform: uppercase; }
    .personal-label {
      display: inline-block;
      margin-top: 8px;
      border: 1px solid #cdd9e8;
      border-radius: 999px;
      padding: 4px 10px;
      color: #334155;
      font: 600 12px/1.2 var(--font);
      background: #f8fbff;
    }
    .logo {
      width: 132px;
      height: 132px;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 8px;
      object-fit: contain;
      background: #ffffff;
    }
    h1 { margin: 10px 0 4px; font: 700 38px/1.1 var(--font); }
    h2 { margin: 0 0 12px; font: 700 24px/1.15 var(--font); }
    h3 { margin: 0 0 10px; font: 700 16px/1.2 var(--font); }
    p { margin: 0; }
    .sub { color: var(--muted); }
    .hero {
      margin: 22px 0;
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: radial-gradient(circle at 12% 0%, #e4fff6, #f0fbff 40%, #fff8ef 100%);
    }
    .hero-grid {
      margin-top: 14px;
      display: grid;
      gap: 9px;
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
    .metric {
      border: 1px solid #d7e1ed;
      border-radius: 12px;
      padding: 5.13px;
      background: #ffffff;
    }
    .metric span { display: block; color: var(--muted); font: 600 11px/1.2 var(--font); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 5px; }
    .metric strong { font: 700 11.97px/1.1 var(--font); display: block; }
    .metric.hero-strong strong { font: 700 25.75px/1 var(--font); }
    .curve-wrap {
      margin-top: 11.14px;
      padding: 6.86px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #fbfdff;
    }
    .insight {
      margin-top: 14px;
      padding: 14px;
      border-left: 4px solid var(--brand);
      background: #f2fbf9;
      border-radius: 8px;
      font: 600 16px/1.45 var(--font);
    }
    .two-col { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .three-col { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .group {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #ffffff;
      padding: 14px;
    }
    .group.soft { background: var(--panel); }
    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 1px solid #e8edf5;
    }
    .row:last-child { border-bottom: none; }
    .row span { color: var(--muted); }
    .row strong { font: 600 14px/1.4 var(--font); text-align: right; }
    .row-secondary span, .row-secondary strong { color: #8b96a8; }
    .badge {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      font: 700 12px/1.2 var(--font);
    }
    .badge.safe { background: #dcfce7; color: #166534; }
    .badge.warn { background: #fef3c7; color: #92400e; }
    .badge.high { background: #ffe4e6; color: #be123c; }
    .formula {
      background: #f8fbff;
      border: 1px solid #dbe8f8;
      border-radius: 10px;
      padding: 10px;
      font: 500 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      white-space: pre-wrap;
      margin-top: 10px;
    }
    .mini {
      color: var(--muted);
      font: 400 12px/1.4 var(--font);
      margin-top: 8px;
    }
    .strength-bar {
      margin-top: 8.55px;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 6.004px;
      background: #ffffff;
    }
    .strength-track {
      margin-top: 8px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(to right, #dcfce7, #fef3c7, #fecaca);
      position: relative;
      overflow: hidden;
    }
    .strength-marker {
      position: absolute;
      top: -3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #0f172a;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 1px #cbd5e1;
    }
    .footer-brand {
      margin-top: 24px;
      border-top: 1px solid var(--line);
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--muted);
      font: 400 12px/1.4 var(--font);
    }
    .footer-brand img {
      width: 220px;
      height: auto;
      object-fit: contain;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font: 400 14px/1.45 var(--font);
    }
    th, td {
      text-align: left;
      padding: 7px 6px;
      border-bottom: 1px solid #e7edf6;
    }
    th { color: var(--muted); font: 600 12px/1.2 var(--font); text-transform: uppercase; letter-spacing: 0.06em; }
    .footer {
      margin-top: 24px;
      border-top: 1px solid var(--line);
      padding-top: 12px;
      color: var(--muted);
      font: 400 12px/1.4 var(--font);
    }
    .page-break { page-break-after: always; }
    @media print {
      body { margin: 0; padding: 10mm; background: #ffffff; }
      .sheet { box-shadow: none; border: none; border-radius: 0; margin: 0; }
      .page {
        padding: 12mm;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .page-break { page-break-after: always; }
      @page {
        size: auto;
        margin: 0;
      }
    }
    .hero-top { margin-top: 8.55px; }
    .hero-pairs {
      display: grid;
      gap: 5.13px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 5.13px;
    }
    .metric-lf span { margin-top: 0; margin-bottom: 3px; }
    .metric-lf strong { font: 700 13.68px/1.1 var(--font); }
    .insight-card {
      margin-top: 8.55px;
      padding: 10.26px 12.863px;
      background: linear-gradient(135deg, #f0fdf4, #eff6ff);
      border: 1.5px solid #a7f3d0;
      border-radius: 14px;
      text-align: center;
    }
    .insight-main {
      margin: 5px 0 4px;
      font: 700 12.863px/1.3 var(--font);
      color: var(--ink);
    }
    .insight-pct {
      color: var(--brand);
      font: 600 14px/1.4 var(--font);
      margin: 0;
    }
    .you-here-label { position: relative; height: 26px; margin-top: 2px; }
    .you-here-inner {
      position: absolute;
      transform: translateX(-50%);
      text-align: center;
      color: #334155;
      font: 700 10px/1.4 var(--font);
      white-space: nowrap;
    }
    .what-means {
      padding: 14px 16px;
      background: #f8fbff;
      border: 1px solid #dbe8f8;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .wm-title { font: 700 17px/1.2 var(--font); margin: 0 0 8px; }
    .wm-body { font: 400 14px/1.6 var(--font); margin: 0 0 8px; color: var(--ink); }
    .wm-advice { font: 400 13px/1.5 var(--font); color: #78716c; margin: 0; padding: 8px 10px; background: #fff7ed; border-radius: 8px; }
    .table-ref-label { color: var(--muted); font: 500 12px/1.2 var(--font); margin: 14px 0 4px; }
    .deemph-table th, .deemph-table td { padding: 5px 6px; font: 400 12px/1.4 var(--font); }
  </style>
</head>
<body>
  <div class="sheet">
    <section class="page page-break">
      <div class="top">
        <div>
          <div class="eyebrow">ShenoyLabs · CaffiLab</div>
          <h1>Caffeine Impact Report</h1>
          <p class="sub">Generated on ${escapeHtml(generatedLabel)}</p>
          <span class="personal-label">Personal Caffeine Report</span>
        </div>
        ${logoDataUrl ? `<img src="${logoDataUrl}" alt="ShenoyLabs logo" class="logo" />` : ""}
      </div>

      <div class="hero">
        <h2>Hero Metrics</h2>
        <div class="hero-top">
          <div class="metric hero-strong"><strong>${estimate.estimatedMg} mg</strong><span>Total caffeine</span></div>
        </div>
        <div class="hero-pairs">
          <div class="metric metric-lf"><span>Peak</span><strong>~${Math.round(peakTimeHours * 60)} min</strong></div>
          <div class="metric metric-lf"><span>Crash</span><strong>${crashStartHours.toFixed(1)}&#8211;${crashEndHours.toFixed(1)} h</strong></div>
          <div class="metric metric-lf"><span>Sleep impact</span><strong>${sleepImpact}</strong></div>
          <div class="metric metric-lf"><span>Next intake</span><strong>~${nextSafeIntakeHours} h</strong></div>
        </div>
      </div>

      <div class="curve-wrap">
        <h3>Energy Curve</h3>
        <svg viewBox="0 0 560 200" role="img" aria-label="Energy curve showing caffeine lifecycle: peak, stable, and crash zones" style="display: block; width: 57.45%; margin: 0 auto; border: 1px solid var(--line); border-radius: 10px; background: #ffffff;">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#15803d" />
              <stop offset="55%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#c2410c" />
            </linearGradient>
          </defs>
          <polygon points="24,168 98,88 170,44 170,168" fill="rgba(21,128,61,0.10)" />
          <polygon points="170,44 255,68 338,98 420,126 420,168 170,168" fill="rgba(245,158,11,0.08)" />
          <polygon points="420,126 500,145 538,154 538,168 420,168" fill="rgba(194,65,12,0.10)" />
          <line x1="24" y1="168" x2="538" y2="168" stroke="#dbe3ee" stroke-width="1.5" />
          <line x1="170" y1="26" x2="170" y2="168" stroke="#bbf7d0" stroke-dasharray="5 4" stroke-width="1.5" />
          <line x1="420" y1="26" x2="420" y2="168" stroke="#fed7aa" stroke-dasharray="5 4" stroke-width="1.5" />
          <polyline fill="none" stroke="url(#curveGradient)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="24,168 98,88 170,44 255,68 338,98 420,126 500,145 538,154" />
          <text x="144" y="22" style="font: 600 10px sans-serif; fill: #15803d;">Best focus</text>
          <text x="388" y="22" style="font: 600 10px sans-serif; fill: #c2410c;">Crash begins</text>
          <text x="85" y="185" style="font: 700 10px sans-serif; fill: #15803d;">Peak</text>
          <text x="277" y="185" style="font: 700 10px sans-serif; fill: #b45309;">Stable</text>
          <text x="463" y="185" style="font: 700 10px sans-serif; fill: #c2410c;">Crash</text>
        </svg>
        <p class="mini">X-axis: time since intake · Y-axis: estimated caffeine level in system.</p>
      </div>

      <div class="insight-card">
        <div style="font: 700 22px/1 var(--font); margin-bottom: 4px;">&#128161; Key Insight</div>
        <p class="insight-main">~${remainingAfterCrash} mg caffeine remains in your system after ~${Math.round(crashEndHours)} hours</p>
        <p class="insight-pct">~${remainingPct}% of your intake still active.</p>
      </div>

      <div class="strength-bar">
        <h3>Caffeine strength</h3>
        <p class="sub">Equivalent to ~${estimatedEspressoShots} espresso shots.</p>
        <div class="strength-track">
          <div class="strength-marker" style="left: ${strengthBand === "low" ? "16%" : strengthBand === "medium" ? "49%" : "82%"};"></div>
        </div>
        <div class="you-here-label">
          <div class="you-here-inner" style="left: ${strengthBand === "low" ? "16%" : strengthBand === "medium" ? "49%" : "82%"}">&#8593; You are here</div>
        </div>
        <div style="margin-top: 2px; display: flex; justify-content: space-between; color: var(--muted); font: 500 12px/1.2 var(--font);">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
      </div>

      <div class="footer-brand">
        <div>Scientific caffeine estimation engine</div>
        ${horizontalFooterLogoDataUrl ? `<img src="${horizontalFooterLogoDataUrl}" alt="ShenoyLabs" />` : ""}
      </div>
    </section>

    <section class="page page-break">
      <h2>Inputs + Details</h2>
      <p class="sub">All values below are from your exact selections in the calculator.</p>

      <div class="three-col" style="margin-top: 18px;">
        <article class="group soft">
          <h3>Brewing</h3>
          ${rowsToHtml(brewingRows)}
        </article>
        <article class="group soft">
          <h3>Composition</h3>
          ${rowsToHtml(compositionRows)}
        </article>
        <article class="group soft">
          <h3>Parameters</h3>
          ${rowsToHtml(parameterRows)}
        </article>
      </div>

      <div class="group soft" style="margin-top: 14px;">
        <h3>Model factors (v3.1)</h3>
        <div class="three-col" style="column-gap: 12px;">
          ${rowsToHtml(modelFactorRows)}
        </div>
      </div>

      <div class="footer-brand">
        <div>Scientific caffeine estimation engine</div>
        ${horizontalFooterLogoDataUrl ? `<img src="${horizontalFooterLogoDataUrl}" alt="ShenoyLabs" />` : ""}
      </div>
    </section>

    <section class="page">
      <h2>Analysis + Formulas</h2>
      <div class="two-col" style="margin-top: 14px;">
        <article class="group">
          <div class="what-means">
            <p class="wm-title">&#129504; What this means</p>
            <p class="wm-body">You are in the <strong>${escapeHtml(intakeAdj)}</strong> caffeine range. Peak alertness in ~${Math.round(peakTimeHours * 60)} min.</p>
            <p class="wm-advice">Avoid caffeine within 8&#8211;10 hours of sleep to prevent disruption.</p>
          </div>
          <p style="margin: 0 0 8px;"><span class="badge ${estimate.estimatedMg >= 300 ? "high" : estimate.estimatedMg >= 180 ? "warn" : "safe"}">${escapeHtml(intakeClassification)}</span></p>
          <div class="row"><span>Peak window</span><strong>${peakTimeHours.toFixed(1)}&#8211;${(peakTimeHours + 1.6).toFixed(1)} h</strong></div>
          <div class="row"><span>Confidence</span><strong>${estimate.confidenceLabel} (+/&#8722;${estimate.confidencePercent}%)</strong></div>
          <div class="row"><span>Practical range</span><strong>${estimate.practicalLowerMg}&#8211;${estimate.practicalUpperMg} mg</strong></div>
          <div class="row"><span>Strength</span><strong>${estimate.concentrationMgPer100Ml} mg/100ml</strong></div>
        </article>

        <article class="group">
          <h3>Formula Steps</h3>
          <div class="row"><span>Step 1: Coffee dose (G)</span><strong>${estimate.coffeeGrams} g</strong></div>
          <div class="row"><span>Step 2: Caffeine % (F_mid)</span><strong>${(estimate.effectiveCaffeineFraction * 100).toFixed(2)} %</strong></div>
          <div class="row"><span>Step 3: Extraction % (E)</span><strong>${Math.round(estimate.caffeineRecovery * 100)} %</strong></div>
          <div class="row"><span>Final output</span><strong>${estimate.estimatedMg} mg</strong></div>

          <div class="formula">Estimate = G × F_mid × E × 1000
Estimate = ${estimate.coffeeGrams} × ${(estimate.effectiveCaffeineFraction * 100).toFixed(2)}% × ${Math.round(estimate.caffeineRecovery * 100)}% × 1000
Estimate = ${estimate.estimatedMg} mg</div>

          <div class="formula">C = C0 × (1/2)^(t / half_life)
C(${crashEndHours.toFixed(1)}h) = ${estimate.estimatedMg} × (1/2)^(${crashEndHours.toFixed(1)} / ${halfLifeHours})
C(${crashEndHours.toFixed(1)}h) = ${remainingAfterCrash} mg</div>

          <p class="table-ref-label">Detailed breakdown (for reference)</p>
          <table class="deemph-table">
            <thead><tr><th>Time from intake</th><th>Remaining caffeine</th></tr></thead>
            <tbody>${timelineRows}</tbody>
          </table>

          <p class="mini">Half-life decay formula shown for authenticity and residual-caffeine visibility.</p>
        </article>
      </div>

      <div class="footer-brand">
        <div>Scientific caffeine estimation engine</div>
        ${horizontalFooterLogoDataUrl ? `<img src="${horizontalFooterLogoDataUrl}" alt="ShenoyLabs" />` : ""}
      </div>
    </section>
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    const cleanup = () => {
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    };

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      setSessionMessage("Could not initialize report renderer. Please try again.");
      setSessionMessageTone("error");
      cleanup();
      return;
    }

    doc.open();
    doc.write(reportHtml);
    doc.close();

    const printTarget = iframe.contentWindow;
    if (!printTarget) {
      setSessionMessage("Could not prepare report preview. Please try again.");
      setSessionMessageTone("error");
      cleanup();
      return;
    }

    setTimeout(() => {
      printTarget.focus();
      printTarget.print();
      cleanup();
    }, 250);

    setSessionMessage("Report is ready. Choose Save as PDF in the print dialog.");
    setSessionMessageTone("ok");
  }

  useEffect(() => {
    if (beanDetail !== "custom" || !showAdvanced) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      customCaffeineInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      customCaffeineInputRef.current?.focus();
      customCaffeineInputRef.current?.select();
    });

    return () => cancelAnimationFrame(frame);
  }, [beanDetail, showAdvanced]);

  useEffect(() => {
    currentFocusTopicRef.current = focusTopic;
  }, [focusTopic]);

  useEffect(() => {
    const prev = prevEstimatedMgRef.current;
    if (prev !== null) {
      const delta = estimate.estimatedMg - prev;
      if (delta !== 0) {
        setDeltaMg(delta);
        const label = TOPIC_LABELS[currentFocusTopicRef.current] ?? "Input";
        setWhatChanged((prevList) => [
          { id: ++changeIdRef.current, label, deltaMg: delta },
          ...prevList,
        ].slice(0, 4));
      } else {
        setDeltaMg(null);
      }
      // Count-up animation from previous to new estimate
      const start = prev;
      const end = estimate.estimatedMg;
      if (countUpRef.current !== null) cancelAnimationFrame(countUpRef.current);
      const duration = 350;
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplayedMg(Math.round(start + (end - start) * eased));
        if (p < 1) {
          countUpRef.current = requestAnimationFrame(tick);
        } else {
          countUpRef.current = null;
        }
      };
      countUpRef.current = requestAnimationFrame(tick);
    } else {
      setDisplayedMg(estimate.estimatedMg);
    }
    prevEstimatedMgRef.current = estimate.estimatedMg;
    return () => {
      if (countUpRef.current !== null) cancelAnimationFrame(countUpRef.current);
    };
  }, [estimate.estimatedMg]);

  function handleMethodChange(nextMethod: BrewMethod) {
    const nextConfig = BREW_METHODS[nextMethod];
    const nextTimeUnit = nextConfig.timeSensitivity === "cold" ? "hr" : "min";

    setBrewMethod(nextMethod);
    setGrindSize(nextConfig.defaultGrind);
    setBrewWaterUnit("ml");
    setBrewWaterAmount(formatNumber(defaultBrewWaterMl(nextMethod, estimate.coffeeGrams)));
    setFilterType(nextConfig.defaultFilter);
    setBrewTimeUnit(nextTimeUnit);
    setBrewTimeAmount(formatNumber(defaultBrewTimeValue(nextMethod, nextTimeUnit)));
    setTemperatureUnit("c");
    setTemperatureAmount(formatNumber(defaultTemperatureValue(nextMethod, "c")));
    setExtractionYieldPercent("");
    setPressureBars(nextConfig.supportsPressure ? "9" : "");
    setAgitation("none");

    if (nextMethod === "indian_filter") {
      setChicoryPercent("20");
    }
  }

  function handleTimeUnitChange(nextUnit: TimeUnit) {
    setBrewTimeUnit(nextUnit);
    setBrewTimeAmount(formatNumber(defaultBrewTimeValue(brewMethod, nextUnit)));
  }

  function handleTemperatureUnitChange(nextUnit: TemperatureUnit) {
    setTemperatureUnit(nextUnit);
    setTemperatureAmount(formatNumber(defaultTemperatureValue(brewMethod, nextUnit)));
  }

  function handleReset() {
    const defaultMethod: BrewMethod = "pour_over";
    const cfg = BREW_METHODS[defaultMethod];
    setBrewMethod(defaultMethod);
    setCoffeeAmount("20");
    setCoffeeUnit("g");
    setBrewWaterAmount("320");
    setBrewWaterUnit("ml");
    setServingAmount("320");
    setServingUnit("ml");
    setBeanType("unknown");
    setBeanDetail("generic");
    setCustomCaffeinePercent("");
    setArabicaPercent("70");
    setRobustaPercent("30");
    setCoffeePrice("");
    setPriceCurrency("INR");
    setPriceUnit("kg");
    setPackageClue("none");
    setBrewTimeAmount("3.5");
    setBrewTimeUnit("min");
    setDilutionAmount("0");
    setDilutionUnit("ml");
    setGrindSize(cfg.defaultGrind);
    setRoastLevel("medium");
    setTemperatureAmount("94");
    setTemperatureUnit("c");
    setExtractionYieldPercent("");
    setPressureBars("9");
    setAgitation("none");
    setWaterHardnessPpm("");
    setWaterPh("");
    setFreshness("unknown");
    setFilterType("paper");
    setChicoryPercent("20");
    setArabicaGrade("specialty");
    setElevationBand("unknown");
    setExtractionQuality("average");
    setCultivar("unknown");
    setOriginRegion("unknown");
    setFocusTopic("result");
    setShowAdvanced(false);
    setShowExpert(false);
    setShowHowCalculated(false);
    setShowScience(false);
    if (countUpRef.current !== null) {
      cancelAnimationFrame(countUpRef.current);
      countUpRef.current = null;
    }
    prevEstimatedMgRef.current = null;
    setDeltaMg(null);
    setWhatChanged([]);
    setSessionMessage(null);
  }

  return (
    <div className="min-h-screen bg-[#0c0d0b] text-[#f5f1e8]">
      <section className="mx-auto grid w-full max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8 self-start">
          <div className="grid gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-[#46503f] bg-[#151812] px-3 py-1 text-xs font-medium text-[#c7d2ba]">
              <BeakerIcon className="size-4 text-[#9adf8f]" />
              Scientific caffeine estimation
            </div>
            <div className="grid gap-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#f7f3ea] [letter-spacing:0] sm:text-5xl">
                CaffiLab
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#cbd5c0]">
                Scientific caffeine estimation for your exact brew.
              </p>
            </div>
            <div className="rounded-[8px] border border-[#33392f] bg-[#11130f] p-3">
              <figure className="grid gap-3">
                <div className="overflow-hidden rounded-[6px] border border-[#2c3229] bg-[#0f110d]">
                  <Image
                    src="/images/caffilab/drip-brewing.jpg"
                    alt="Coffee dripping into a glass vessel on a counter"
                    width={1280}
                    height={853}
                    sizes="(min-width: 1024px) 43vw, 100vw"
                    priority
                    className="aspect-[16/10] w-full object-cover opacity-80 saturate-[0.85]"
                  />
                </div>
                <figcaption className="text-xs leading-5 text-[#8f9886]">
                  Image: Thomas Martinsen,{" "}
                  <Link
                    href="https://commons.wikimedia.org/wiki/File:Drip_brewing_(Unsplash).jpg"
                    className="underline underline-offset-2"
                  >
                    CC0 public domain via Wikimedia Commons
                  </Link>
                  .
                </figcaption>
              </figure>
            </div>

            <div className="grid gap-3 rounded-[8px] border border-[#33392f] bg-[#10120e] p-4">
              <p className={labelClass}>Articles</p>
              <div className="grid gap-2">
                <Link
                  href="/articles/how-to-use-the-caffilab-caffeine-calculator"
                  className="flex items-center gap-2 rounded-[6px] border border-[#33392f] bg-[#151812] px-3 py-2.5 text-sm text-[#cbd5c0] transition hover:border-[#9adf8f]/40 hover:text-[#f5f1e8]"
                >
                  <BookOpenIcon className="size-4 shrink-0 text-[#9adf8f]" />
                  How to use CaffiLab
                </Link>
                <Link
                  href="/articles/how-does-caffilab-formula-work"
                  className="flex items-center gap-2 rounded-[6px] border border-[#33392f] bg-[#151812] px-3 py-2.5 text-sm text-[#cbd5c0] transition hover:border-[#9adf8f]/40 hover:text-[#f5f1e8]"
                >
                  <BookOpenIcon className="size-4 shrink-0 text-[#9adf8f]" />
                  How the formula works
                </Link>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/support"
                className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border border-[#536048] bg-[#151812] px-3 py-2.5 text-sm font-medium text-[#f2c36b] transition hover:border-[#f2c36b]/50 hover:bg-[#1a1e15]"
              >
                <HeartIcon className="size-4" />
                Support us
              </Link>
              <Link
                href="/contact"
                className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border border-[#3c4337] bg-[#151812] px-3 py-2.5 text-sm font-medium text-[#cbd5c0] transition hover:border-[#9adf8f]/40 hover:text-[#f5f1e8]"
              >
                <MessageCircleIcon className="size-4" />
                Feedback
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[8px] border border-[#33392f] bg-[#10120e] p-5">
            <p className={labelClass}>Recommended daily caffeine intake</p>
            <div className="grid gap-1.5 text-sm text-[#cbd5c0]">
              <div className="flex justify-between border-b border-[#252a21] pb-1.5">
                <span>Adults (19+)</span>
                <span className="font-mono text-[#f5f1e8]">≤ 400 mg</span>
              </div>
              <div className="flex justify-between border-b border-[#252a21] pb-1.5">
                <span>Pregnant / nursing</span>
                <span className="font-mono text-[#f5f1e8]">≤ 200 mg</span>
              </div>
              <div className="flex justify-between border-b border-[#252a21] pb-1.5">
                <span>Teens (13–18)</span>
                <span className="font-mono text-[#f5f1e8]">≤ 100 mg</span>
              </div>
              <div className="flex justify-between">
                <span>Children (4–12)</span>
                <span className="font-mono text-[#f5f1e8]">≤ 2.5 mg/kg</span>
              </div>
            </div>
            <p className="text-xs leading-5 text-[#8f9886]">
              Sources: FDA (2018), EFSA (2015), Health Canada. Children under 4
              should avoid caffeine.
            </p>
          </div>

          <div className="grid gap-3 rounded-[8px] border border-[#33392f] bg-[#10120e] p-5">
            <p className={labelClass}>Model</p>
            <p className="font-mono text-sm text-[#cbd5c0]">
              Estimate = G × F_mid × E × 1000
            </p>
            <p className="text-sm leading-7 text-[#aeb8a5]">
              G = coffee dose (g). F is the bean caffeine fraction modeled as a
              species range (Arabica 1.0–1.6% → midpoint 1.3%; Robusta 2.0–2.7% →
              midpoint 2.35%). Blends use a weighted F range; chicory reduces
              effective F. E is caffeine recovery (method base × small
              adjustments), clamped to 0.42–0.97.
            </p>
            <p className="text-sm leading-7 text-[#aeb8a5]">
              Semi-mechanistic model: core extraction behavior is physics-informed;
              secondary adjustments are empirically calibrated. Uncertainty is split
              into bean variability and brewing uncertainty — the larger of the two
              sets the final cap. Ranges are designed to contain real-world
              measurements rather than predict exact values.
            </p>
            <Link
              href="/articles/how-does-caffilab-formula-work"
              className="mt-2 text-sm text-[#9adf8f] underline underline-offset-2"
            >
              Read the full model
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#4b5545] bg-[#151812] shadow-2xl shadow-black/35">
          <div className="border-b border-[#33392f] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Estimated caffeine</p>
                <p className="mt-2 font-mono text-6xl font-semibold leading-none text-[#9adf8f] [letter-spacing:0] sm:text-7xl">
                  <span key={estimate.estimatedMg} className="animate-in fade-in duration-200">
                    {displayedMg}
                  </span>
                  <span className="ml-2 text-2xl text-[#cbd5c0]">mg</span>
                  {deltaMg !== null && (
                    <span
                      key={deltaMg}
                      className={cn(
                        "ml-3 text-lg font-medium animate-in fade-in slide-in-from-bottom-1 duration-200",
                        deltaMg > 0 ? "text-[#9adf8f]" : "text-[#f87171]",
                      )}
                    >
                      {deltaMg > 0 ? "+" : ""}
                      {deltaMg}
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-[6px] border border-[#536048] bg-[#10120e] px-4 py-3 text-right">
                <p className={labelClass}>Confidence</p>
                <p className="mt-1 text-xl font-semibold text-[#f2c36b] [letter-spacing:0]">
                  {estimate.confidenceLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-1.5 self-start rounded-[6px] border border-[#3c4337] bg-[#11130f] px-3 py-1.5 text-xs font-medium text-[#a9b39c] transition hover:border-[#9adf8f]/50 hover:text-[#f5f1e8]"
            >
              <RotateCcwIcon className="size-3" />
              Reset all
            </button>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="rounded-[6px] border border-[#536048] bg-[#11130f] px-3 py-2 text-xs font-medium text-[#f2c36b] transition hover:border-[#f2c36b]/60 hover:text-[#fde7bc]"
              >
                Download Report (PDF)
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="rounded-[6px] border border-[#3c4337] bg-[#11130f] px-3 py-2 text-xs font-medium text-[#cbd5c0] transition hover:border-[#9adf8f]/50 hover:text-[#f5f1e8]"
              >
                Save Session (JSON)
              </button>
              <button
                type="button"
                onClick={openSessionLoader}
                className="rounded-[6px] border border-[#3c4337] bg-[#11130f] px-3 py-2 text-xs font-medium text-[#cbd5c0] transition hover:border-[#9adf8f]/50 hover:text-[#f5f1e8]"
              >
                Load Session (JSON)
              </button>
              <input
                ref={sessionFileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleLoadSession}
                className="hidden"
              />
            </div>
            {sessionMessage ? (
              <p
                className={cn(
                  "mt-2 text-xs",
                  sessionMessageTone === "error" ? "text-[#f87171]" : "text-[#8fd9a4]",
                )}
              >
                {sessionMessage}
              </p>
            ) : null}
            <div className="mt-6 grid gap-3">
              <RangeVisualizer
                lower={estimate.practicalLowerMg}
                upper={estimate.practicalUpperMg}
                estimateMg={estimate.estimatedMg}
                confidencePercent={estimate.confidencePercent}
              />
              <p className="text-xs text-[#8f9886]">
                Bean-driven range: {estimate.beanLowerMg}–{estimate.beanUpperMg} mg
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[6px] border border-[#33392f] bg-[#10120e] px-3 py-2">
                  <p className={labelClass}>Bean variability</p>
                  <p className="mt-1 text-sm text-[#f5f1e8]">+/-{estimate.beanUncertaintyPercent}%</p>
                </div>
                <div className="rounded-[6px] border border-[#33392f] bg-[#10120e] px-3 py-2">
                  <p className={labelClass}>Brewing uncertainty</p>
                  <p className="mt-1 text-sm text-[#f5f1e8]">+/-{estimate.brewingUncertaintyPercent}%</p>
                </div>
                <div
                  className="rounded-[6px] border border-[#536048] bg-[#10120e] px-3 py-2"
                  title="Confidence cannot outrun bean variability. The final uncertainty is the larger of bean variability and brewing uncertainty."
                >
                  <p className={labelClass}>Applied cap</p>
                  <p className="mt-1 text-sm text-[#f2c36b]">+/-{estimate.confidencePercent}%</p>
                </div>
              </div>
              <div className="border-t border-[#252a21] pt-4">
                {whatChanged.length > 0 && (
                  <div className="mb-4 grid gap-1.5">
                    <p className={labelClass}>What changed</p>
                    {[...whatChanged]
                      .sort((a, b) => Math.abs(b.deltaMg) - Math.abs(a.deltaMg))
                      .map((item, i) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between text-xs",
                            i === 0 && "animate-in fade-in slide-in-from-bottom-2 duration-300",
                          )}
                        >
                          <span className={cn("font-medium", i === 0 ? "text-[#f2c36b]" : "text-[#8f9886]")}>
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              "font-mono font-medium",
                              item.deltaMg > 0 ? "text-[#9adf8f]" : "text-[#f87171]",
                            )}
                          >
                            {item.deltaMg > 0 ? "+" : ""}
                            {item.deltaMg} mg
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowHowCalculated((prev) => !prev)}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-4 text-[#a9b39c] transition-transform duration-200",
                      showHowCalculated && "rotate-180",
                    )}
                  />
                  <span className="text-sm font-medium text-[#cbd5c0]">
                    How was this calculated?
                  </span>
                </button>
                {showHowCalculated && (
                  <div className="mt-3 grid gap-3">
                    <CalculationBar
                      label="Dose (G)"
                      value={estimate.coffeeGrams}
                      max={50}
                      displayValue={`${estimate.coffeeGrams} g`}
                      color="#f2c36b"
                    />
                    <CalculationBar
                      label="Bean strength (F_mid)"
                      value={estimate.effectiveCaffeineFraction * 100}
                      max={2.7}
                      displayValue={`${(estimate.effectiveCaffeineFraction * 100).toFixed(2)}%`}
                      color="#9adf8f"
                    />
                    <CalculationBar
                      label="Extraction (E)"
                      value={estimate.caffeineRecovery * 100}
                      max={100}
                      displayValue={`${Math.round(estimate.caffeineRecovery * 100)}%`}
                      color="#9adf8f"
                    />
                    <p className="text-xs leading-5 text-[#8f9886]">
                      Estimate = G &times; F_mid &times; E &times; 1000 ={" "}
                      {estimate.coffeeGrams} g &times;{" "}
                      {(estimate.effectiveCaffeineFraction * 100).toFixed(2)}% &times;{" "}
                      {Math.round(estimate.caffeineRecovery * 100)}% &asymp;{" "}
                      <span className="font-mono text-[#f5f1e8]">{estimate.estimatedMg} mg</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Method" value={method.label} tone="green" />
              <Stat
                label="Strength"
                value={`${estimate.concentrationMgPer100Ml} mg/100ml`}
              />
              <Stat
                label="Brew ratio"
                value={`1:${estimate.brewRatio}`}
                tone="gold"
              />
            </div>

            <ExtractionCurve key={method.physics} physics={method.physics} extraction={estimate.caffeineRecovery} />

            <div className="grid gap-4 border-t border-[#33392f] pt-5">
              <div className="flex items-center gap-2">
                <GaugeIcon className="size-4 text-[#9adf8f]" />
                <h2 className="text-lg font-semibold text-[#f7f3ea] [letter-spacing:0]">
                  Basic inputs
                </h2>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field
                  label="Brew method"
                  topic="method"
                  onFocus={setFocusTopic}
                  hint={METHOD_DESCRIPTIONS[brewMethod]}
                >
                  <select
                    value={brewMethod}
                    onChange={(event) =>
                      handleMethodChange(event.target.value as BrewMethod)
                    }
                    className={inputClass}
                  >
                    {brewMethods.map(([value, item]) => (
                      <option key={value} value={value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Bean species"
                  topic="bean"
                  onFocus={setFocusTopic}
                  hint={`${estimate.assumedBeanProfile} · ${estimate.beanDetailLabel}`}
                >
                  <select
                    value={beanType}
                    onChange={(event) => setBeanType(event.target.value as BeanType)}
                    className={inputClass}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="arabica">Arabica</option>
                    <option value="robusta">Robusta</option>
                    <option value="blend">Blend</option>
                  </select>
                </Field>

                <Field
                  label="Bean detail"
                  topic="bean_detail"
                  onFocus={setFocusTopic}
                  hint={
                    beanDetail === "custom"
                      ? "Custom selected. Enter the value in the Custom caffeine % field below in Advanced inputs."
                      : "Optional. Use this only if you know the bean tends lower or higher in caffeine, or you have a measured caffeine percentage."
                  }
                >
                  <select
                    value={beanDetail}
                    onChange={(event) => {
                      const nextDetail = event.target.value as BeanDetail;
                      setBeanDetail(nextDetail);
                      setFocusTopic("bean_detail");

                      if (nextDetail === "custom") {
                        setShowAdvanced(true);
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="generic">Generic range</option>
                    <option value="high_altitude">High-altitude</option>
                    <option value="low_altitude">Low-altitude</option>
                    <option value="custom">Custom caffeine %</option>
                  </select>
                </Field>

                <Field
                  label="Processing method"
                  topic="bean_detail"
                  onFocus={setFocusTopic}
                  hint="Washed beans extract slightly more; natural less."
                >
                  <select
                    value={processingMethod}
                    onChange={(event) => setProcessingMethod(event.target.value as ProcessingMethod)}
                    className={inputClass}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="washed">Washed / wet-processed</option>
                    <option value="honey">Honey / semi-washed</option>
                    <option value="natural">Natural / dry-processed</option>
                  </select>
                </Field>

                <Field
                  label="Coffee"
                  topic="coffee"
                  onFocus={setFocusTopic}
                  hint={`Dose: ${estimate.coffeeGrams} g after unit conversion.`}
                >
                  <SplitInput
                    amount={coffeeAmount}
                    amountLabel="Coffee amount"
                    onAmountChange={setCoffeeAmount}
                  >
                    <select
                      aria-label="Coffee unit"
                      value={coffeeUnit}
                      onChange={(event) => setCoffeeUnit(event.target.value as WeightUnit)}
                      className={inputClass}
                    >
                      <option value="g">g</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                    </select>
                  </SplitInput>
                </Field>

                <Field
                  label="Brew water"
                  topic="water"
                  onFocus={setFocusTopic}
                  hint={`Recipe water: ${estimate.brewWaterMl} ml. Method target: 1:${estimate.targetBrewRatio}.`}
                >
                  <SplitInput
                    amount={brewWaterAmount}
                    amountLabel="Brew water amount"
                    onAmountChange={setBrewWaterAmount}
                  >
                    <select
                      aria-label="Brew water unit"
                      value={brewWaterUnit}
                      onChange={(event) => setBrewWaterUnit(event.target.value as VolumeUnit)}
                      className={inputClass}
                    >
                      <option value="ml">ml</option>
                      <option value="fl_oz">fl oz</option>
                      <option value="l">L</option>
                    </select>
                  </SplitInput>
                </Field>

                <Field
                  label="Beverage volume"
                  topic="serving"
                  onFocus={setFocusTopic}
                  hint={`Final cup: ${estimate.beverageMl} ml.`}
                >
                  <SplitInput
                    amount={servingAmount}
                    amountLabel="Beverage amount"
                    onAmountChange={setServingAmount}
                  >
                    <select
                      aria-label="Serving unit"
                      value={servingUnit}
                      onChange={(event) => setServingUnit(event.target.value as VolumeUnit)}
                      className={inputClass}
                    >
                      <option value="ml">ml</option>
                      <option value="fl_oz">fl oz</option>
                      <option value="l">L</option>
                    </select>
                  </SplitInput>
                </Field>
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#33392f] pt-5">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex w-full items-center gap-2 text-left"
              >
                <SlidersHorizontalIcon className="size-4 text-[#f2c36b]" />
                <h2 className="text-lg font-semibold text-[#f7f3ea] [letter-spacing:0]">
                  Advanced inputs
                </h2>
                <ChevronDownIcon
                  className={cn(
                    "ml-auto size-5 text-[#a9b39c] transition-transform duration-200",
                    showAdvanced && "rotate-180",
                  )}
                />
              </button>
              {showAdvanced && (
              <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {beanType === "unknown" ? (
                  <Field
                    label="Package clue"
                    topic="package"
                    onFocus={setFocusTopic}
                    hint="More reliable than price when the bag gives a hint."
                  >
                    <select
                      value={packageClue}
                      onChange={(event) =>
                        setPackageClue(event.target.value as PackageClue)
                      }
                      className={inputClass}
                    >
                      <option value="none">No useful label</option>
                      <option value="specialty_single_origin">
                        Specialty / single origin
                      </option>
                      <option value="espresso_blend">Espresso blend</option>
                      <option value="south_indian_filter">
                        South Indian filter blend
                      </option>
                      <option value="commercial_instant">
                        Commercial / instant
                      </option>
                    </select>
                  </Field>
                ) : null}

                {beanType === "unknown" ? (
                  <Field
                    label="Coffee price"
                    topic="price"
                    onFocus={setFocusTopic}
                    hint="Optional secondary clue for Not sure."
                  >
                    <div className="grid gap-2">
                      <input
                        aria-label="Coffee price"
                        value={coffeePrice}
                        onChange={(event) => setCoffeePrice(event.target.value)}
                        inputMode="decimal"
                        min="0"
                        placeholder={priceCurrency === "INR" ? "1200" : "14"}
                        type="number"
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          aria-label="Price currency"
                          value={priceCurrency}
                          onChange={(event) =>
                            setPriceCurrency(event.target.value as PriceCurrency)
                          }
                          className={inputClass}
                        >
                          {priceCurrencies.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="Price unit"
                          value={priceUnit}
                          onChange={(event) => setPriceUnit(event.target.value as PriceUnit)}
                          className={inputClass}
                        >
                          <option value="kg">per kg</option>
                          <option value="lb">per lb</option>
                        </select>
                      </div>
                    </div>
                  </Field>
                ) : null}

                {beanType === "blend" ? (
                  <Field
                    label="Blend split"
                    topic="blend"
                    onFocus={setFocusTopic}
                    hint="Default is 70% Arabica / 30% Robusta."
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        aria-label="Arabica percentage"
                        value={arabicaPercent}
                        onChange={(event) => setArabicaPercent(event.target.value)}
                        inputMode="decimal"
                        max="100"
                        min="0"
                        type="number"
                        className={inputClass}
                      />
                      <input
                        aria-label="Robusta percentage"
                        value={robustaPercent}
                        onChange={(event) => setRobustaPercent(event.target.value)}
                        inputMode="decimal"
                        max="100"
                        min="0"
                        type="number"
                        className={inputClass}
                      />
                    </div>
                  </Field>
                ) : null}

                {beanDetail === "custom" ? (
                  <Field
                    label="Custom caffeine %"
                    topic="bean_detail"
                    onFocus={setFocusTopic}
                    hint="Enter the dry-weight caffeine percentage if you have a measured or published value for this bean."
                  >
                    <input
                      ref={customCaffeineInputRef}
                      aria-label="Custom caffeine percentage"
                      value={customCaffeinePercent}
                      onChange={(event) => setCustomCaffeinePercent(event.target.value)}
                      inputMode="decimal"
                      max="6"
                      min="0.1"
                      placeholder="1.25"
                      type="number"
                      className={inputClass}
                    />
                  </Field>
                ) : null}

                <Field
                  label="Brew time"
                  topic="time"
                  onFocus={setFocusTopic}
                  hint={
                    method.requiresTimeInput
                      ? "This method benefits from an explicit time."
                      : "Default filled from the selected brew method."
                  }
                >
                  <SplitInput
                    amount={brewTimeAmount}
                    amountLabel="Brew time"
                    min="0"
                    onAmountChange={setBrewTimeAmount}
                  >
                    <select
                      aria-label="Brew time unit"
                      value={brewTimeUnit}
                      onChange={(event) => handleTimeUnitChange(event.target.value as TimeUnit)}
                      className={inputClass}
                    >
                      <option value="min">min</option>
                      <option value="hr">hr</option>
                    </select>
                  </SplitInput>
                </Field>

                <Field
                  label="Dilution"
                  topic="dilution"
                  onFocus={setFocusTopic}
                  hint={`Added liquid in final cup: ${estimate.dilutionMl} ml.`}
                >
                  <SplitInput
                    amount={dilutionAmount}
                    amountLabel="Dilution amount"
                    min="0"
                    onAmountChange={setDilutionAmount}
                  >
                    <select
                      aria-label="Dilution unit"
                      value={dilutionUnit}
                      onChange={(event) => setDilutionUnit(event.target.value as VolumeUnit)}
                      className={inputClass}
                    >
                      <option value="ml">ml</option>
                      <option value="fl_oz">fl oz</option>
                      <option value="l">L</option>
                    </select>
                  </SplitInput>
                </Field>

                <Field
                  label="Grind size"
                  topic="grind"
                  onFocus={setFocusTopic}
                  hint={`Auto default for ${method.label}.`}
                >
                  <select
                    value={grindSize}
                    onChange={(event) => setGrindSize(event.target.value as GrindSize)}
                    className={inputClass}
                  >
                    {grindSizes.map(([value, item]) => (
                      <option key={value} value={value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Grinder type"
                  topic="grind"
                  onFocus={setFocusTopic}
                  hint="Blade grinders produce uneven particles, reducing recovery."
                >
                  <select
                    value={grinderType}
                    onChange={(event) => setGrinderType(event.target.value as GrinderType)}
                    className={inputClass}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="burr">Burr grinder</option>
                    <option value="blade">Blade grinder</option>
                  </select>
                </Field>

                <Field
                  label="Roast level"
                  topic="roast"
                  onFocus={setFocusTopic}
                  hint="Medium is the neutral default."
                >
                  <select
                    value={roastLevel}
                    onChange={(event) => setRoastLevel(event.target.value as RoastLevel)}
                    className={inputClass}
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                    <option value="very_dark">Very Dark (French / Italian)</option>
                  </select>
                </Field>

                <Field
                  label="Temperature"
                  topic="temperature"
                  onFocus={setFocusTopic}
                  hint={`Method default: ${formatNumber(defaultTemperatureValue(brewMethod, temperatureUnit))} ${unitLabel(temperatureUnit)}.`}
                >
                  <SplitInput
                    amount={temperatureAmount}
                    amountLabel="Temperature"
                    min="0"
                    onAmountChange={setTemperatureAmount}
                  >
                    <select
                      aria-label="Temperature unit"
                      value={temperatureUnit}
                      onChange={(event) =>
                        handleTemperatureUnitChange(event.target.value as TemperatureUnit)
                      }
                      className={inputClass}
                    >
                      <option value="c">C</option>
                      <option value="f">F</option>
                    </select>
                  </SplitInput>
                </Field>

                <Field
                  label="Extraction yield"
                  topic="yield"
                  onFocus={setFocusTopic}
                  hint={`Auto uses ${estimate.extractionYieldPercent}% for this method.`}
                >
                  <input
                    value={extractionYieldPercent}
                    onChange={(event) => setExtractionYieldPercent(event.target.value)}
                    inputMode="decimal"
                    max="32"
                    min="8"
                    placeholder={String(method.defaultYieldPercent)}
                    type="number"
                    className={inputClass}
                  />
                </Field>

                {method.supportsPressure ? (
                  <Field
                    label="Pressure"
                    topic="pressure"
                    onFocus={setFocusTopic}
                    hint="Espresso target is around 9 bar."
                  >
                    <input
                      value={pressureBars}
                      onChange={(event) => setPressureBars(event.target.value)}
                      inputMode="decimal"
                      max="15"
                      min="1"
                      type="number"
                      className={inputClass}
                    />
                  </Field>
                ) : null}

                {method.supportsAgitation ? (
                  <Field
                    label="Agitation"
                    topic="agitation"
                    onFocus={setFocusTopic}
                    hint="Stirring or turbulence increases contact."
                  >
                    <select
                      value={agitation}
                      onChange={(event) =>
                        setAgitation(event.target.value as AgitationLevel)
                      }
                      className={inputClass}
                    >
                      <option value="none">None</option>
                      <option value="gentle">Gentle</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                ) : null}

                <Field
                  label="Water hardness"
                  topic="water_chemistry"
                  onFocus={setFocusTopic}
                  hint="Optional. Balanced is 50–150 ppm. Hard water >250 ppm."
                >
                  <input
                    value={waterHardnessPpm}
                    onChange={(event) => setWaterHardnessPpm(event.target.value)}
                    inputMode="decimal"
                    max="1000"
                    min="0"
                    placeholder="ppm (e.g. 120)"
                    type="number"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Water pH"
                  topic="water_chemistry"
                  onFocus={setFocusTopic}
                  hint="Optional. Neutral is near 7.0."
                >
                  <input
                    value={waterPh}
                    onChange={(event) => setWaterPh(event.target.value)}
                    inputMode="decimal"
                    max="10"
                    min="4"
                    placeholder="7.0"
                    type="number"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Bean freshness"
                  topic="freshness"
                  onFocus={setFocusTopic}
                  hint="Rested is usually most predictable."
                >
                  <select
                    value={freshness}
                    onChange={(event) => setFreshness(event.target.value as Freshness)}
                    className={inputClass}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="fresh">Very fresh</option>
                    <option value="rested">Rested</option>
                    <option value="stale">Stale / old</option>
                  </select>
                </Field>

                <Field
                  label="Filter type"
                  topic="filter"
                  onFocus={setFocusTopic}
                  hint={`Auto default for ${method.label}.`}
                >
                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value as FilterType)}
                    className={inputClass}
                  >
                    <option value="paper">Paper</option>
                    <option value="metal">Metal</option>
                    <option value="cloth">Cloth</option>
                    <option value="none">No filter</option>
                  </select>
                </Field>

                {brewMethod === "indian_filter" ? (
                  <Field
                    label="Chicory"
                    topic="chicory"
                    onFocus={setFocusTopic}
                    hint="Traditional blends often sit around 10-20% chicory."
                  >
                    <input
                      value={chicoryPercent}
                      onChange={(event) => setChicoryPercent(event.target.value)}
                      inputMode="decimal"
                      max="60"
                      min="0"
                      type="number"
                      className={inputClass}
                    />
                  </Field>
                ) : null}

                <div className="min-h-[122px] rounded-[8px] border border-[#33392f] bg-[#10120e] p-4">
                  <div className="flex items-center gap-2">
                    <ActivityIcon className="size-4 text-[#9adf8f]" />
                    <p className={labelClass}>Known inputs</p>
                  </div>
                  <p className="mt-3 font-mono text-3xl font-semibold text-[#f5f1e8] [letter-spacing:0]">
                    {estimate.knownInputs}/{estimate.availableInputs}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8f9886]">
                    Counts only the inputs that apply to this recipe. Each declared
                    input reduces the plausible range of brewing variability based on
                    empirical sensitivity. Bean variability still sets a hard floor.
                  </p>
                </div>
              </div>
              )}
            </div>

            <div className="grid gap-4 border-t border-[#33392f] pt-5">
              <button
                type="button"
                onClick={() => setShowExpert((prev) => !prev)}
                className="flex w-full items-center gap-2 text-left"
              >
                <FlaskConicalIcon className="size-4 text-[#9adf8f]" />
                <h2 className="text-lg font-semibold text-[#f7f3ea] [letter-spacing:0]">
                  Expert inputs
                </h2>
                <ChevronDownIcon
                  className={cn(
                    "ml-auto size-5 text-[#a9b39c] transition-transform duration-200",
                    showExpert && "rotate-180",
                  )}
                />
              </button>
              {showExpert && (
                <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {beanType === "arabica" || beanType === "blend" ? (
                    <Field
                      label="Arabica grade"
                      topic="arabica_grade"
                      onFocus={setFocusTopic}
                      hint="Specialty (1.2–1.6 %) or Commercial (1.0–1.2 %) narrows the caffeine tier."
                    >
                      <select
                        value={arabicaGrade}
                        onChange={(event) =>
                          setArabicaGrade(event.target.value as ArabicaGrade | "")
                        }
                        className={inputClass}
                      >
                        <option value="specialty">Specialty (1.2–1.6 %)</option>
                        <option value="commercial">Commercial (1.0–1.2 %)</option>
                      </select>
                    </Field>
                  ) : null}

                  <Field
                    label="Growing elevation"
                    topic="elevation"
                    onFocus={setFocusTopic}
                    hint="Higher altitude shifts the caffeine range slightly upward."
                  >
                    <select
                      value={elevationBand}
                      onChange={(event) =>
                        setElevationBand(event.target.value as ElevationBand)
                      }
                      className={inputClass}
                    >
                      <option value="unknown">Unknown</option>
                      <option value="low">Low (&lt; 800 m)</option>
                      <option value="mid">Mid (800–1500 m)</option>
                      <option value="high">High (&gt; 1500 m)</option>
                    </select>
                  </Field>

                  {method.supportsPressure ? (
                    <Field
                      label="Extraction quality"
                      topic="extraction_quality"
                      onFocus={setFocusTopic}
                      hint="Channeling or puck prep quality for espresso."
                    >
                      <select
                        value={extractionQuality}
                        onChange={(event) =>
                          setExtractionQuality(event.target.value as ExtractionQuality)
                        }
                        className={inputClass}
                      >
                        <option value="average">Average</option>
                        <option value="well_prepared">Well-prepared</option>
                        <option value="poor">Poor / uneven</option>
                      </select>
                    </Field>
                  ) : null}

                  {beanType === "arabica" || beanType === "blend" ? (
                    <Field
                      label="Cultivar"
                      topic="cultivar"
                      onFocus={setFocusTopic}
                      hint="Named cultivar narrows the bean fraction range based on published HPLC data."
                    >
                      <select
                        value={cultivar}
                        onChange={(event) => setCultivar(event.target.value as Cultivar)}
                        className={inputClass}
                      >
                        <option value="unknown">Unknown</option>
                        <option value="geisha">Geisha (~0.9–1.1 %)</option>
                        <option value="sl28">SL28 (~1.3–1.7 %)</option>
                        <option value="caturra">Caturra (~1.0–1.3 %)</option>
                        <option value="catimor">Catimor (~1.5–2.0 %)</option>
                      </select>
                    </Field>
                  ) : null}

                  <Field
                    label="Origin / Region"
                    topic="origin_region"
                    onFocus={setFocusTopic}
                    hint="Select the broad growing region to apply a regional caffeine factor (v3.0 model)."
                  >
                    <select
                      value={originRegion}
                      onChange={(event) => setOriginRegion(event.target.value as OriginRegion)}
                      className={inputClass}
                    >
                      {originRegionValues.map((r) => (
                        <option key={r} value={r}>
                          {ORIGIN_REGIONS[r].label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
            </div>

            <div className="grid gap-4 border-t border-[#33392f] pt-5">
              <button
                type="button"
                onClick={() => setShowScience((prev) => !prev)}
                className="flex w-full items-center gap-2 text-left"
              >
                <MicroscopeIcon className="size-4 text-[#cbd5c0]" />
                <h2 className="text-lg font-semibold text-[#f7f3ea] [letter-spacing:0]">
                  Advanced science
                </h2>
                <ChevronDownIcon
                  className={cn(
                    "ml-auto size-5 text-[#a9b39c] transition-transform duration-200",
                    showScience && "rotate-180",
                  )}
                />
              </button>
              {showScience && (
                <div className="grid gap-5">
                  <div>
                    <p className={labelClass}>Semi-mechanistic model</p>
                    <p className="mt-2 text-sm leading-7 text-[#aeb8a5]">
                      Core extraction behavior is physics-informed: brew physics family, time
                      sensitivity, ratio effects, and temperature are all modeled from first
                      principles. Secondary adjustments (grind deviation, roast, agitation,
                      freshness, filter type, water chemistry) are empirically calibrated
                      deltas, each bounded to ±0.01–0.05. The model does not simulate
                      molecular diffusion; it maps well-studied physical variables to
                      calibrated recovery adjustments.
                    </p>
                  </div>
                  <div>
                    <p className={labelClass}>Arrhenius cold brew model</p>
                    <p className="mt-2 text-sm leading-7 text-[#aeb8a5]">
                      Cold brew and cold drip use an Arrhenius-derived extraction model.
                      Caffeine diffusivity at cold temperatures follows D(T) = D0 × exp(−Ea/RT),
                      where Ea ≈ 25 kJ/mol and D0 is calibrated to 22 °C. Extraction
                      approaches equilibrium as E = E_ceiling × (1 − exp(−t/τ)), where τ ≈ 3 h
                      at room temperature. User-specified brew temperature shifts τ via the
                      Arrhenius factor.
                    </p>
                  </div>
                  <div>
                    <p className={labelClass}>Uncertainty model</p>
                    <p className="mt-2 text-sm leading-7 text-[#aeb8a5]">
                      Uncertainty splits into two independent components. Bean variability
                      reflects the caffeine fraction range for the declared or inferred species.
                      Brewing uncertainty starts at a method-specific base and narrows as you
                      declare more inputs. The larger of the two sets the final cap: ranges
                      are designed to contain real-world measurements rather than predict exact
                      values.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[8px] border border-[#33392f] bg-[#10120e] p-4">
              <p className={labelClass}>Explanation</p>
              <p className="mt-2 text-sm leading-7 text-[#cbd5c0]">
                {explanation}
              </p>
              <p className="mt-3 text-xs leading-6 text-[#8f9886]">
                This is an estimate based on coffee extraction science. Actual
                caffeine may vary by cultivar, altitude, roast, water chemistry,
                brewing geometry, and measurement method.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
