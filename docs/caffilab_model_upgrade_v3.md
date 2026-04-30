# CaffiLab — Scientific Model Upgrade Spec (v3.0)

## 🎯 Objective
Refine the existing caffeine estimation model WITHOUT breaking:
- Core formula
- Existing UX
- PDF output structure

Upgrade focus:
- Improve scientific accuracy
- Add contextual intelligence (region + cultivar)
- Maintain simplicity and explainability

---

# 🧠 CORE PRINCIPLE

DO NOT modify the base formula:

Caffeine (mg) = G × F × E × 1000

All improvements must happen inside:
→ F (caffeine fraction)
→ Confidence estimation (variance)

---

# 🧩 ARCHITECTURE UPGRADE

## Replace:

F = static or loosely derived value

## With:

F = F_base × F_region × F_cultivar

---

# 🚀 PHASE 1 — REGION MODEL (LOW RISK, HIGH IMPACT)

## 🎯 Goal
Introduce region-based adjustment to caffeine fraction

---

## 🌍 UI ADDITION

Add dropdown:

Label: "Origin / Region"

Options:
- India / Southeast Asia
- Africa (Kenya, Ethiopia)
- Latin America (Brazil, Colombia)
- Not sure (default)

---

## 🧮 MODEL LOGIC

### Base:
Use existing species-based caffeine %

### Region Factor Table:

| Region | Multiplier |
|--------|-----------|
| India / SE Asia | 1.05 – 1.10 |
| Africa | 0.95 – 1.05 |
| Latin America | 1.00 |
| Unknown | 1.00 |

---

## 💻 IMPLEMENTATION

Example:

```js
const regionFactor = getRegionFactor(region);
F = baseCaffeine * regionFactor;
```

---

## 📊 CONFIDENCE ADJUSTMENT

Add:

- Known region → reduce variance slightly
- Unknown → keep baseline

Example:

Base variance = ±10%
If region selected → ±9%

---

## 🧾 PDF ADDITION

Add line:

"Adjusted for region: India / Southeast Asia"

---

## ⚠️ CONSTRAINTS

- Do NOT increase UI friction
- Default must work without input
- Backward compatibility required

---

# 🚀 PHASE 2 — CULTIVAR MODEL (CONTROLLED ADVANCED INPUT)

## 🎯 Goal
Add genetic layer (cultivar type) without complexity explosion

---

## 🌱 UI ADDITION

Label: "Cultivar Type (Optional)"

Options:
- Classic Arabica (default)
- Hybrid (Catimor / Cauvery)
- Specialty (Geisha / SL28 / rare)

---

## 🧮 MODEL LOGIC

### Cultivar Factor Table:

| Type | Multiplier |
|------|-----------|
| Classic Arabica | 0.95 – 1.05 |
| Hybrid | 1.05 – 1.15 |
| Specialty | 0.90 – 1.00 |

---

## 💻 IMPLEMENTATION

```js
const cultivarFactor = getCultivarFactor(type);
F = baseCaffeine * regionFactor * cultivarFactor;
```

---

## 📊 CONFIDENCE ADJUSTMENT

| Factor | Effect |
|--------|--------|
| Hybrid | +2% variance |
| Specialty | -1% variance |
| Unknown | baseline |

---

## 🧾 PDF ADDITION

Add:

"Adjusted for cultivar type: Hybrid"

---

# 🧠 SMART DEFAULT LOGIC

If user does NOT select:

- Region → default = neutral (1.00)
- Cultivar → default = Classic Arabica

---

## ⚠️ WHAT NOT TO DO

- Do NOT expose specific cultivars (S795, SL28, etc.)
- Do NOT add altitude, soil, farm-level inputs
- Do NOT overfit values
- Do NOT break existing flows

---

# 📊 VALIDATION STRATEGY

After implementation:

1. Compare outputs before vs after
2. Ensure deviation stays within ±15%
3. Validate against known caffeine ranges

---

# 🚀 ROLLOUT PLAN

## Phase 1:
- Add region input
- Apply region factor
- Update PDF

## Phase 2:
- Add cultivar input
- Apply cultivar factor
- Update confidence model

---

# 🎯 SUCCESS CRITERIA

- No UX friction increase
- Improved scientific credibility
- Output remains stable and explainable
- Users perceive smarter results

---

# 🧠 FINAL NOTE

This is NOT adding features.

This is upgrading:
→ Model intelligence
→ Scientific grounding
→ Product differentiation

Maintain simplicity.
Maximize explainability.
