# Model validation examples

These examples are used to check whether the JavaScript implementation returns the expected Model 2 Cox risk estimates.

## Female demo case

Input:

```text
Sex: Female
Age: 56 years
WBC: 6.10 ×10^9/L
RBC: 4.32 ×10^12/L
HRR: 10.31
BMI: 23.1 kg/m^2
SBP: 130 mmHg
Smoking: No
```

Expected outputs from the static JavaScript implementation:

```text
Model 2 Cox 5-year risk: approximately 2.30%
WHO recalibrated 5-year risk: approximately 2.45%
Model 3 Cox 5-year risk: approximately 2.30%
```

## Male demo case

Input:

```text
Sex: Male
Age: 58 years
WBC: 6.80 ×10^9/L
RBC: 4.72 ×10^12/L
HRR: 11.61
BMI: 23.3 kg/m^2
SBP: 131 mmHg
Smoking: No
```

Expected outputs from the static JavaScript implementation:

```text
Model 2 Cox 5-year risk: approximately 3.25%
WHO recalibrated 5-year risk: approximately 2.20%
Model 3 Cox 5-year risk: approximately 3.25%
```

## Formula for Model 2

For each sex-specific Model 2 Cox model:

```text
z_j = (x_j - mean_j) / sd_j
LP = sum(beta_j * z_j)
Risk at 5 years = 1 - S0(5)^exp(LP)
```

Model 2 predictors:

```text
age, HRR, RBC, WBC
```
