import { describe, expect, it } from "vitest";

import { estimateCaffeine, type CaffiLabInput } from "../src/lib/caffilab";

const baseInput: Omit<
  CaffiLabInput,
  | "brewMethod"
  | "coffeeAmount"
  | "brewWaterAmount"
  | "servingAmount"
  | "beanType"
  | "brewTimeAmount"
  | "grindSize"
  | "temperatureAmount"
> = {
  coffeeUnit: "g",
  brewWaterUnit: "ml",
  servingUnit: "ml",
  brewTimeUnit: "min",
  dilutionAmount: 0,
  dilutionUnit: "ml",
  roastLevel: "medium",
  temperatureUnit: "c",
  agitation: "none",
  waterMinerals: "unknown",
  freshness: "unknown",
  filterType: "paper",
};

describe("CaffiLab estimator", () => {
  it("uses the calibrated caffeine formula for a known arabica espresso", () => {
    const estimate = estimateCaffeine({
      ...baseInput,
      brewMethod: "espresso",
      coffeeAmount: 18,
      brewWaterAmount: 40,
      servingAmount: 40,
      beanType: "arabica",
      brewTimeAmount: 0.5,
      grindSize: "fine",
      temperatureAmount: 93,
      pressureBars: 9,
      filterType: "metal",
    });

    expect(estimate.estimatedMg).toBe(158);
    expect(estimate.lowerMg).toBe(122);
    expect(estimate.upperMg).toBe(194);
    expect(estimate.beanUncertaintyPercent).toBe(23.1);
    expect(estimate.brewingUncertaintyPercent).toBe(5);
    expect(estimate.confidenceLabel).toBe("Medium");
  });

  it("keeps unknown inputs conservative with a wider range", () => {
    const estimate = estimateCaffeine({
      ...baseInput,
      brewMethod: "pour_over",
      coffeeAmount: 20,
      brewWaterAmount: 320,
      servingAmount: 320,
      beanType: "unknown",
      brewTimeAmount: undefined,
      grindSize: "medium_fine",
      temperatureAmount: undefined,
    });

    expect(estimate.estimatedMg).toBe(208);
    expect(estimate.confidencePercent).toBe(23.1);
    expect(estimate.confidenceLabel).toBe("Medium");
    expect(estimate.lowerMg).toBe(160);
    expect(estimate.upperMg).toBe(256);
    expect(estimate.beanUncertaintyPercent).toBeGreaterThan(
      estimate.brewingUncertaintyPercent,
    );
  });

  it("uses brew water for ratio while dilution only changes concentration", () => {
    const withoutDilution = estimateCaffeine({
      ...baseInput,
      brewMethod: "cold_brew",
      coffeeAmount: 40,
      brewWaterAmount: 240,
      servingAmount: 250,
      beanType: "robusta",
      brewTimeAmount: 16,
      brewTimeUnit: "hr",
      grindSize: "extra_coarse",
      temperatureAmount: 22,
      filterType: "cloth",
    });
    const withDilution = estimateCaffeine({
      ...baseInput,
      brewMethod: "cold_brew",
      coffeeAmount: 40,
      brewWaterAmount: 240,
      servingAmount: 340,
      beanType: "robusta",
      brewTimeAmount: 16,
      brewTimeUnit: "hr",
      dilutionAmount: 90,
      dilutionUnit: "ml",
      grindSize: "extra_coarse",
      temperatureAmount: 22,
      filterType: "cloth",
    });

    expect(withDilution.estimatedMg).toBe(withoutDilution.estimatedMg);
    expect(withDilution.dilutionFactor).toBe(0.735);
    expect(withDilution.brewRatio).toBe(6);
    expect(withDilution.concentrationMgPer100Ml).toBeLessThan(
      withoutDilution.concentrationMgPer100Ml,
    );
  });

  it("reduces caffeine for Indian filter coffee chicory blends", () => {
    const withoutChicory = estimateCaffeine({
      ...baseInput,
      brewMethod: "indian_filter",
      coffeeAmount: 20,
      brewWaterAmount: 120,
      servingAmount: 120,
      beanType: "blend",
      arabicaPercent: 70,
      robustaPercent: 30,
      brewTimeAmount: 12,
      grindSize: "fine",
      temperatureAmount: 96,
      filterType: "metal",
      chicoryPercent: 0,
    });
    const withChicory = estimateCaffeine({
      ...baseInput,
      brewMethod: "indian_filter",
      coffeeAmount: 20,
      brewWaterAmount: 120,
      servingAmount: 120,
      beanType: "blend",
      arabicaPercent: 70,
      robustaPercent: 30,
      brewTimeAmount: 12,
      grindSize: "fine",
      temperatureAmount: 96,
      filterType: "metal",
      chicoryPercent: 20,
    });

    expect(withChicory.estimatedMg).toBeLessThan(withoutChicory.estimatedMg);
    expect(withChicory.estimatedMg).toBe(187);
    expect(withChicory.beanLowerMg).toBe(151);
    expect(withChicory.beanUpperMg).toBe(224);
  });

  it("prefers package clues over price for unknown bean species", () => {
    const estimate = estimateCaffeine({
      ...baseInput,
      brewMethod: "drip_machine",
      coffeeAmount: 18,
      brewWaterAmount: 300,
      servingAmount: 280,
      beanType: "unknown",
      packageClue: "commercial_instant",
      coffeePrice: 30,
      priceCurrency: "USD",
      priceUnit: "lb",
      brewTimeAmount: 5,
      grindSize: "medium",
      temperatureAmount: 93,
    });

    expect(estimate.assumedBeanProfile).toContain("robusta-forward");
    expect(estimate.estimatedMg).toBeGreaterThan(250);
  });

  it("lets custom bean detail remove bean variability while preserving brewing uncertainty", () => {
    const estimate = estimateCaffeine({
      ...baseInput,
      brewMethod: "pour_over",
      coffeeAmount: 20,
      brewWaterAmount: 320,
      servingAmount: 320,
      beanType: "arabica",
      beanDetail: "custom",
      customCaffeinePercent: 1.3,
      brewTimeAmount: 3.5,
      grindSize: "medium_fine",
      temperatureAmount: 94,
    });

    expect(estimate.lowerMg).toBe(estimate.upperMg);
    expect(estimate.beanUncertaintyPercent).toBe(0);
    expect(estimate.brewingUncertaintyPercent).toBe(5);
    expect(estimate.confidencePercent).toBe(5);
    expect(estimate.confidenceLabel).toBe("Very High");
  });
});
