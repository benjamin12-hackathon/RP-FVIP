
import { useEffect, useState } from "react";
import "./MultidimensionalPoverty.css";
import RPPageFooter from "./RPPageFooter";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const dimensions = [
  {
    title: "Education",
    description: "Schooling and educational attainment",
    icon: "education",
    key: "education",
  },
  {
    title: "Health",
    description: "Nutrition and health-related deprivation",
    icon: "health",
    key: "health",
  },
  {
    title: "Living Standards",
    description: "Household living conditions",
    icon: "living",
    key: "living_standards",
  },
  {
    title: "Housing",
    description: "Quality and adequacy of housing",
    icon: "housing",
    key: "housing",
  },
  {
    title: "Water & Sanitation",
    description: "Access to safe water and sanitation",
    icon: "water",
    key: "water_sanitation",
  },
  {
    title: "Electricity",
    description: "Household electricity access",
    icon: "electricity",
    key: "electricity",
  },
  {
    title: "Employment",
    description: "Employment-related deprivation",
    icon: "employment",
    key: "employment",
  },
];

function MPIIcon({ type, size = 22 }) {
  const paths = {
    education: (
      <>
        <path d="m2 10 10-5 10 5-10 5-10-5Z" />
        <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
        <path d="M22 10v6" />
      </>
    ),
    health: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        <path d="M3.5 12h4l2-3 3 6 2-3h6" />
      </>
    ),
    living: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    housing: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
        <path d="M8 10h.01M16 10h.01" />
      </>
    ),
    water: (
      <>
        <path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />
        <path d="M9 15a3 3 0 0 0 3 3" />
      </>
    ),
    electricity: (
      <>
        <path d="m13 2-3 8h7l-6 12 1-9H6l7-11Z" />
      </>
    ),
    employment: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[type] || paths.info}
    </svg>
  );
}

function formatPercent(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
}

function formatIndex(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(3);
}

function SummaryCard({ title, value, detail, icon, unavailable = false }) {
  return (
    <article className="mpi-summary-card">
      <div className="mpi-summary-top">
        <span className="mpi-card-label">{title}</span>
        <span className="mpi-summary-icon">
          <MPIIcon type={icon} size={21} />
        </span>
      </div>

      <strong className={unavailable ? "mpi-unavailable" : ""}>
        {value}
      </strong>

      <span className="mpi-card-footnote">{detail}</span>
    </article>
  );
}

