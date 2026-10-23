# RP-FVIP / Data and Analytical Methodology

## 1. Purpose

The Rwanda Poverty and Financial Vulnerability Intelligence Platform (RP-FVIP) is an analytical prototype that combines official aggregate poverty and financial inclusion indicators with separate demonstration household records.

The platform supports interactive visualizations, geographic comparisons, descriptive analysis, and a demonstration machine-learning workflow. This document describes the data sources, indicator calculations, analytical assumptions, limitations, and requirements for responsible use.

## 2. Data Sources and Status

### 2.1 Official aggregate indicators

The platform integrates available aggregate indicators from two distinct sources:

**National Institute of Statistics of Rwanda (NISR) — EICV7 2023/24**

The integrated dataset includes available poverty, extreme poverty, and multidimensional poverty indicators. The backend retrieves relevant records from the `official_indicators` database table using indicator names, geographic levels, geographic names, source labels, and reference periods.

The integrated data is limited to the indicators and geographic detail available in the database. Its inclusion in RP-FVIP does not imply that all indicators published in the original survey have been integrated.

**Access to Finance Rwanda (AFR) — FinScope Rwanda 2024**

The integrated dataset includes available financial inclusion indicators, including financial inclusion, formal financial services, banking, financial exclusion, and related financial service categories.

FinScope indicators are attributed to FinScope 2024 rather than incorrectly attributed to NISR EICV7.

Official source references:

- NISR EICV7: https://www.statistics.gov.rw/data-sources/surveys/EICV/integrated-household-living-conditions-survey-7-eicv-7
- FinScope Rwanda 2024: https://afr.rw/downloads/rwanda-finscope-2024-report/

### 2.2 Demonstration household records

The database also contains a separate `households` table used by selected household-level analytical and development workflows.

These records are demonstration data and are not verified official NISR household microdata. Their size, coverage, and representativeness must not be assumed to reflect the Rwandan population.

Results calculated from these records must not be presented as official national, provincial, or district estimates.

### 2.3 Data provenance and interpretation

The source, reference period, indicator definition, geographic level, and calculation method should be considered when interpreting every indicator.

Where the integrated dataset contains a derived indicator, its derivation must be distinguished from a value published directly by the source. Source references alone do not establish that every stored value has been independently verified against the original report.

## 3. Data Preparation and Quality Assurance

Before producing indicators or training analytical models, the workflow should assess:

- Missing values and incomplete records.
- Duplicate household identifiers.
- Valid ranges and plausible numeric values.
- Consistency of categorical and binary variable coding.
- Distribution of the target variable.
- Potential target leakage in model predictors.
- Consistency of geographic identifiers and classifications.
- Agreement between stored indicators and their documented source definitions.

Cleaning, exclusions, transformations, derivations, and assumptions should be documented to support reproducibility.

Missing or unavailable values should not be silently interpreted as zero or as evidence that a condition does not exist.

## 4. Official Indicator Definitions and Calculations

The following describes calculations visible in the current backend implementation. The validity of each result depends on the underlying stored data and source definitions.

### 4.1 Poverty indicators

The backend retrieves available poverty indicators from `official_indicators`, using the source label associated with NISR and the relevant geographic level and name.

The integrated indicators include poverty rate and other available measures, such as extreme poverty and multidimensional poverty indicators.

These values should be interpreted according to their source definitions and reference periods. The platform should not substitute demonstration household calculations for official aggregate estimates.

### 4.2 Financial inclusion

The backend retrieves available FinScope 2024 indicators from `official_indicators`.

At the national level, the financial inclusion value is retrieved from the stored `Financial Inclusion` indicator.

For provincial results, the current implementation can derive financial inclusion as:

`Financial Inclusion = 100 − Excluded`

This derivation is valid only if the source's financial inclusion and exclusion categories are complementary and use the same denominator and reference population.

### 4.3 Formal financial access

The current provincial calculation can derive formal access as:

`Formal Access = Banked + Other Formal (non-bank)`

This calculation assumes that the two categories are mutually exclusive, use compatible denominators, and correspond to the source's definition of formal access.

The derived result must not be described as a separately published value unless the original source confirms that status.

### 4.4 Missing and unavailable indicators

The backend returns unavailable values for selected household vulnerability measures when verified data is not available for the requested analysis.

An unavailable value is not equivalent to zero. The absence of a value means that the platform does not currently have a verified estimate to display for that measure and selection.

## 5. Demonstration Household Analysis

Selected backend endpoints retrieve records from the `households` table and calculate descriptive summaries using fields available in those records.

For example, the backend includes a grouping calculation that reports the number of records and the mean of `poverty_status` for each `financial_access` category.

Where `poverty_status` is consistently coded as 1 for poor and 0 for non-poor, its mean multiplied by 100 represents the percentage of included records coded as poor.

