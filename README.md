# RP-FVIP / Rwanda Poverty & Financial Vulnerability Intelligence Platform

## Overview

RP-FVIP is a web-based poverty and financial vulnerability intelligence prototype designed to explore household-level indicators, compare geographic patterns, and support evidence-informed analysis in Rwanda.

The platform combines a web dashboard, geographic visualizations, indicator summaries, analytical reports, CSV export, and a machine-learning demonstration.

## Problem Statement

Understanding poverty and financial vulnerability requires more than viewing isolated statistics. Decisionmakers need accessible ways to explore indicators, compare geographic areas, understand potential vulnerability patterns, and recognize limitations in the available evidence.

RP-FVIP demonstrates how data analysis and interactive visualization can help organize this information in one platform.

## Key Features

- Interactive dashboard with key indicators.
- Geographic exploration and province-level comparisons.
- Poverty and financial vulnerability analysis modules.
- Insights & Reports page.
- CSV export for report indicators.
- Data quality and reliability notices.
- Demonstration machine-learning workflow.

## Technology Stack

- **Frontend:** React and Vite.
- **Backend:** Python and FastAPI.
- **Database:** SQLite.
- **Data analysis and machine learning:** Python-based analytical workflow.

## Running the Project

### Prerequisites

- Python installed.
- Node.js and npm installed.

### Start the API

From the project root, activate the project's Python virtual environment and run:

`uvicorn api:app --reload`

If the API module or virtual environment is located elsewhere, adjust the command to match the actual project structure.

### Start the Frontend

Open a second terminal:

`cd frontend`

Install dependencies if needed:

`npm install`

Start the development server:

`npm run dev`

Open the local URL printed by Vite in the terminal.

## Data and Methodology

The current prototype uses demonstration data stored in a SQLite database. Indicators are calculated from the available household records.

The poverty rate is calculated from the `poverty_status` field. Financial inclusion is calculated from the `has_financial_account` field.

The current demonstration dataset is small and is not nationally representative. Its results must not be interpreted as official NISR statistics or used to make decisions about individual households.

The machine-learning workflow is a demonstration and requires further validation with suitable, representative data before operational use.

## Limitations

- Demonstration data does not establish actual national poverty levels.
- Small sample sizes limit geographic comparisons and generalization.
- Some indicators may be unavailable where the required source variables are missing.
- Predictive model performance requires further evaluation.
- Official statistics require verified source data, documented methodology, and appropriate quality assurance.

## Future Work

- Integrate authorized and verified source datasets when available.
- Strengthen data validation and indicator documentation.
- Evaluate predictive models using appropriate validation procedures.
- Improve report generation and analytical capabilities.

## Project Status

RP-FVIP is a working prototype with an interactive dashboard, geographic visualizations, Insights & Reports, CSV export, and guest access. It currently uses demonstration data and requires verified source data and further model validation before operational use.


