from fastapi import FastAPI
from pathlib import Path
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

# --------------------------------------------------
# RP-FVIP API
# --------------------------------------------------

app = FastAPI(
    title="RP-FVIP API",
    description="API for the Rwanda Poverty & Financial Vulnerability Intelligence Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------------------------
# Database
# --------------------------------------------------

DB_PATH = (
    Path(__file__).resolve().parent
    / "data"
    / "demo"
    / "rp_fvip_demo.db"
)


def get_connection():
    return sqlite3.connect(DB_PATH)


# --------------------------------------------------
# 1. Health Check
# --------------------------------------------------


@app.get("/api/health")
def health():
    try:
        conn = get_connection()

        try:
            conn.execute("SELECT 1").fetchone()
        finally:
            conn.close()

        return {
            "status": "ok",
            "service": "RP-FVIP API",
            "database": "connected",
        }

    except sqlite3.Error:
        return {
            "status": "error",
            "service": "RP-FVIP API",
            "database": "disconnected",
        }


# --------------------------------------------------
# 2. Get Households
# --------------------------------------------------

@app.get("/api/households")
def get_households():

    conn = get_connection()

    try:
        cursor = conn.execute(
            "SELECT * FROM households"
        )

        columns = [column[0] for column in cursor.description]

        rows = cursor.fetchall()

        return [
            dict(zip(columns, row))
            for row in rows
        ]

    finally:
        conn.close()


# --------------------------------------------------
# 3. Poverty by Province
# --------------------------------------------------

@app.get("/api/poverty/province")
def poverty_by_province():

    conn = get_connection()

    try:
        cursor = conn.execute(
            """
            SELECT
                province,
                COUNT(*) AS households,
                ROUND(
                    AVG(poverty_status) * 100,
                    2
                ) AS poverty_rate
            FROM households
            GROUP BY province
            ORDER BY poverty_rate DESC
            """
        )

        columns = [column[0] for column in cursor.description]

        rows = cursor.fetchall()

        return [
            dict(zip(columns, row))
            for row in rows
        ]

    finally:
        conn.close()


# --------------------------------------------------
# 4. Financial Access
# --------------------------------------------------

@app.get("/api/financial-access")
def financial_access():

    conn = get_connection()

    try:
        cursor = conn.execute(
            """
            SELECT
                financial_access,
                COUNT(*) AS households,
                ROUND(
                    AVG(poverty_status) * 100,
                    2
                ) AS poverty_rate
            FROM households
            GROUP BY financial_access
            """
        )

        columns = [column[0] for column in cursor.description]

        rows = cursor.fetchall()

        return [
            dict(zip(columns, row))
            for row in rows
        ]

    finally:
        conn.close()

        
@app.get("/api/dashboard/summary")
def dashboard_summary(province: str = "All Provinces"):
    conn = get_connection()
    try:
        query = """
            SELECT
                COUNT(*) AS household_count,
                AVG(poverty_status) * 100 AS poverty_rate,
                AVG(has_financial_account) * 100 AS financial_inclusion_rate
            FROM households
            WHERE (? = 'All Provinces' OR province = ?)
        """
        row = conn.execute(query, (province, province)).fetchone()

        return {
            "province": province,
            "household_count": row[0] or 0,
            "poverty_rate": round(row[1], 2) if row[1] is not None else None,
            "financial_inclusion_rate": (
                round(row[2], 2) if row[2] is not None else None
            ),
            "data_status": "demo",
        }
    finally:
        conn.close()

        
@app.get("/api/dashboard/modules")
def dashboard_modules(province: str = "All Provinces"):
    conn = get_connection()

    try:
        rows = conn.execute(
            """
            SELECT
                household_size,
                education_level,
                has_financial_account,
                financial_access,
                poverty_status
            FROM households
            WHERE (? = 'All Provinces' OR province = ?)
            """,
            (province, province),
        ).fetchall()

        total = len(rows)

        if total == 0:
            return {
                "household_count": 0,
                "vulnerability": {},
                "financial": {},
                "mpi": {},
                "data_status": "no_data",
            }

        def percentage(count):
            return round(count / total * 100, 1)

        valid_sizes = [
            row[0] for row in rows
            if row[0] is not None
        ]

        no_financial_access = sum(
            1 for row in rows
            if row[3] == "No access"
        )

        has_financial_access = sum(
            1 for row in rows
            if row[3] == "Has access"
        )

        large_households = sum(
            1 for row in rows
            if row[0] is not None and row[0] >= 6
        )

        return {
            "household_count": total,
            "vulnerability": {
                "large_households": percentage(large_households),
                "no_financial_access": percentage(no_financial_access),
                "no_formal_education": None,
                "unemployment": None,
                "poor_housing": None,
                "dependents": None,
            },
            "financial": {
                "has_access": percentage(has_financial_access),
                "no_access": percentage(no_financial_access),
                "formal_access": None,
                "informal_access": None,
                "financially_excluded": percentage(no_financial_access),
            },
            "mpi": {
                "education": None,
                "health": None,
                "living_standards": None,
                "housing": None,
                "water_sanitation": None,
                "electricity": None,
                "employment": None,
            },
            "education_distribution": {
                level: percentage(
                    sum(1 for row in rows if row[1] == level)
                )
                for level in sorted({
                    row[1] for row in rows if row[1] is not None
                })
            },
            "data_status": "demo",
        }

    finally:
        conn.close()