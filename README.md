# RP-FVIP / Rwanda Poverty & Financial Vulnerability Intelligence Platform

**An interactive analytical platform for exploring poverty, household vulnerability, and financial inclusion indicators in Rwanda.**

[**Live Platform**](https://rp-fvip.vercel.app/) · [**Backend API**](https://rp-fvip.onrender.com) · [**API Health Check**](https://rp-fvip.onrender.com/api/health) · [**GitHub Repository**](https://github.com/benjamin12-hackathon/RP-FVIP)

## 1. Overview

RP-FVIP is a web-based poverty and financial vulnerability intelligence platform designed to organize, explore, and visualize poverty-related indicators and financial inclusion data in Rwanda.

The platform integrates official aggregate indicators from the **National Institute of Statistics of Rwanda (NISR) EICV7 2023/24** and **FinScope Rwanda 2024**, alongside clearly distinguished demonstration household records used for selected analytical and development workflows.

RP-FVIP brings together interactive dashboards, geographic exploration, indicator summaries, vulnerability analysis, financial inclusion analysis, multidimensional poverty indicators, insights and reports, and CSV export functionality.

The platform aims to make statistical information easier to explore and interpret, helping users identify geographic patterns, compare available indicators, and understand how data analysis can support evidence-informed poverty reduction and financial inclusion initiatives.

Furthermore, this submitted project is our own.

## 2. Problem Statement

Understanding poverty and financial vulnerability requires more than viewing isolated statistics. Policymakers, researchers, development practitioners, and other stakeholders need accessible ways to explore indicators, compare geographic areas, examine vulnerability-related characteristics, and understand the evidence behind analytical results.

However, statistical information may be difficult to interpret when indicators are distributed across different reports, datasets, and sources.

RP-FVIP demonstrates an integrated approach to bringing relevant poverty and financial inclusion indicators into one interactive platform. It supports exploration of available evidence while distinguishing verified aggregate statistics from demonstration records and communicating important data limitations.

## 3. Key Features

- **Interactive Dashboard:** View key poverty, extreme poverty, multidimensional poverty, and financial inclusion indicators.
- **Poverty Explorer:** Explore available poverty indicators and compare geographic patterns across provinces and districts where data is available.
- **Vulnerability Profiler:** Examine available vulnerability-related indicators and demonstrate analytical workflows involving household characteristics.
- **Multidimensional Poverty Analysis:** Explore available multidimensional poverty indicators and related geographic comparisons.
- **Financial Inclusion:** Explore indicators associated with access to financial services using available FinScope Rwanda 2024 data.
- **Interactive Rwanda Map:** Explore geographic information and interact with supported district selections.
- **Insights & Reports:** Access analytical summaries and available indicator information.
- **CSV Export:** Export supported analytical results for further examination.
- **Data Quality Notices:** Communicate unavailable indicators, data limitations, and important interpretation considerations.
- **Machine-Learning Demonstration:** Illustrate potential analytical workflows while distinguishing experimental functionality from validated operational models.

The availability of indicators and geographic detail varies by source and indicator. The platform does not treat unavailable data as verified estimates.

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | SQLite |
| API communication | HTTP/JSON |
| Data analysis | Python-based analytical workflows |
| Version control | Git, GitHub |
| Frontend deployment | Vercel |
| Backend deployment | Render |

## 5. Live Deployment

RP-FVIP is deployed as two connected services:

- **Frontend:** https://rp-fvip.vercel.app/
- **Backend API:** https://rp-fvip.onrender.com
- **API health endpoint:** https://rp-fvip.onrender.com/api/health

The frontend provides the interactive user interface, while the FastAPI backend exposes data and analytical functionality through API endpoints.

The backend uses the project's SQLite database, which contains official aggregate indicators alongside separate demonstration household records.

The hosted backend may take longer to respond to an initial request after the free service has been idle.

## 6. Running the Project Locally

### Prerequisites

Install the following:

- Python
- Node.js and npm
- Git

### Step 1: Clone the repository

```bash
git clone https://github.com/benjamin12-hackathon/RP-FVIP.git
cd RP-FVIP
```

### Step 2: Set up the Python environment

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell prevents environment activation, consult the Python documentation or use another supported terminal activation method.

### Step 3: Start the backend

From the project root, run:

```bash
uvicorn api:app --reload
```

The local API should be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### Step 4: Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in the terminal, typically:

```text
http://localhost:5173
```

The frontend API base URL can be configured using the `VITE_API_BASE_URL` environment variable. For local development, configure it to point to the local backend when necessary.

## 7. Data Sources and Methodology

RP-FVIP combines official aggregate statistics with a separate demonstration dataset for selected development and analytical workflows.

### 7.1 Official aggregate data

**NISR EICV7 2023/24**

The platform incorporates available indicators from the Integrated Household Living Conditions Survey, including poverty, extreme poverty, and multidimensional poverty measures.

These indicators support the exploration of official aggregate statistics at the geographic levels available in the integrated dataset.

**FinScope Rwanda 2024**

The platform incorporates available financial inclusion indicators, including measures relating to financial inclusion, formal financial services, banking, financial exclusion, and other financial service categories.

FinScope indicators are presented as FinScope data and are not incorrectly attributed to NISR EICV7.

**Official source reports**

- **NISR EICV7 2023/24 — Main Indicators and Poverty Statistics:** [Official EICV7 publications page](https://www.statistics.gov.rw/data-sources/surveys/EICV/integrated-household-living-conditions-survey-7-eicv-7)
- **NISR EICV7 — Multidimensional Poverty:** [Official thematic report and supporting data](https://www.statistics.gov.rw/sites/default/files/documents/2025-07/EICV7_Multidimensional_Poverty_Thematic_Report.pdf)
- **Access to Finance Rwanda — FinScope Rwanda 2024:** [Official report and downloads](https://afr.rw/downloads/rwanda-finscope-2024-report/)

These publications provide the source references for the official aggregate indicators incorporated into RP-FVIP. The platform uses only the indicators and geographic detail available in its integrated dataset. Derived values and demonstration household records should not be interpreted as separately published official statistics.

### 7.2 Demonstration household records

The project also contains a small demonstration household dataset used for selected household-level analytical and development workflows.

These records are **demonstration data, not verified official NISR household microdata**. Results calculated from them must not be interpreted as representative estimates of poverty or financial vulnerability in Rwanda.

### 7.3 Indicator calculations and interpretation

The platform uses the definitions and available geographic detail of the underlying sources when presenting official aggregate indicators.

Where an indicator is derived from other available indicators, its calculation should be interpreted according to the applicable methodology and documented assumptions. Derived values should not be mistaken for separately published official estimates.

The application communicates unavailable data rather than presenting unsupported figures as verified results. Differences in definitions, geographic coverage, rounding, and source availability may affect comparisons between indicators.

Official aggregate statistics and demonstration household-level calculations serve different purposes and must remain clearly distinguished.

### 7.4 Data Files and Reproducibility

The repository includes the following data files in `data/demo/`:

| File | Description |
|---|---|
| `rp_fvip_demo.db` | SQLite database used by the backend. It contains the integrated aggregate indicators and separate demonstration household records. |
| `cleaned_demo_households.csv` | Demonstration household dataset for selected analytical and development workflows. |
| `final_analytical_demo.csv` | Demonstration dataset prepared for analytical workflows. |

The CSV files contain demonstration data and must not be interpreted as verified official NISR household microdata. The SQLite database combines available aggregate indicators from NISR EICV7 2023/24 and FinScope Rwanda 2024 with separate demonstration household records.

The original source publications are linked in Section 7.1. They provide the references for the official aggregate indicators; the demonstration records are not a substitute for the original survey microdata.

For local development, the backend reads the SQLite database at `data/demo/rp_fvip_demo.db`. The project source code and the listed data files are available in this repository.

**Data interpretation:** Users should verify indicator definitions, source attribution, geographic coverage, reference periods, and any derived calculations before using results for research or policy decisions.

## 8. Data Disclaimer

**RP-FVIP includes official aggregate indicators and separate demonstration household records. Not every analytical output represents an official statistical estimate.**

Official aggregate indicators incorporated into the platform are sourced from NISR EICV7 2023/24 and FinScope Rwanda 2024, according to the relevant indicator and source.

The demonstration household dataset is small and is not established as nationally representative. Household-level results calculated from those records must not be interpreted as actual national, provincial, or district poverty estimates.

The availability of official aggregate indicators does not mean that official household-level microdata is available for every analytical module.

Users should consider the source, geographic level, definition, and limitations of each indicator before drawing conclusions or making comparisons.

The platform should not be used to make unsupported decisions about individual households, determine eligibility for public assistance, or justify other high-impact decisions.

Any future use of authorized household microdata requires appropriate permissions, data protection safeguards, documented methodology, and quality assurance.

## 9. Machine Learning and Responsible Use

The machine-learning component demonstrates potential analytical capabilities and should not be interpreted as a validated operational prediction system.

Official aggregate indicators and demonstration household records do not, by themselves, establish that a model can reliably predict household poverty or vulnerability.

Any future operational model would require suitable data, documented feature definitions, appropriate training and validation procedures, relevant performance metrics, and assessments of bias, reliability, and limitations.

RP-FVIP is intended to support data exploration and evidence-informed analysis. It does not claim to predict with certainty which households will become poor.

## 10. Limitations

- Official indicators are available only for the geographic levels and measures integrated into the platform.
- Demonstration household records are not nationally representative and cannot establish official poverty estimates.
- Not every module has verified official household-level data available.
- Derived indicators may depend on documented assumptions and the availability of underlying source measures.
- Comparisons between sources must account for differences in definitions, coverage, and methodology.
- Predictive model performance requires appropriate evaluation before operational use.
- Additional data validation, source documentation, and quality assurance may be required as the platform evolves.
- Deployment performance may vary depending on hosting-service availability.

Therefore, these limitations are communicated to encourage appropriate interpretation and responsible use of the platform.

## 11. Future Work

Potential areas for improvement include:

- Expanding the integration of verified official datasets and documenting their provenance.
- Improving the data dictionary and reproducibility of analytical workflows.
- Strengthening automated data validation and indicator calculation tests.
- Documenting derivations, assumptions, and source-specific definitions.
- Applying appropriate survey weights and accounting for survey design where required.
- Evaluating machine-learning models using suitable datasets and validation procedures.
- Expanding geographic analysis, reporting, and analytical capabilities as verified data becomes available.
- Improving deployment reliability, monitoring, and data protection safeguards.

## 12. AI Disclosure

AI assistance was used during development to support aspects of coding, troubleshooting, and documentation.

Our team remains responsible for reviewing, testing, and validating the implementation, data handling, and analytical outputs.

The final hackathon submission should follow the competition's applicable AI-use disclosure requirements.

## 13. Project Status

RP-FVIP is a deployed analytical prototype with an interactive web dashboard and a separate backend API.

The platform integrates official aggregate indicators from NISR EICV7 2023/24 and FinScope Rwanda 2024, alongside separate demonstration household records for selected analytical workflows.

It provides a foundation for exploring poverty and financial inclusion indicators through interactive visualizations and geographic comparisons. Further validation, expanded data integration, and additional methodological documentation may be needed for broader operational statistical use.

---

**Project:** RP-FVIP — Rwanda Poverty & Financial Vulnerability Intelligence Platform
**Repository:** https://github.com/benjamin12-hackathon/RP-FVIP
**Live Platform:** https://rp-fvip.vercel.app/
**Backend API:** https://rp-fvip.onrender.com
**API Documentation:** https://rp-fvip.onrender.com/docs (available when the backend is running)
