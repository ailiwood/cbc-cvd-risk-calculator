(function () {
  "use strict";

  const params = window.CBC_CVD_PARAMS;
  const config = window.CBC_CVD_CONFIG;

  function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function clamp(x, min, max) {
    const number = Number(x);
    if (!Number.isFinite(number)) return null;
    return Math.max(min, Math.min(max, number));
  }

  function getRbcRange(sex) {
    return sex === "Male" ? params.RANGES.rbc_male : params.RANGES.rbc_female;
  }

  function logit(p) {
    const clipped = Math.min(Math.max(p, 1e-9), 1 - 1e-9);
    return Math.log(clipped / (1 - clipped));
  }

  function expit(x) {
    return 1 / (1 + Math.exp(-x));
  }

  function smokingValue(smoking) {
    if (smoking === "Yes") return 1;
    if (smoking === "No") return 0;
    return null;
  }

  function formatPercent(risk, digits = 2) {
    if (risk === null || risk === undefined || !Number.isFinite(risk)) return "—";
    return `${(risk * 100).toFixed(digits)}%`;
  }

  function classifyRisk(risk) {
    if (risk === null || risk === undefined || !Number.isFinite(risk)) {
      return { label: "Unavailable", className: "badge-na" };
    }
    if (risk < config.riskBands.lowUpper) {
      return { label: "Low risk", className: "badge-low" };
    }
    if (risk < config.riskBands.borderlineUpper) {
      return { label: "Borderline risk", className: "badge-borderline" };
    }
    return { label: "High risk", className: "badge-high" };
  }

  function sanitizeValues(rawValues) {
    const sex = rawValues.sex === "Male" ? "Male" : "Female";
    const rbcRange = getRbcRange(sex);
    return {
      sex,
      age: clamp(toNumber(rawValues.age), params.RANGES.age.min, params.RANGES.age.max),
      wbc: clamp(toNumber(rawValues.wbc), params.RANGES.wbc.min, params.RANGES.wbc.max),
      rbc: clamp(toNumber(rawValues.rbc), rbcRange.min, rbcRange.max),
      hrr: clamp(toNumber(rawValues.hrr), params.RANGES.hrr.min, params.RANGES.hrr.max),
      bmi: clamp(toNumber(rawValues.bmi), params.RANGES.bmi.min, params.RANGES.bmi.max),
      sbp: clamp(toNumber(rawValues.sbp), params.RANGES.sbp.min, params.RANGES.sbp.max),
      smoking: ["Yes", "No", "Unknown"].includes(rawValues.smoking) ? rawValues.smoking : "Unknown"
    };
  }

  function whoRaw10y(sex, age, bmi, sbp, smoking) {
    const p = params.WHO_EAST_ASIA[sex];
    const ageCentered = age - 60.0;
    const bmiCentered = bmi - 25.0;
    const sbpCentered = sbp - 120.0;

    function oneOutcome(name) {
      const q = p[name];
      const lp = (
        q.age * ageCentered +
        q.bmi * bmiCentered +
        q.sbp * sbpCentered +
        q.smk * smoking +
        q.age_bmi * ageCentered * bmiCentered +
        q.age_sbp * ageCentered * sbpCentered +
        q.age_smk * ageCentered * smoking
      );
      return 1 - Math.pow(q.s0_10y, Math.exp(lp));
    }

    const rChd = oneOutcome("chd");
    const rStroke = oneOutcome("stroke");
    return 1 - (1 - rChd) * (1 - rStroke);
  }

  function calculateWhoRecalibrated5y(values) {
    if ([values.age, values.bmi, values.sbp].some((x) => x === null)) {
      return { risk: null, status: "Missing age, BMI, or SBP" };
    }
    const smk = smokingValue(values.smoking);
    if (smk === null) {
      return { risk: null, status: "Smoking status required" };
    }
    const raw10 = whoRaw10y(values.sex, values.age, values.bmi, values.sbp, smk);
    const raw5 = 1 - Math.sqrt(1 - raw10);
    const recal = params.WHO_RECAL[values.sex];
    const risk = expit(recal.alpha + recal.beta * logit(raw5));
    return { risk, status: "Available" };
  }

  function calculateStandardizedCox(values, cfg, requiredKeys, options = {}) {
    if (!cfg || cfg.s0_5y === null || cfg.s0_5y === undefined) {
      return { risk: null, status: "Baseline survival not configured" };
    }

    let lp = 0;
    for (const key of requiredKeys) {
      const value = values[key];
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return { risk: null, status: `Missing ${key.toUpperCase()}` };
      }
      const z = (value - cfg.mu[key]) / cfg.sd[key];
      lp += cfg.beta[key] * z;
    }

    if (options.includeSmoking) {
      const smk = smokingValue(values.smoking);
      if (smk === null) {
        return { risk: null, status: "Smoking status required" };
      }
      lp += cfg.beta.smoking * smk;
    }

    const relativeHazard = Math.exp(lp);
    const risk = 1 - Math.pow(cfg.s0_5y, relativeHazard);
    return { risk, status: "Available", lp, relativeHazard };
  }

  function calculateAll(rawValues) {
    const values = sanitizeValues(rawValues);
    const model2 = calculateStandardizedCox(
      values,
      params.MODEL2[values.sex],
      ["age", "hrr", "rbc", "wbc"]
    );
    const who = calculateWhoRecalibrated5y(values);
    const model3 = calculateStandardizedCox(
      values,
      params.MODEL3[values.sex],
      ["age", "bmi", "sbp", "hrr", "rbc", "wbc"],
      { includeSmoking: true }
    );

    return { values, model2, who, model3 };
  }

  window.CbcCvdCalculator = {
    calculateAll,
    classifyRisk,
    formatPercent,
    sanitizeValues,
    getRbcRange
  };
})();
