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
        "https://rp-fvip.vercel.app",
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
        cursor = conn.execute("""
            SELECT
                geography_name AS province,
                NULL AS households,
                value AS poverty_rate
            FROM official_indicators
            WHERE indicator = 'Poverty Rate'
              AND geography_level = 'Province'
              AND source = 'National Institute of Statistics of Rwanda (NISR)'
              AND reference_period = '2023-2024'
            ORDER BY
                CASE geography_name
                    WHEN 'Northern' THEN 1
                    WHEN 'Eastern' THEN 2
                    WHEN 'Southern' THEN 3
                    WHEN 'Western' THEN 4
                    WHEN 'Kigali' THEN 5
                    ELSE 6
                END
        """)

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()

        return [dict(zip(columns, row)) for row in rows]
    finally:
        conn.close()



@app.get("/api/poverty/district")
def poverty_by_district():
    conn = get_connection()
    try:
        cursor = conn.execute("""
            SELECT
                geography_name AS district,
                value AS poverty_rate,
                source,
                reference_period
            FROM official_indicators
            WHERE indicator = 'Poverty Rate'
              AND geography_level = 'District'
              AND source = 'National Institute of Statistics of Rwanda (NISR)'
              AND reference_period = '2023-2024'
            ORDER BY geography_name
        """)

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()

        return [dict(zip(columns, row)) for row in rows]
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
        is_national = province == "All Provinces"
        geography_level = "National" if is_national else "Province"

        # EICV7 uses shortened province names.
        eicv7_province_names = {
            "Kigali City": "Kigali",
            "Northern Province": "Northern",
            "Southern Province": "Southern",
            "Eastern Province": "Eastern",
            "Western Province": "Western",
        }

        eicv7_geography_name = (
            "Rwanda"
            if is_national
            else eicv7_province_names.get(province, province)
        )

        def get_indicator(indicator_name):
            row = conn.execute(
                """
                SELECT value
                FROM official_indicators
                WHERE indicator = ?
                  AND geography_level = ?
                  AND geography_name = ?
                  AND source =
                      'National Institute of Statistics of Rwanda (NISR)'
                  AND reference_period = '2023-2024'
                LIMIT 1
                """,
                (
                    indicator_name,
                    geography_level,
                    eicv7_geography_name,
                ),
            ).fetchone()

            return row[0] if row else None

        def get_financial_inclusion():
            if is_national:
                row = conn.execute(
                    """
                    SELECT value
                    FROM official_indicators
                    WHERE indicator = 'Financial Inclusion'
                      AND geography_level = 'National'
                      AND geography_name = 'Rwanda'
                      AND source = 'FinScope 2024'
                      AND reference_period = '2024'
                    LIMIT 1
                    """
                ).fetchone()

                return row[0] if row else None

            row = conn.execute(
                """
                SELECT value
                FROM official_indicators
                WHERE indicator = 'Excluded'
                  AND geography_level = 'Province'
                  AND geography_name = ?
                  AND source = 'FinScope 2024'
                  AND reference_period = '2024'
                LIMIT 1
                """,
                (
    {
        "Northern": "Northern Province",
        "Southern": "Southern Province",
        "Eastern": "Eastern Province",
        "Western": "Western Province",
        "Kigali": "Kigali City",
    }.get(province, province),
),
            ).fetchone()

            return round(100 - row[0], 1) if row else None

        return {
            "province": province,
            "household_count": None,
            "poverty_rate": get_indicator("Poverty Rate"),
            "extreme_poverty_rate": get_indicator(
                "Extreme Poverty Rate"
            ),
            "mpi_incidence": get_indicator("MPI Incidence"),
            "mpi_intensity": get_indicator("MPI Intensity"),
            "mpi_index": get_indicator("MPI Index"),
            "financial_inclusion_rate": get_financial_inclusion(),
            "financial_inclusion_source": "FinScope 2024",
            "financial_inclusion_reference_period": "2024",
            "data_status": "official_partial",
            "poverty_source": "NISR EICV7",
            "reference_period": "2023-2024",
        }

    finally:
        conn.close()

