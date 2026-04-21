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
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import {
  BREW_METHODS,
  GRIND_SIZES,
  defaultBrewWaterMl,
  defaultBrewTimeValue,
  defaultTemperatureValue,
  estimateCaffeine,
  type AgitationLevel,
  type ArabicaGrade,
  type BeanDetail,
  type BeanType,
  type BrewMethod,
  type ElevationBand,
  type ExtractionQuality,
  type FilterType,
  type Freshness,
  type GrindSize,
  type PackageClue,
  type PriceCurrency,
  type PriceUnit,
  type RoastLevel,
  type TemperatureUnit,
  type TimeUnit,
  type VolumeUnit,
  type WaterMinerals,
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
  | "extraction_quality";

const brewMethods = Object.entries(BREW_METHODS) as Array<
  [BrewMethod, (typeof BREW_METHODS)[BrewMethod]]
>;

const grindSizes = Object.entries(GRIND_SIZES) as Array<
  [GrindSize, (typeof GRIND_SIZES)[GrindSize]]
>;

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
    water_chemistry: "Water minerals and pH are a small caffeine correction but a meaningful extraction clue. Balanced mineral water is treated as closest to specialty brewing standards.",
    freshness: "Bean freshness changes gas, flow, and extraction behavior. Very fresh coffee can resist even extraction; stale coffee often loses volatile structure and extracts less predictably.",
    filter: "Filter type mainly changes oils and insoluble material, but it can slightly shift measured strength. Paper is a touch cleaner/lower; metal and no-filter methods retain more material.",
    chicory: `Indian filter coffee often includes chicory. CaffiLab defaults to ${chicoryPercent || "20"}% chicory for this method; chicory contributes body and bitterness but essentially no caffeine.`,
    arabica_grade: "Arabica quality grade splits the species caffeine range in two tiers. Specialty (1.2–1.6 %) represents washed/natural single-origins and high-quality lots; Commercial (1.0–1.2 %) covers commodity-grade arabica. If unsure, the default Specialty tier is used.",
    elevation: "Growing elevation slightly correlates with caffeine content through UV exposure and pest pressure. High-altitude farms (>1500 m) shift the estimated range upward by ~15 % of the range width; low-altitude (<800 m) shifts it downward by the same amount.",
    extraction_quality: "Espresso extraction quality captures channeling and puck preparation. A poorly prepared puck (uneven tamping, channeling) reduces caffeine extraction significantly; a well-prepared shot can yield a small recovery gain. Average is the neutral default.",
  };

  return notes[focusTopic];
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
  const [waterMinerals, setWaterMinerals] = useState<WaterMinerals>("unknown");
  const [waterPh, setWaterPh] = useState("");
  const [freshness, setFreshness] = useState<Freshness>("unknown");
  const [filterType, setFilterType] = useState<FilterType>("paper");
  const [chicoryPercent, setChicoryPercent] = useState("20");
  const [arabicaGrade, setArabicaGrade] = useState<ArabicaGrade | "">("specialty");
  const [elevationBand, setElevationBand] = useState<ElevationBand>("unknown");
  const [extractionQuality, setExtractionQuality] = useState<ExtractionQuality>("average");
  const [focusTopic, setFocusTopic] = useState<FocusTopic>("result");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const customCaffeineInputRef = useRef<HTMLInputElement | null>(null);

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
        waterMinerals,
        waterPh: parseOptionalNumber(waterPh),
        freshness,
        filterType,
        chicoryPercent: parseOptionalNumber(chicoryPercent),
        arabicaGrade: arabicaGrade === "" ? undefined : arabicaGrade,
        elevationBand,
        extractionQuality,
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
      waterMinerals,
      waterPh,
      robustaPercent,
    ],
  );

  const precision = Math.round(((35 - estimate.confidencePercent) / 30) * 100);
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
    setWaterMinerals("unknown");
    setWaterPh("");
    setFreshness("unknown");
    setFilterType("paper");
    setChicoryPercent("20");
    setArabicaGrade("specialty");
    setElevationBand("unknown");
    setExtractionQuality("average");
    setFocusTopic("result");
    setShowAdvanced(false);
    setShowExpert(false);
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
              Uncertainty is split into bean variability and brewing uncertainty —
              the calculator applies the larger of the two as the final cap.
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
                  {estimate.estimatedMg}
                  <span className="ml-2 text-2xl text-[#cbd5c0]">mg</span>
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
            <div className="mt-6 grid gap-3">
              <div className="h-3 overflow-hidden rounded-[6px] bg-[#252a21]">
                <div
                  className="h-full rounded-[6px] bg-[#9adf8f] transition-all duration-300"
                  style={{ width: `${precision}%` }}
                />
              </div>
              <p className="text-sm text-[#aeb8a5]">
                Practical range: {estimate.practicalLowerMg}-{estimate.practicalUpperMg} mg.
                Bean-driven range: {estimate.beanLowerMg}-{estimate.beanUpperMg} mg.
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

            <div className="grid gap-4 border-t border-[#33392f] pt-5">
              <div className="flex items-center gap-2">
                <GaugeIcon className="size-4 text-[#9adf8f]" />
                <h2 className="text-lg font-semibold text-[#f7f3ea] [letter-spacing:0]">
                  Basic inputs
                </h2>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field label="Brew method" topic="method" onFocus={setFocusTopic}>
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
                  label="Water minerals"
                  topic="water_chemistry"
                  onFocus={setFocusTopic}
                  hint="Balanced approximates specialty brewing water."
                >
                  <select
                    value={waterMinerals}
                    onChange={(event) =>
                      setWaterMinerals(event.target.value as WaterMinerals)
                    }
                    className={inputClass}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="soft">Soft / low mineral</option>
                    <option value="balanced">Balanced</option>
                    <option value="hard">Hard / high alkalinity</option>
                  </select>
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
                    Counts only the inputs that apply to this recipe. More declared
                    brewing inputs reduce the brewing uncertainty, but bean variability
                    still sets a hard floor.
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

                  <div className="rounded-[8px] border border-dashed border-[#33392f] bg-[#10120e] p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(labelClass, "opacity-60")}>Cultivar</span>
                      <span className="rounded-[4px] bg-[#1c2219] px-1.5 py-0.5 text-[10px] font-medium text-[#9adf8f]">
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#8f9886]">
                      Per-cultivar data (Geisha, SL28, Caturra, Catimor) will further
                      narrow the bean fraction range once calibration data is confirmed.
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
