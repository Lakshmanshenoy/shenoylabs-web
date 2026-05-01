#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const MIN_SAMPLES_PER_CLASS = 5;
const BETA_MIN = 0.9;
const BETA_MAX = 1.1;

const PHYSICS_CLASSES = [
  "pressure",
  "percolation",
  "immersion",
  "cold_immersion",
  "cold_drip",
  "hybrid",
];

function median(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function loadRecords(content, inputPath) {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Error(`Input file is empty: ${inputPath}`);
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.data)) return parsed.data;
      if (Array.isArray(parsed.records)) return parsed.records;
    }
    throw new Error("JSON payload is not an array or known wrapper.");
  } catch {
    const lines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const records = [];
    for (const [index, line] of lines.entries()) {
      try {
        records.push(JSON.parse(line));
      } catch {
        throw new Error(
          `Unable to parse input as JSON or JSONL. Failed at JSONL line ${index + 1}.`,
        );
      }
    }
    return records;
  }
}

function parseSamples(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("Expected a JSON array of calibration samples.");
  }

  const parsed = raw.map((sample, index) => {
    const predictedMg = toNumberOrNull(sample?.predictedMg);
    const measuredMg = toNumberOrNull(sample?.measuredMg);
    const physics = typeof sample?.physics === "string" ? sample.physics : null;

    const valid =
      predictedMg !== null &&
      predictedMg > 0 &&
      measuredMg !== null &&
      measuredMg >= 0 &&
      physics !== null;

    return {
      index,
      id: typeof sample?.id === "string" ? sample.id : `row-${index + 1}`,
      physics,
      predictedMg,
      measuredMg,
      ratio: valid ? measuredMg / predictedMg : null,
      valid,
    };
  });

  return parsed;
}

function computeGlobalAlpha(samples) {
  const ratios = samples.filter((s) => s.valid).map((s) => s.ratio);
  const alpha = median(ratios);
  return alpha ?? 1.0;
}

function computePerClassStats(samples) {
  return PHYSICS_CLASSES.map((physics) => {
    const classSamples = samples.filter((s) => s.valid && s.physics === physics);
    const ratios = classSamples.map((s) => s.ratio);
    const rawMedian = median(ratios);

    let beta = null;
    if (rawMedian !== null && classSamples.length >= MIN_SAMPLES_PER_CLASS) {
      beta = clamp(rawMedian, BETA_MIN, BETA_MAX);
    }

    return {
      physics,
      sampleCount: classSamples.length,
      medianRatio: rawMedian,
      beta,
    };
  });
}

function countUnknownPhysics(samples) {
  const known = new Set(PHYSICS_CLASSES);
  return samples.filter((s) => s.valid && !known.has(s.physics)).length;
}

function formatNumber(value, decimals = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return Number(value).toFixed(decimals);
}

function printHumanSummary(result) {
  console.log("CaffiLab calibration summary");
  console.log("=");
  console.log(`Input file: ${result.inputFile}`);
  console.log(`Total rows: ${result.totalRows}`);
  console.log(`Valid rows: ${result.validRows}`);
  console.log(`Invalid rows (missing physics/predictedMg/measuredMg): ${result.invalidRows}`);
  console.log(`Valid rows with unknown physics labels: ${result.unknownPhysicsRows}`);
  console.log(`Global alpha (median measured/predicted): ${formatNumber(result.globalAlpha, 6)}`);
  console.log("");
  console.log("Per-class stats:");

  for (const row of result.perClass) {
    console.log(
      `- ${row.physics}: n=${row.sampleCount}, median=${formatNumber(row.medianRatio, 6)}, beta=${row.beta === null ? "not applied" : formatNumber(row.beta, 3)}`,
    );
  }

  console.log("");
  console.log("Patch hints:");
  console.log(`- CALIBRATION_ALPHA = ${formatNumber(result.globalAlpha, 6)}`);
  for (const row of result.perClass) {
    if (row.beta !== null) {
      console.log(`- PER_METHOD_BETA.${row.physics} = ${formatNumber(row.beta, 3)}`);
    }
  }
}

function main() {
  const inputPathArg = process.argv[2];
  if (!inputPathArg) {
    console.error("Usage: node scripts/caffilab-calibration-report.mjs <samples.json>");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputPathArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = loadRecords(fs.readFileSync(inputPath, "utf8"), inputPath);
  const samples = parseSamples(raw);
  const validRows = samples.filter((s) => s.valid).length;

  const result = {
    generatedAt: new Date().toISOString(),
    inputFile: inputPath,
    totalRows: samples.length,
    validRows,
    invalidRows: samples.length - validRows,
    unknownPhysicsRows: countUnknownPhysics(samples),
    globalAlpha: computeGlobalAlpha(samples),
    perClass: computePerClassStats(samples),
  };

  printHumanSummary(result);
  console.log("");
  console.log("JSON output:");
  console.log(JSON.stringify(result, null, 2));
}

main();
