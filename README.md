# RP-FVIP / Rwanda Poverty & Financial Vulnerability Intelligence Platform

**An interactive analytical prototype for exploring poverty, household vulnerability, and financial inclusion indicators in Rwanda.**

[**Live Platform**](https://rp-fvip.vercel.app/) · [**Backend API**](https://rp-fvip.onrender.com) · [**API Health Check**](https://rp-fvip.onrender.com/api/health) · [**GitHub Repository**](https://github.com/benjamin12-hackathon/RP-FVIP)

## 1. Overview

RP-FVIP is a web-based poverty and financial vulnerability intelligence prototype designed to organize and explore household-level indicators, compare geographic patterns, and support evidence-informed analysis in Rwanda.

The platform combines an interactive dashboard, indicator summaries, geographic visualizations, analytical modules, reports, CSV export, and a demonstration machine-learning workflow.

RP-FVIP aims to demonstrate how data analysis and interactive visualization can make poverty-related information easier to explore and interpret.

## 2. Problem Statement

Understanding poverty and financial vulnerability requires more than viewing isolated statistics. Decision-makers need accessible ways to explore indicators, compare geographic areas, examine household characteristics associated with vulnerability, and understand the limitations of the available evidence.

RP-FVIP demonstrates an approach to bringing these analytical capabilities together in one accessible platform.

## 3. Key Features

- **Interactive Dashboard:** View key indicators and analytical summaries.
- **Geographic Exploration:** Explore geographic patterns and province-level comparisons supported by the available data.
- **Poverty Analysis:** Examine poverty-related indicators.
- **Financial Inclusion:** Explore indicators associated with access to financial services.
- **Vulnerability Analysis:** Demonstrate how household characteristics can be examined in        relation to observed poverty classifications.
- **Insights & Reports:** Access analytical summaries and report indicators.
- **CSV Export:** Export supported indicators for further analysis.
- **Data Quality Notices:** Communicate important data limitations and reliability considerations.
- **Machine-Learning Demonstration:** Illustrate a potential analytical workflow that requires further validation before operational use.

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | SQLite |
| API communication | HTTP/JSON |
| Data analysis | Python-based analytical workflow |
| Version control | Git, GitHub |
| Frontend deployment | Vercel |
| Backend deployment | Render |

## 5. Live Deployment

The application is deployed as two connected services:

- **Frontend:** https://rp-fvip.vercel.app/
- **Backend API:** https://rp-fvip.onrender.com
- **Health endpoint:** https://rp-fvip.onrender.com/api/health

The frontend provides the user interface, while the FastAPI backend serves data through API endpoints.

The backend uses the project's SQLite demonstration database. The application may take longer to respond to an initial request after the free backend service has been idle.

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

The interactive API documentation is available at:

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

The frontend's API base URL can be configured with the `VITE_API_BASE_URL` environment variable. For local development, the application defaults to the local API unless configured otherwise.

## 7. Data and Methodology

The current prototype uses demonstration data stored in a SQLite database.

The dashboard and analytical modules use the fields available in the demonstration dataset. In the current demonstration workflow:

- The poverty indicator is based on the `poverty_status` field.
- The financial-account indicator is based on the `has_financial_account` field.

These simplified fields illustrate how indicators can be derived from household records. They should not be treated as complete definitions of official poverty or financial inclusion measures.

Before integrating an official survey dataset, the analytical pipeline must be reviewed against the source documentation, variable definitions, survey design, weighting requirements, and approved methodology.

## 8. Data Disclaimer

**The current platform uses demonstration data, not verified official NISR statistics.**

The demonstration dataset is small and is not nationally representative. Dashboard values and geographic comparisons must not be interpreted as actual national or district poverty estimates.

The current demonstration results must not be used to make decisions about individual households, determine eligibility for public assistance, or support other high-impact decisions.

Any future integration of official microdata will require appropriate authorization, data protection safeguards, documented analytical methods, and quality assurance.

## 9. Machine Learning and Responsible Use

The machine-learning component is a demonstration of potential analytical capabilities rather than a validated operational prediction system.

Any future model must be evaluated using suitable data, appropriate validation procedures, relevant performance metrics, and assessments of bias and limitations.

RP-FVIP is intended to support exploration and evidence-informed analysis. It does not claim to predict with certainty which households will become poor.

## 10. Limitations

- The current demonstration data does not establish actual national poverty levels.
- Small sample sizes limit geographic comparisons and generalization.
- Indicator availability depends on the fields contained in the source data.
- Demonstration indicators may differ from official statistical definitions.
- Predictive model performance requires further evaluation.
- Official statistics require verified source data, documented methodology, appropriate survey analysis, and quality assurance.
- The platform's current functionality and analytical outputs should be interpreted within the limits of the demonstration dataset.

## 11. Future Work

Planned areas for improvement include:

- Integrating authorized and verified source datasets when available.
- Developing a documented data dictionary and reproducible analytical pipeline.
- Strengthening data validation and indicator calculations.
- Applying appropriate survey weights and accounting for survey design where required.
- Evaluating machine-learning models using suitable validation procedures.
- Improving geographic analysis, reporting, and analytical capabilities.
- Strengthening deployment reliability, monitoring, and data protection safeguards.

## 12. AI Disclosure

AI assistance was used during development to support aspects of coding, troubleshooting, and documentation.

The project team remains responsible for reviewing, testing, and validating the implementation and its analytical outputs. Any formal submission should follow the hackathon's specific AI-use disclosure requirements.

## 13. Project Status

RP-FVIP is a deployed, working analytical prototype with an interactive web dashboard and a separate backend API.

The platform currently uses demonstration data. Integration of authorized official survey microdata, validation of analytical indicators, and further model evaluation remain necessary before the platform can be considered suitable for operational statistical use.

---

**Project:** RP-FVIP — Rwanda Poverty & Financial Vulnerability Intelligence Platform  
**Repository:** https://github.com/benjamin12-hackathon/RP-FVIP  
**Live Demo:** https://rp-fvip.vercel.app/

