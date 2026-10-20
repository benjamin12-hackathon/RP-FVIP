
import { useEffect, useState } from "react";
import "./MultidimensionalPoverty.css";

const dimensions = [
  {
    title: "Education",
    description: "Schooling and educational attainment",
    icon: "ED",
    key: "education",
  },
  {
    title: "Health",
    description: "Nutrition and health-related deprivation",
    icon: "HE",
    key: "health",
  },
  {
    title: "Living Standards",
    description: "Household living conditions",
    icon: "LS",
    key: "living_standards",
  },
  {
    title: "Housing",
    description: "Quality and adequacy of housing",
    icon: "HO",
    key: "housing",
  },
  {
    title: "Water & Sanitation",
    description: "Access to safe water and sanitation",
    icon: "WS",
    key: "water_sanitation",
  },
  {
    title: "Electricity",
    description: "Household electricity access",
    icon: "EL",
    key: "electricity",
  },
  {
    title: "Employment",
    description: "Employment-related deprivation",
    icon: "EM",
    key: "employment",
  },
];

export default function MultidimensionalPoverty({
  onBack,
  province = "All Provinces",
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          `http://127.0.0.1:8000/api/dashboard/modules?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("The analytical API could not return the data.");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Unable to load the indicators. Check that the RP-FVIP API is running."
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
  }, [province]);

  const availableDimensions = dimensions.filter(
    (item) => data?.mpi?.[item.key] !== null &&
              data?.mpi?.[item.key] !== undefined
  );

  return (
    <section className="mpi-page">
      <header className="mpi-header">
        <div>
          <h1>RP-FVIP / POVERTY ANALYTICS</h1>
          </div>
      </header>

      <div className="mpi-notice">
        <span className="mpi-notice-icon">i</span>
        <div>
          <strong>Indicator availability</strong>
          <p>
            This prototype database does not yet contain all variables needed
            to calculate an official Multidimensional Poverty Index (MPI).
            Missing indicators are shown as unavailable rather than estimated.
          </p>
        </div>
      </div>

      <div className="mpi-summary-grid">
        <article className="mpi-summary-card">
          <span className="mpi-card-label">Households in dataset</span>
          <strong>
            {loading ? "…" : error ? "_" : data?.household_count ?? 0}
          </strong>
          <span className="mpi-card-footnote">
            Records in the selected dataset
          </span>
        </article>

        <article className="mpi-summary-card">
          <span className="mpi-card-label">Available MPI dimensions</span>
          <strong>
            {loading ? "…" : `${availableDimensions.length} / ${dimensions.length}`}
          </strong>
          <span className="mpi-card-footnote">
            Dimensions with supplied indicator values
          </span>
        </article>

        <article className="mpi-summary-card">
          <span className="mpi-card-label">Official MPI estimate</span>
          <strong className="mpi-unavailable">
            Not available
          </strong>
          <span className="mpi-card-footnote">
            Requires the relevant source variables and methodology
          </span>
        </article>
      </div>

      <section className="mpi-section">
        <div className="mpi-section-heading">
          <div>
            <h2>Dimensions of deprivation</h2>
            <p>
              Indicator availability in the current demo database
            </p>
          </div>
          <span className="mpi-count">
            {dimensions.length} dimensions
          </span>
        </div>

        {error && (
          <div className="mpi-error" role="alert">
            {error}
          </div>
        )}

        <div className="mpi-dimension-grid">
          {dimensions.map((dimension) => {
            const value = data?.mpi?.[dimension.key];
            const available =
              value !== null && value !== undefined && !loading && !error;

            return (
              <article className="mpi-dimension-card" key={dimension.key}>
                <div className="mpi-dimension-top">
                  <span className="mpi-dimension-icon">
                    {dimension.icon}
                  </span>
                  <span
                    className={`mpi-status ${
                      available ? "mpi-status-available" : "mpi-status-missing"
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
                  {loading
                    ? "…"
                    : available
                    ? `${Number(value).toFixed(1)}%`
                    : "_"}
                </div>

                <div className="mpi-dimension-footnote">
                  {available
                    ? "Value supplied by the analytical API"
                    : "Required indicator data is not available"}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mpi-methodology">
        <h2>Methodology and data requirements</h2>
        <p>
          A multidimensional poverty measure requires defined deprivation
          indicators, appropriate thresholds, indicator weights, and an
          aggregation method. These must be established before calculating
          or interpreting an MPI estimate.
        </p>
        <p>
          The current database is a small demonstration dataset, not the
          official EICV7 microdata. Its household count and available fields
          should not be interpreted as nationally representative estimates.
        </p>
      </div>

<footer className="rp-page-footer">
  <div className="rp-page-footer__brand">
    <strong>RP-FVIP</strong>
    <span>· Multidimentional Poverty</span>
  </div>

  <div className="rp-page-footer__note">
   Demo data analysis only
  </div>

  {onBack && (
    <button
      className="rp-back-button"
      type="button"
      onClick={onBack}
    >
       Back to Dashboard
    </button>
  )}
</footer>
    </section>
  );
}