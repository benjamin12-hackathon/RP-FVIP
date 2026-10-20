# RP-FVIP / Data and Analytical Methodology

## 1. Purpose

RP-FVIP is a prototype designed to explore household poverty and financial vulnerability indicators through interactive visualization, descriptive analysis, and a demonstration machine-learning workflow.

## 2. Data Source and Status

The current prototype uses a small demonstration dataset stored in a SQLite database.

The dataset is intended to demonstrate the platform's functionality. It is not an official NISR dataset and is not nationally representative.

Official source data must be verified and authorized before its statistics are presented as official results.

## 3. Data Preparation

The demonstration workflow includes checks for:
- Missing values in selected variables.
- Duplicate household identifiers.
- Valid ranges for selected numeric indicators.
- Target-variable distribution.
- Potential target leakage in model predictors.

Missing values and data limitations must be documented rather than silently interpreted as meaningful observations.

## 4. Indicator Definitions

### Poverty Rate

The poverty rate is calculated as:

`Mean(poverty_status) × 100`

This calculation assumes that `poverty_status` is consistently coded as a binary indicator, where 1 represents poor and 0 represents non-poor.

### Financial Inclusion Rate

The financial inclusion rate is calculated as:

`Mean(has_financial_account) × 100`

This assumes that the variable is consistently coded as 1 for households with a financial account and 0 otherwise.

The meaning of these indicators depends on the variable definitions and the records available in the dataset.

## 5. Geographic Analysis

The API groups household records by province and calculates the number of records and the mean poverty indicator for each province.

Very small group sizes can produce extreme percentages and unreliable comparisons. Province-level demo results should therefore be treated as illustrative only.

## 6. Machine-Learning Demonstration

The prototype includes Logistic Regression and Random Forest experiments.

The documented Logistic Regression evaluation reported:
- Accuracy: 77.5%
- Precision: 100%
- Recall: 10%
- F1-score: 18.2%

The documented Random Forest evaluation reported:
- Accuracy: 67.5%
- Precision: 20%
- Recall: 10%
- F1-score: 13.3%

These results come from the demonstration experiment and should not be interpreted as evidence of reliable real-world poverty prediction. In particular, the low recall indicates that the models identified only a small proportion of positive poverty cases in the test set.

## 7. Leakage Prevention

Variables that directly define or reveal the poverty target, including poverty-construction variables and related consumption or expenditure measures, should not be used as predictors when doing so would leak the target information into the model.

Predictors must be selected using a documented rationale and appropriate validation procedures.

## 8. Limitations

- The demonstration dataset contains only a small number of household records.
- The results are not nationally representative.
- Indicator validity depended on consistent coding and verified definitions.
- Model metrics may be unstable with small test samples.
- The model has not been validated for operational or policy use.
- No prediction should be treated as a confirmed assessment of an individual household.

## 9. Responsible Use and Future Validation

Before operational use, the platform requires verified source data, documented provenance, suitable sample coverage, appropriate validation, and review of model performance and potential bias.

The current system is intended for demonstration and development, not as a substitute for official statistics or professional policy assessment.