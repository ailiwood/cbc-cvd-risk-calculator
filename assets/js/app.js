(function () {
  "use strict";

  const calc = window.CbcCvdCalculator;
  const params = window.CBC_CVD_PARAMS;
  const config = window.CBC_CVD_CONFIG;

  const $ = (id) => document.getElementById(id);
  const form = $("calculatorForm");
  const inputs = {
    age: $("age"),
    wbc: $("wbc"),
    rbc: $("rbc"),
    hrr: $("hrr"),
    bmi: $("bmi"),
    sbp: $("sbp"),
    smoking: $("smoking")
  };

  function getSelectedSex() {
    const checked = document.querySelector('input[name="sex"]:checked');
    return checked ? checked.value : "Female";
  }

  function setSelectedSex(sex) {
    const target = document.querySelector(`input[name="sex"][value="${sex}"]`);
    if (target) target.checked = true;
    updateRbcLimits(sex);
  }

  function setInputValue(id, value) {
    if (inputs[id]) inputs[id].value = value;
  }

  function loadCase(sex) {
    setSelectedSex(sex);
    const d = params.DEFAULT_CASES[sex];
    setInputValue("age", d.age);
    setInputValue("wbc", d.wbc.toFixed(2));
    setInputValue("rbc", d.rbc.toFixed(2));
    setInputValue("hrr", d.hrr.toFixed(2));
    setInputValue("bmi", d.bmi.toFixed(1));
    setInputValue("sbp", d.sbp.toFixed(0));
    inputs.smoking.value = d.smoking;
    render();
  }

  function getRawValues() {
    return {
      sex: getSelectedSex(),
      age: inputs.age.value,
      wbc: inputs.wbc.value,
      rbc: inputs.rbc.value,
      hrr: inputs.hrr.value,
      bmi: inputs.bmi.value,
      sbp: inputs.sbp.value,
      smoking: inputs.smoking.value
    };
  }

  function updateRbcLimits(sex) {
    const range = calc.getRbcRange(sex);
    inputs.rbc.min = range.min;
    inputs.rbc.max = range.max;
  }

  function setBadge(element, classification) {
    element.className = `badge ${classification.className}`;
    element.textContent = classification.label;
  }

  function setResult(prefix, result) {
    const riskEl = $(`${prefix}Risk`);
    const badgeEl = $(`${prefix}Badge`);
    const statusEl = $(`${prefix}Status`);
    if (riskEl) riskEl.textContent = calc.formatPercent(result.risk);
    if (badgeEl) setBadge(badgeEl, calc.classifyRisk(result.risk));
    if (statusEl) statusEl.textContent = result.status || "—";
  }

  function polarPoint(percent) {
    // percent on a semicircle: 0 = left end, 1 = right end
    const angle = Math.PI * (1 - percent);
    const cx = 90;
    const cy = 90;
    const r = 70;
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle)
    };
  }

  function updateGauge(risk) {
    const fill = $("model2Gauge");
    const dot = $("model2Needle");
    const capped = Number.isFinite(risk) ? Math.min(Math.max(risk / 0.10, 0), 1) : 0;
    const point = polarPoint(capped);
    const largeArc = capped > 0.5 ? 1 : 0;
    fill.setAttribute("d", `M20 90 A70 70 0 ${largeArc} 1 ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
    dot.setAttribute("cx", point.x.toFixed(3));
    dot.setAttribute("cy", point.y.toFixed(3));

    if (!Number.isFinite(risk)) {
      fill.style.stroke = "#cbd5e1";
    } else if (risk < window.CBC_CVD_CONFIG.riskBands.lowUpper) {
      fill.style.stroke = "#16a34a";
    } else if (risk < window.CBC_CVD_CONFIG.riskBands.borderlineUpper) {
      fill.style.stroke = "#d97706";
    } else {
      fill.style.stroke = "#dc2626";
    }
  }

  function makeCaseSummary(values) {
    const smokingText = {
      Yes: "current smoking",
      No: "non-smoking",
      Unknown: "smoking status unavailable"
    }[values.smoking] || "smoking status unavailable";

    return [
      `<strong>${values.sex}</strong>, ${Math.round(values.age)} years`,
      `WBC ${values.wbc.toFixed(2)} ×10⁹/L · RBC ${values.rbc.toFixed(2)} ×10¹²/L · HRR ${values.hrr.toFixed(2)}`,
      `BMI ${values.bmi === null ? "—" : values.bmi.toFixed(1)} kg/m² · SBP ${values.sbp === null ? "—" : values.sbp.toFixed(0)} mmHg · ${smokingText}`
    ].join("<br />");
  }

  function interpretation(result) {
    const risk = result.model2.risk;
    if (!Number.isFinite(risk)) {
      return {
        title: "Primary CBC model output is unavailable.",
        text: "Please enter age, WBC, RBC, and HRR within the specified input ranges."
      };
    }
    if (risk < config.riskBands.lowUpper) {
      return {
        title: "The primary CBC model indicates lower 5-year risk.",
        text: "Use this result as a complementary screening signal alongside clinical context and local prevention workflows."
      };
    }
    if (risk < config.riskBands.borderlineUpper) {
      return {
        title: "The primary CBC model indicates borderline 5-year risk.",
        text: "A borderline estimate should be interpreted with other risk factors and may warrant structured follow-up assessment."
      };
    }
    return {
      title: "The primary CBC model indicates elevated 5-year risk.",
      text: "This pattern supports follow-up risk assessment in an EHR-based opportunistic screening workflow."
    };
  }

  function render() {
    updateRbcLimits(getSelectedSex());
    const result = calc.calculateAll(getRawValues());

    $("caseSummary").innerHTML = makeCaseSummary(result.values);

    $("model2Risk").textContent = calc.formatPercent(result.model2.risk);
    setBadge($("model2Badge"), calc.classifyRisk(result.model2.risk));
    updateGauge(result.model2.risk);

    $("model2RiskSmall").textContent = calc.formatPercent(result.model2.risk);
    setBadge($("model2BadgeSmall"), calc.classifyRisk(result.model2.risk));
    $("model2Status").textContent = result.model2.status;

    setResult("who", result.who);
    setResult("model3", result.model3);

    const note = interpretation(result);
    $("interpretationTitle").textContent = note.title;
    $("interpretationText").textContent = note.text;

    window.__lastCbcCvdResult = result;
  }

  function copyResult() {
    const result = window.__lastCbcCvdResult || calc.calculateAll(getRawValues());
    const v = result.values;
    const lines = [
      "Complementary 5-Year CVD Risk Calculator",
      `Sex: ${v.sex}`,
      `Age: ${Math.round(v.age)} years`,
      `WBC: ${v.wbc.toFixed(2)} ×10^9/L`,
      `RBC: ${v.rbc.toFixed(2)} ×10^12/L`,
      `HRR: ${v.hrr.toFixed(2)}`,
      `BMI: ${v.bmi === null ? "NA" : v.bmi.toFixed(1)} kg/m^2`,
      `SBP: ${v.sbp === null ? "NA" : v.sbp.toFixed(0)} mmHg`,
      `Smoking: ${v.smoking}`,
      `Model 2 Cox 5-year CVD risk: ${calc.formatPercent(result.model2.risk)}`,
      `WHO recalibrated 5-year CVD risk: ${calc.formatPercent(result.who.risk)}`,
      `Model 3 Cox 5-year CVD risk: ${calc.formatPercent(result.model3.risk)}`
    ];
    const text = lines.join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = $("copyResultBtn");
        const old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = old; }, 1200);
      });
    } else {
      window.prompt("Copy result", text);
    }
  }

  function initialize() {
    if (config.appMode === "primary-only") {
      $("comparisonSection").style.display = "none";
    }

    document.querySelectorAll('input[name="sex"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const sex = getSelectedSex();
        const current = calc.calculateAll(getRawValues()).values;
        updateRbcLimits(sex);
        // If changing to male and previous RBC is above female range, keep current value within new range.
        inputs.rbc.value = current.rbc.toFixed(2);
        render();
      });
    });

    Object.values(inputs).forEach((input) => input.addEventListener("input", render));
    inputs.smoking.addEventListener("change", render);

    $("femaleDemoBtn").addEventListener("click", () => loadCase("Female"));
    $("maleDemoBtn").addEventListener("click", () => loadCase("Male"));
    $("resetBtn").addEventListener("click", () => loadCase(getSelectedSex()));
    $("printBtn").addEventListener("click", () => window.print());
    $("copyResultBtn").addEventListener("click", copyResult);

    $("comparisonToggle").addEventListener("change", (event) => {
      $("comparisonGrid").hidden = !event.target.checked;
    });

    $("technicalToggle").addEventListener("click", () => {
      const body = $("technicalBody");
      const expanded = $("technicalToggle").getAttribute("aria-expanded") === "true";
      $("technicalToggle").setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
      $("technicalToggle").querySelector("span:last-child").textContent = expanded ? "+" : "−";
    });

    loadCase("Female");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