@app.get("/api/debug/finscope-provinces")
def debug_finscope_provinces():
    conn = get_connection()
    try:
        rows = conn.execute("""
            SELECT geography_name, indicator, value
            FROM official_indicators
            WHERE source = 'FinScope 2024'
              AND indicator = 'Excluded'
              AND geography_level = 'Province'
            ORDER BY geography_name
        """).fetchall()

        return [
            {
                "province": row[0],
                "indicator": row[1],
                "value": row[2],
            }
            for row in rows
        ]
    finally:
        conn.close()
        

@app.get("/api/dashboard/modules")
def dashboard_modules(province: str = "All Provinces"):
    conn = get_connection()

    try:
        is_national = province == "All Provinces"

        # NISR uses shortened province names for EICV7/MPI.
        mpi_geography = (
            "Rwanda"
            if is_national
            else {
                "Northern Province": "Northern",
                "Southern Province": "Southern",
                "Eastern Province": "Eastern",
                "Western Province": "Western",
                "Kigali City": "Kigali",
            }.get(province, province)
        )

        # FinScope uses full province names.
        finscope_geography = (
            "Rwanda"
            if is_national
            else {
                "Northern": "Northern Province",
                "Southern": "Southern Province",
                "Eastern": "Eastern Province",
                "Western": "Western Province",
                "Kigali": "Kigali City",
            }.get(province, province)
        )

        def get_value(
            indicator,
            geography_level,
            geography_name,
            source,
            reference_period,
        ):
            row = conn.execute(
                """
                SELECT value
                FROM official_indicators
                WHERE indicator = ?
                  AND geography_level = ?
                  AND geography_name = ?
                  AND source = ?
                  AND reference_period = ?
                LIMIT 1
                """,
                (
                    indicator,
                    geography_level,
                    geography_name,
                    source,
                    reference_period,
                ),
            ).fetchone()

            return row[0] if row else None

        def get_mpi(indicator):
            return get_value(
                indicator,
                "National" if is_national else "Province",
                mpi_geography,
                "National Institute of Statistics of Rwanda (NISR)",
                "2023-2024",
            )

        def get_finscope(indicator):
            return get_value(
                indicator,
                "National" if is_national else "Province",
                finscope_geography,
                "FinScope 2024",
                "2024",
            )

        # National financial inclusion is explicitly published.
        if is_national:
            financial_inclusion = get_finscope("Financial Inclusion")
            formal_access = get_finscope("Formally Served")
        else:
            excluded = get_finscope("Excluded")
            financial_inclusion = (
                round(100 - excluded, 1)
                if excluded is not None
                else None
            )

            banked = get_finscope("Banked")
            other_formal = get_finscope("Other Formal (non-bank)")

            formal_access = (
                round(banked + other_formal, 1)
                if banked is not None and other_formal is not None
                else None
            )

        return {
            "household_count": None,
            "vulnerability": {
                "large_households": None,
                "no_financial_access": get_finscope("Excluded"),
                "no_formal_education": None,
                "unemployment": None,
                "poor_housing": None,
                "dependents": None,
            },
            "financial": {
                "has_access": financial_inclusion,
                "no_access": get_finscope("Excluded"),
                "formal_access": formal_access,
                "informal_access": get_finscope("Informal ONLY"),
                "financially_excluded": get_finscope("Excluded"),
                "banked": get_finscope("Banked"),
                "other_formal": get_finscope("Other Formal (non-bank)"),
                "source": "FinScope 2024",
                "reference_period": "2024",
            },
            "mpi": {
                # Official NISR indicators
                "incidence": get_mpi("MPI Incidence"),
                "intensity": get_mpi("MPI Intensity"),
                "index": get_mpi("MPI Index"),

                # Dimension-specific values are not available
                # in the currently loaded official indicators.
                "education": None,
                "health": None,
                "living_standards": None,
                "housing": None,
                "water_sanitation": None,
                "electricity": None,
                "employment": None,
                "source": "NISR EICV7",
                "reference_period": "2023-2024",
            },
            "education_distribution": {},
            "data_status": "official_partial",
        }

    finally:
        conn.close()
