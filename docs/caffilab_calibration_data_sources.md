# CaffiLab Calibration Data Sources

This guide lists primary sources for calibration data and how to map them into `CalibrationSample` rows.

## High-priority sources

1. **UC Davis / Cotter-Ristenpart dataset (percolation class, 3186 rows)**
- DOI page: https://doi.org/10.25338/B8993H
- Dryad dataset page: https://datadryad.org/dataset/doi%3A10.25338/B8993H
- File: `cotter_dataset.csv`
- Why: large controlled drip/percolation dataset with `Dose`, `Brew Mass`, `TDS`, `% Extraction`, and brew temperatures (87/90/93 C).
- Note: automated CLI download may be blocked by Dryad WAF/token checks; use browser download if you hit 403.

2. **Fuller & Rao 2017 (cold immersion, direct HPLC)**
- Article: https://www.nature.com/articles/s41598-017-18247-4
- Table 2 (cold brew concentrations): https://www.nature.com/articles/s41598-017-18247-4/tables/2
- Table 3 (cold vs hot comparison): https://www.nature.com/articles/s41598-017-18247-4/tables/3
- Why: direct HPLC measurements with explicit brew conditions.

3. **Stanek et al. 2021 (cold brew + hot + percolated cold, direct HPLC)**
- Article: https://www.nature.com/articles/s41598-021-01001-2
- Table 1 (mg/100 g by method and origin): https://www.nature.com/articles/s41598-021-01001-2/tables/1
- Why: direct HPLC values in a table that can be converted to `measuredMg`.

## Secondary validation sources

1. **Mystkowska et al. 2024 review (range sanity checks, not sample-level calibration)**
- Article: https://www.mdpi.com/2076-3417/14/23/11395
- Use for method-level concentration envelopes (mg/100 mL).

2. **Kaggle global coffee health dataset (synthetic population baseline only)**
- Dataset: https://www.kaggle.com/datasets/uom190346a/global-coffee-health-dataset/data
- Not suitable for direct calibration (`measuredMg` is synthetic), but useful for plausibility checks.

## Conversion formulas

1. **From mg/L concentration to `measuredMg`**
- `measuredMg = concentration_mg_per_L * (beverageVolumeMl / 1000)`

2. **From mg/100 g coffee dose to `measuredMg`**
- `measuredMg = concentration_mg_per_100g * (doseG / 100)`

3. **From TDS-derived concentration (Dryad/Cotter)**
- With TDS as `% mass` and brew mass in g:
- dissolved solids (g) = `brewMassG * (tdsPercent / 100)`
- estimated caffeine (g) = `dissolvedSolidsG * 0.035`
- `measuredMg = estimatedCaffeineG * 1000`
- Equivalent short form: `measuredMg = brewMassG * tdsPercent * 0.35`

## Mapping notes for `CalibrationSample`

- `brewMethod`: use `drip_machine` for Cotter/Dryad rows.
- `physics`: use `percolation` for drip rows.
- `doseG`: from dataset `Dose` column.
- `beverageVolumeMl`: use brew mass in grams as mL approximation.
- `temperatureC`: from measured brew temperature.
- `grindCategory`, `roastLevel`, `beanType`: if missing, use controlled defaults and document assumptions in `notes`.
- `predictedMg`: compute via `estimateCaffeine()` with the mapped brew inputs.
- `dataQuality`: `direct_hplc` for Fuller/Stanek table rows; `tds_derived` for Cotter/Dryad rows.

## Compute updated calibration constants

Once you assemble calibration rows (JSON array or JSONL; each row must include `physics`, `predictedMg`, `measuredMg`):

```bash
node scripts/caffilab-calibration-report.mjs data/caffilab/calibration-samples.json
```

The script prints:
- global `CALIBRATION_ALPHA` recommendation
- per-physics `PER_METHOD_BETA` recommendations (applied only when `n >= 5`, clamped to `[0.9, 1.1]`)
- valid vs invalid row counts so malformed/unmapped rows are easy to spot
