# RP-FVIP — Data and Analytical Methodology

## 1. Purpose

The Rwanda Poverty and Financial Vulnerability Intelligence Platform (RP-FVIP) is a prototype designed to explore household poverty and financial vulnerability indicators through interactive visualizations, descriptive analysis, geographic summaries, and a demonstration machine-learning workflow.

This document describes the current analytical approach, indicator assumptions, model evaluation results reported for the demonstration experiment, and the limitations that must be addressed before operational use.

## 2. Data Source and Status

The current prototype uses a small demonstration dataset stored in a SQLite database.

The dataset supports development, interface testing, and demonstration of the platform's analytical functionality. It is not an official National Institute of Statistics of Rwanda (NISR) dataset and is not nationally representative.

No results generated from the demonstration dataset should be presented as official national or provincial statistics.

Before integrating external source data, the project team must verify data provenance, access authorization, documentation, variable definitions, reference periods, and any applicable privacy and usage requirements.

## 3. Data Preparation and Quality Assurance

The analytical workflow should assess data quality before producing indicators or training models. Relevant checks include:

- Missing values in selected variables.
- Duplicate household identifiers.
- Valid ranges and plausible values for numeric indicators.
- Consistency of categorical and binary variable coding.
- Distribution of the target variable.
- Potential target leakage in model predictors.
- Consistency between geographic identifiers and geographic classifications.

Missing values and data limitations must be documented rather than silently interpreted as meaningful observations.

Any cleaning, exclusions, transformations, and assumptions should be recorded to support reproducibility and interpretation.

## 4. Indicator Definitions

The indicators below describe the calculations used by the current demonstration workflow. Their validity depends on the actual variable definitions, coding conventions, and records available in the dataset.

### 4.1 Poverty Rate

The demonstration poverty rate is calculated as:

`Mean(poverty_status) × 100`

This calculation assumes that `poverty_status` is consistently coded as:

- `1` — classified as poor.
- `0` — classified as non-poor.

Under these assumptions, the mean multiplied by 100 gives the percentage of records classified as poor.

This is a record-level descriptive measure for the available demonstration dataset. It should not be interpreted as an official poverty headcount rate unless the underlying data, poverty definition, population coverage, and estimation methodology support that interpretation.

### 4.2 Financial Inclusion Rate

The demonstration financial inclusion rate is calculated as:

`Mean(has_financial_account) × 100`

This calculation assumes that `has_financial_account` is consistently coded as:

- `1` — the record meets the dataset's definition of having a financial account.
- `0` — the record does not meet that definition.

The result represents the percentage of eligible records coded as having an account, provided that the variable is correctly defined and coded.

Account ownership alone does not capture every dimension of financial inclusion, such as usage, access to suitable financial services, affordability, or service quality. The indicator should therefore be interpreted according to its documented definition.

### 4.3 Interpretation of Indicators

Both indicators depend on the variables and records included in the calculation. Missing or incorrectly coded values, selection effects, and differences in coverage may affect the results.

For analyses based on complex household surveys, the appropriate survey weights and official estimation procedures must be considered where applicable.

## 5. Geographic Analysis

The API groups available household records by province and calculates the number of records and the mean poverty indicator for each group.

These summaries allow users to explore geographic patterns in the demonstration dataset. However, small group sizes can produce extreme percentages and unstable comparisons.

Geographic results must be interpreted in light of sample coverage, the quality of geographic identifiers, and the number of observations in each group. Demonstration results must not be treated as representative provincial estimates.

Before using official data, the project team should verify geographic classifications, document aggregation rules, and apply appropriate survey estimation methods where required.

## 6. Machine-Learning Demonstration

The prototype includes Logistic Regression and Random Forest experiments to demonstrate a possible analytical workflow for examining patterns associated with the observed poverty classification.

The following evaluation metrics were reported for the demonstration experiment:

| Metric | Logistic Regression | Random Forest |
|---|---:|---:|
| Accuracy | 77.5% | 67.5% |
| Precision | 100% | 20% |
| Recall | 10% | 10% |
| F1-score | 18.2% | 13.3% |

These figures are reported demonstration results. They should be verified against the underlying evaluation output before being used in formal reporting.

### 6.1 Interpretation of Results

The reported metrics illustrate why accuracy alone is insufficient to evaluate a poverty-classification model.

- **Accuracy** measures the proportion of evaluated cases classified correctly.
- **Precision** measures the proportion of cases predicted as positive that were actually positive.
- **Recall** measures the proportion of actual positive cases identified by the model.
- **F1-score** combines precision and recall into a single measure.

The reported recall of 10% for both models indicates that each identified only a small proportion of positive cases in the evaluated test set. The Logistic Regression result also illustrates that high precision can coexist with low recall.

Because the demonstration dataset is small, these results may be sensitive to the particular train-test split and class distribution. They do not establish that either model is suitable for real-world poverty prediction.

### 6.2 Requirements for Further Evaluation

Before drawing conclusions about model performance, further evaluation should document:

- The dataset and target definition used.
- The train-test splitting procedure and random seed, where applicable.
- The number and distribution of positive and negative cases.
- The predictors supplied to each model.
- The treatment of missing values and categorical variables.
- Relevant baseline comparisons and suitable evaluation metrics.
- The stability of results under appropriate validation procedures.

Where data are limited or imbalanced, evaluation methods should be selected carefully to reduce the risk of misleading conclusions.

## 7. Target Leakage Prevention

Target leakage occurs when model predictors contain information that directly reveals the target or would not legitimately be available at the intended time of prediction.

Variables used to construct the poverty target, or closely related consumption and expenditure measures, must be reviewed carefully before inclusion. They should be excluded when their use would reveal the target or produce an invalid evaluation.

Predictor selection should follow a documented rationale based on the intended analytical purpose, data availability, timing, and risk of leakage.

All preprocessing and feature selection steps must also be performed in a way that prevents information from the test data from influencing model training.

## 8. Limitations

The current prototype has the following limitations:

- It uses a small demonstration dataset rather than an official, nationally representative household dataset.
- Indicator validity depends on consistent coding and verified variable definitions.
- Geographic summaries may be unstable where group sizes are small.
- Reported model metrics may be sensitive to the small evaluation sample and class distribution.
- The model has not been validated for operational, household-level, or policy decision-making.
- The current indicators do not necessarily capture every dimension of poverty or financial vulnerability.
- The platform does not establish that observed associations are causal.
- Results must not be treated as confirmed assessments of individual households.

## 9. Responsible Use and Future Validation

Before the platform is used for substantive research or policy analysis, the project team should:

1. Integrate authorized source data with documented provenance and variable definitions.
2. Verify data quality, population coverage, geographic classifications, and reference periods.
3. Apply appropriate survey weights and estimation procedures where required.
4. Document indicator construction and all analytical assumptions.
5. Evaluate models using suitable validation procedures and metrics.
6. Assess potential bias, uncertainty, privacy risks, and the consequences of classification errors.
7. Maintain clear distinctions between descriptive statistics, model outputs, and official statistical estimates.

Any future use of household-level predictions should include appropriate human oversight and safeguards against treating model outputs as definitive judgments about households.

## 10. Conclusion

RP-FVIP is currently a demonstration and development prototype for exploring poverty and financial vulnerability indicators through an interactive analytical platform.

Its current outputs illustrate platform functionality and an initial analytical workflow. They are not a substitute for official statistics, verified survey analysis, or professional policy assessment.

Further data integration, methodological verification, and validation are required before the platform's outputs can support substantive conclusions about poverty or financial vulnerability in Rwanda.