This is a descriptive calculation for the available records. It is not an official poverty headcount rate unless the underlying data, poverty definition, population coverage, survey design, and estimation procedures justify that interpretation.

Any household-level financial account or vulnerability calculation must likewise follow the documented definition and coding of the underlying field.

## 6. Geographic Analysis

The platform uses geographic identifiers and available aggregate indicators to support province and district exploration.

The backend maps geographic names to the naming conventions used by the respective sources. For example, NISR EICV7 and MPI indicators may use shortened province names, while FinScope may use full province names.

Geographic comparisons must account for differences in source definitions, reference periods, coverage, rounding, and available geographic detail.

Demonstration household summaries may be unstable when group sizes are small. They must not be treated as representative provincial or district estimates.

Derived geographic values should be documented, and unavailable estimates should remain clearly identified as unavailable.

## 7. Machine-Learning Demonstration

The prototype includes Logistic Regression and Random Forest experiments intended to demonstrate a possible analytical workflow for examining patterns associated with an observed poverty classification.

The following metrics were reported in the existing demonstration documentation:

| Metric | Logistic Regression | Random Forest |
|---|---:|---:|
| Accuracy | 77.5% | 67.5% |
| Precision | 100% | 20% |
| Recall | 10% | 10% |
| F1-score | 18.2% | 13.3% |

These are reported demonstration results. They have not been independently verified in this document against the underlying evaluation output and should be checked before formal reporting.

Accuracy measures the proportion of evaluated cases classified correctly. Precision measures the proportion of predicted positive cases that were actually positive. Recall measures the proportion of actual positive cases identified. The F1-score combines precision and recall.

The reported recall of 10% for both models indicates that each model identified only a small proportion of positive cases in the evaluated test set, assuming the metrics and positive-class definition are correct.

A small demonstration dataset can produce unstable performance estimates. These figures do not establish that either model is suitable for operational poverty prediction.

### 7.1 Further evaluation requirements

Before drawing conclusions about model performance, document:

- The dataset and target definition.
- The train-test splitting procedure and random seed, where applicable.
- The number and distribution of positive and negative cases.
- The predictors supplied to each model.
- The handling of missing values and categorical variables.
- The evaluation procedure and baseline comparisons.
- The stability of results under suitable validation procedures.

Evaluation should account for class imbalance, possible data leakage, and the consequences of false-positive and false-negative classifications.

## 8. Target Leakage Prevention

Target leakage occurs when model predictors reveal information about the target that would not legitimately be available at the intended time of prediction.

Variables used to construct the poverty target, or closely related consumption and expenditure measures, must be reviewed carefully before inclusion. They should be excluded when their use would reveal the target or invalidate the evaluation.

Preprocessing, feature selection, and other data-dependent transformations should be performed without allowing information from the test set to influence model training.

Predictor selection should follow a documented rationale based on the analytical purpose, data availability, timing, and risk of leakage.

## 9. Limitations

The current platform has the following limitations:

- Official aggregate indicators are available only for the measures and geographic levels integrated into the database.
- Demonstration household records are not verified official NISR microdata and are not established as nationally representative.
- Derived financial inclusion indicators depend on assumptions about category definitions and denominators.
- Differences in source definitions, coverage, geographic classifications, and rounding may affect comparisons.
- Some household vulnerability indicators are unavailable and must not be interpreted as zero.
- The reported machine-learning metrics require verification against the underlying evaluation output.
- Model performance may be sensitive to the demonstration dataset, class distribution, and evaluation procedure.
- The platform does not establish causal relationships.
- The outputs have not been validated for operational household-level or policy decision-making.

## 10. Responsible Use and Future Validation

Before using the platform for substantive research or policy analysis, the project team should:

1. Verify source provenance, data access permissions, variable definitions, and reference periods.
2. Reconcile stored aggregate indicators with the relevant source publications.
3. Document all derived indicators, assumptions, denominators, and rounding rules.
4. Assess missing values, geographic consistency, and data quality.
5. Apply appropriate survey weights and estimation procedures where required.
6. Verify machine-learning results and use suitable validation procedures.
7. Assess bias, uncertainty, privacy risks, and the consequences of classification errors.
8. Maintain clear distinctions between official aggregate statistics, derived indicators, demonstration calculations, and model outputs.

Any future use of household-level predictions should include appropriate human oversight and safeguards against treating model outputs as definitive judgments about individual households.

## 11. Conclusion

RP-FVIP is an analytical prototype that combines selected official aggregate indicators from NISR EICV7 2023/24 and FinScope Rwanda 2024 with separate demonstration household records.

Its purpose is to support exploration of available poverty and financial inclusion indicators and demonstrate selected analytical workflows.

Official aggregate indicators, derived values, demonstration household calculations, and experimental model outputs serve different purposes and must remain clearly distinguished.

Further source verification, data quality assurance, methodological documentation, and model evaluation are required before the platform can be considered suitable for broader operational statistical use.
