# Complementary 5-Year CVD Risk Calculator — Static HTML/JS Version

This package is a pure front-end implementation of the CBC-based 5-year cardiovascular disease risk calculator. It does **not** require Streamlit, Python, a backend server, or a database. All calculations run locally in the browser.

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