export default function MultidimensionalPoverty({
  onBack,
  province = "All Provinces",
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (province && province !== "All Provinces") {
          params.set("province", province);
        }

        const response = await fetch(
          `${API_BASE}/api/dashboard/modules?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("The analytical API could not return the data.");
        }

        const result = await response.json();

        if (!result || typeof result !== "object" || !result.mpi) {
          throw new Error("The API response does not contain MPI indicators.");
        }

        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Multidimensional Poverty API error:", err);
          setError(
            "Unable to load official MPI indicators. Check that the RP-FVIP API is running."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [province, retryCount]);

  const mpi = data?.mpi ?? {};

  const availableDimensions = dimensions.filter(
    (dimension) =>
      mpi[dimension.key] != null &&
      Number.isFinite(Number(mpi[dimension.key]))
  );

  const selectedGeography =
    province === "All Provinces" ? "National" : province;

  const source = mpi.source || "NISR EICV7";
  const period = mpi.reference_period || "2023–2024";

  return (
    <section className="mpi-page">
      <header className="mpi-header">
        <div>
          <h1>Multidimensional Poverty</h1>
        </div>

        <span className="mpi-source-badge">
          <MPIIcon type="database" size={17} />
          {source}
        </span>
      </header>

      <div className="mpi-notice">
        <span className="mpi-notice-icon">
          <MPIIcon type="info" size={19} />
        </span>
        <div>
          <strong>Official indicator availability</strong>
          <p>
            MPI incidence, intensity and index are displayed from the
            configured NISR EICV7 source when available. The seven
            dimension-specific indicators are shown as unavailable when
            their underlying values are missing. No missing values are
            estimated or replaced with demonstration data.
          </p>
        </div>
      </div>

      {error && (
        <div className="mpi-error" role="alert">
          <p>{error}</p>
          <button
            className="mpi-back-button"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      <div className="mpi-summary-grid">
        <SummaryCard
          title="MPI Incidence"
          value={loading ? "Loading..." : formatPercent(mpi.incidence)}
          detail="Share of people who are multidimensionally poor"
          icon="chart"
          unavailable={!loading && mpi.incidence == null}
        />

        <SummaryCard
          title="MPI Intensity"
          value={loading ? "Loading..." : formatPercent(mpi.intensity)}
          detail="Average deprivation experienced by MPI-poor people"
          icon="health"
          unavailable={!loading && mpi.intensity == null}
        />

        <SummaryCard
          title="MPI Index"
          value={loading ? "Loading..." : formatIndex(mpi.index)}
          detail="Official MPI measure; not expressed as a percentage"
          icon="database"
          unavailable={!loading && mpi.index == null}
        />
      </div>

      <section className="mpi-section">
        <div className="mpi-section-heading">
          <div>
            <h2>Dimensions of deprivation</h2>
            <p>
              {selectedGeography} · Dimension-specific values from the API
            </p>
          </div>

          <span className="mpi-count">
            {loading
              ? "Loading..."
              : `${availableDimensions.length} / ${dimensions.length} available`}
          </span>
        </div>

        <div className="mpi-dimension-grid">
          {dimensions.map((dimension) => {
            const value = mpi[dimension.key];
            const available =
              !loading &&
              !error &&
              value != null &&
              Number.isFinite(Number(value));

            return (
              <article
                className="mpi-dimension-card"
                key={dimension.key}
              >
                <div className="mpi-dimension-top">
                  <span className="mpi-dimension-icon">
                    <MPIIcon type={dimension.icon} size={22} />
                  </span>

                  <span
                    className={`mpi-status ${
                      available
                        ? "mpi-status-available"
                        : "mpi-status-missing"
                    }`}
                  >
                    {loading
                      ? "Loading"
                      : error
                      ? "Unavailable"
                      : available
                      ? "Available"
                      : "Data needed"}
                  </span>
                </div>

                <h3>{dimension.title}</h3>
                <p>{dimension.description}</p>

                <div className="mpi-dimension-value">
                  {loading ? "Loading..." : formatPercent(value)}
                </div>

                <div className="mpi-dimension-footnote">
                  {available
                    ? `Source: ${source}`
                    : "Verified dimension-specific value not available"}
                </div>
              </article>
            );
          })}
        </div>
      </section>


<section className="mpi-methodology">
  <div className="mpi-methodology-heading">
    <span className="mpi-methodology-icon">
      <MPIIcon type="info" size={21} />
    </span>

    <div>
      <h2>Methodology & Data Coverage</h2>
      <p className="mpi-methodology-subtitle">
        Official source: {source} · Reference period: {period}
      </p>
    </div>
  </div>

  <div className="mpi-methodology-content">
    <article className="mpi-methodology-item">
      <h3>MPI Methodology</h3>
      <p>
        Multidimensional poverty is assessed using defined deprivation
        indicators, deprivation thresholds, indicator weights, and an
        aggregation method.
      </p>
      <p>
        The official MPI statistics above are presented separately from
        the seven dimension-specific indicators.
      </p>
    </article>

    <article className="mpi-methodology-item">
      <h3>Data Source & Reference Period</h3>
      <p>
        <strong>Source:</strong> {source}
      </p>
      <p>
        <strong>Reference period:</strong> {period}
      </p>
      <p>
        <strong>Geography:</strong> {selectedGeography}
      </p>
    </article>

    <article className="mpi-methodology-item">
      <h3>Indicator Availability</h3>
      <p>
        <strong>{availableDimensions.length} of {dimensions.length}</strong>
        {" "}dimension-specific indicators currently have values in the API.
      </p>
      <p>
        Missing indicators are marked as unavailable and are not estimated
        or replaced with demonstration values.
      </p>
    </article>

    <article className="mpi-methodology-item">
      <h3>Household Data Coverage</h3>
      <p>
        A verified household count is not supplied by the current API
        response.
      </p>
      <p>
        The official MPI statistics should not be interpreted as a count
        of households represented in this dashboard.
      </p>
    </article>
  </div>
</section>



<RPPageFooter
  page="Multidimensional Poverty"
  note={loading ? "Loading source data..." : `Source: ${source}`}
  onBack={onBack}
/>

    </section>
  );
}
