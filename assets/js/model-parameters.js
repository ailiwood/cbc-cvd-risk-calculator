/*
 * Model constants for the static CBC-CVD risk calculator.
 * Values are ported from the current Streamlit deployment package.
 */

window.CBC_CVD_CONFIG = {
  appMode: "primary-plus-comparison", // options: "primary-only", "primary-plus-comparison"
  riskBands: {
    lowUpper: 0.025,
    borderlineUpper: 0.05
  }
};

window.CBC_CVD_PARAMS = {
  WHO_EAST_ASIA: {
    Female: {
      chd: {
        age: 0.1049,
        bmi: 0.0258,
        sbp: 0.0167,
        smk: 1.0931,
        age_bmi: -0.0007,
        age_sbp: -0.0002,
        age_smk: -0.0344,
        s0_10y: 0.9887
      },
      stroke: {
        age: 0.1046,
        bmi: 0.0036,
        sbp: 0.0217,
        smk: 0.7399,
        age_bmi: -0.00001,
        age_sbp: -0.0005,
        age_smk: -0.0204,
        s0_10y: 0.9886
      }
    },
    Male: {
      chd: {
        age: 0.0736,
        bmi: 0.0337,
        sbp: 0.0134,
        smk: 0.5955,
        age_bmi: -0.0010,
        age_sbp: -0.0002,
        age_smk: -0.0201,
        s0_10y: 0.9544
      },
      stroke: {
        age: 0.0977,
        bmi: 0.0160,
        sbp: 0.0227,
        smk: 0.5000,
        age_bmi: -0.0004,
        age_sbp: -0.0004,
        age_smk: -0.0154,
        s0_10y: 0.9848
      }
    }
  },

  WHO_RECAL: {
    Female: { alpha: 1.2174, beta: 1.0409 },
    Male: { alpha: 0.9976, beta: 1.3730 }
  },

  MODEL2: {
    Female: {
      s0_5y: 0.978,
      beta: { age: 1.1177, hrr: -0.1511, rbc: -0.0280, wbc: 0.1182 },
      mu: { age: 55.59, hrr: 10.31, rbc: 4.32, wbc: 6.10 },
      sd: { age: 10.10, hrr: 1.201, rbc: 0.44, wbc: 2.001 }
    },
    Male: {
      s0_5y: 0.972,
      beta: { age: 0.9886, hrr: -0.0811, rbc: -0.0501, wbc: 0.1331 },
      mu: { age: 56.39, hrr: 11.61, rbc: 4.72, wbc: 6.80 },
      sd: { age: 10.41, hrr: 1.364, rbc: 0.55, wbc: 2.298 }
    }
  },

  MODEL3: {
    Female: {
      s0_5y: 0.978,
      beta: {
        age: 1.0988,
        smoking: -0.2586,
        bmi: 0.0711,
        sbp: 0.0949,
        hrr: -0.1543,
        rbc: -0.0394,
        wbc: 0.1136
      },
      mu: { age: 55.59, bmi: 23.12, sbp: 129.90, hrr: 10.31, rbc: 4.32, wbc: 6.10 },
      sd: { age: 10.10, bmi: 2.99, sbp: 15.90, hrr: 1.201, rbc: 0.44, wbc: 2.001 }
    },
    Male: {
      s0_5y: 0.972,
      beta: {
        age: 0.9658,
        smoking: -0.0197,
        bmi: -0.0079,
        sbp: 0.1057,
        hrr: -0.0807,
        rbc: -0.0525,
        wbc: 0.1313
      },
      mu: { age: 56.39, bmi: 23.32, sbp: 130.57, hrr: 11.61, rbc: 4.72, wbc: 6.80 },
      sd: { age: 10.41, bmi: 2.76, sbp: 15.27, hrr: 1.364, rbc: 0.55, wbc: 2.298 }
    }
  },

  RANGES: {
    age: { min: 40.0, max: 79.0 },
    rbc_female: { min: 3.0, max: 6.0 },
    rbc_male: { min: 3.0, max: 6.5 },
    wbc: { min: 2.0, max: 15.0 },
    hrr: { min: 7.0, max: 16.0 },
    bmi: { min: 10.0, max: 60.0 },
    sbp: { min: 60.0, max: 260.0 }
  },

  DEFAULT_CASES: {
    Female: { age: 56.0, rbc: 4.32, wbc: 6.10, hrr: 10.31, bmi: 23.1, sbp: 130.0, smoking: "No" },
    Male: { age: 58.0, rbc: 4.72, wbc: 6.80, hrr: 11.61, bmi: 23.3, sbp: 131.0, smoking: "No" }
  }
};
