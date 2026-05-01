# Complementary 5-Year CVD Risk Calculator — Static HTML/JS Version

This package is a pure front-end implementation of the CBC-based 5-year cardiovascular disease risk calculator. It does **not** require Streamlit, Python, a backend server, or a database. All calculations run locally in the browser.

## Why this version avoids sleep

The previous version was a Streamlit app and required a running Python process. Free Streamlit hosting can sleep after inactivity. This static version contains only HTML, CSS, and JavaScript, so it can be hosted on static-site platforms such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel without a continuously running server.

## File structure

```text
cbc_cvd_static_calculator/
├── index.html                       # Main web page and UI structure
├── .nojekyll                        # Disables Jekyll processing on GitHub Pages
├── README.md                        # Project overview and local-use guide
├── DEPLOYMENT_GUIDE.md              # Deployment instructions in Chinese
├── docs/
│   └── model_validation.md          # Example outputs for checking JavaScript calculations
└── assets/
    ├── css/
    │   └── styles.css               # Visual style, layout, responsive design, print style
    ├── img/
    │   └── favicon.svg              # Browser icon
    └── js/
        ├── model-parameters.js      # Model constants and default cases
        ├── calculator.js            # Pure calculation functions
        └── app.js                   # Browser UI logic and event handling
```

## Code structure and purpose

### `index.html`
Defines the calculator interface:

- patient profile inputs
- primary Model 2 output panel
- optional WHO and Model 3 comparison cards
- technical notes
- print/copy controls

### `assets/js/model-parameters.js`
Stores model parameters and input ranges:

- WHO East Asia coefficients
- local recalibration parameters
- Model 2 sex-specific Cox coefficients, baseline survival, means, and SDs
- Model 3 coefficients inherited from the current Streamlit package
- input ranges and default demo cases

To make the website **Model 2 only**, set:

```js
window.CBC_CVD_CONFIG = {
  appMode: "primary-only",
  riskBands: {
    lowUpper: 0.025,
    borderlineUpper: 0.05
  }
};
```

### `assets/js/calculator.js`
Contains model-independent and model-specific calculation functions:

- input sanitization and range clipping
- Cox model risk calculation
- WHO 10-year to 5-year conversion and local recalibration
- risk category classification
- percent formatting

### `assets/js/app.js`
Connects the calculation functions with the web interface:

- listens to input changes
- updates risk values and risk categories
- updates the gauge
- copies results to clipboard
- triggers print/save-as-PDF

### `assets/css/styles.css`
Controls layout and appearance:

- desktop and mobile responsive layout
- EHJ-style white-card scientific interface
- risk category badges
- print-friendly output

## Local preview

Because this is a static site, you can simply open `index.html` in a browser. For a more reliable local preview, run one of the following commands in the project folder.

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using VS Code:

- install the Live Server extension
- right-click `index.html`
- choose **Open with Live Server**

## Model note

The primary published calculator should be **Model 2 Cox** unless the exact Model 3 sex-specific 5-year baseline survival is verified. Model 2 is implemented as the primary output. WHO and Model 3 are retained as optional comparison modules.

## Disclaimer

This calculator is intended for research, manuscript demonstration, and implementation-oriented exploration. It is not a diagnostic device and does not replace clinical judgement.
