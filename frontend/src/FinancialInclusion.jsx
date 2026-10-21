
import { useEffect, useMemo, useState } from "react";
import "./FinancialInclusion.css";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function isYes(value) {
  return value === 1 || value === true ||
    ["1", "yes", "true"].includes(String(value ?? "").trim().toLowerCase());
}

function accessLabel(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["has access", "yes", "access", "1", "true"].includes(normalized)) {
    return "Has access";
  }

  if (["no access", "no", "0", "false"].includes(normalized)) {
    return "No access";
  }

  return "Unknown";
}

function percent(value, total) {
  return total ? `${((value / total) * 100).toFixed(1)}%` : "—";
}

export default function FinancialInclusion({
  onBack,
  province = "All Provinces",
}) {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState("All");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHouseholds() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/households`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load household data.");
        }

        const result = await response.json();
        setHouseholds(Array.isArray(result) ? result : result.households ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load data. Check that the RP-FVIP API is running.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHouseholds();
    return () => controller.abort();
  }, []);

  const filteredHouseholds = useMemo(() => {
    return households.filter((household) => {
      const matchesProvince =
        province === "All Provinces" || household.province === province;

      const matchesSearch = [
        household.hhid,
        household.province,
        household.financial_access,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(search.toLowerCase())
      );

      const access = accessLabel(household.financial_access);
      const matchesAccess =
        accessFilter === "All" || access === accessFilter;

      return matchesProvince && matchesSearch && matchesAccess;
    });
  }, [households, province, search, accessFilter]);

  const stats = useMemo(() => {
    const total = filteredHouseholds.length;

    const withAccount = filteredHouseholds.filter((household) =>
      isYes(household.has_financial_account)
    ).length;

    const withAccess = filteredHouseholds.filter(
      (household) => accessLabel(household.financial_access) === "Has access"
    ).length;

    const withoutAccess = filteredHouseholds.filter(
      (household) => accessLabel(household.financial_access) === "No access"
    ).length;

    const unknownAccess = total - withAccess - withoutAccess;

    return {
      total,
      withAccount,
      withAccess,
      withoutAccess,
      unknownAccess,
    };
  }, [filteredHouseholds]);

  return (
    <section className="fi-page">
      <header className="fi-header">
        <div>
          <h1>RP-FVIP / FINANCIAL INCLUSION</h1>
        </div>
      </header>

      <div className="fi-notice">
        <span className="fi-notice-icon">i</span>
        <p>
          These figures describe records in the current demonstration database,
          not official national estimates. Account ownership and financial
          access are different indicators and are reported separately.
        </p>
      </div>

      {error && <div className="fi-error" role="alert">{error}</div>}

      <div className="fi-summary-grid">
        <article className="fi-summary-card">
          <span>
            Households in dataset</span>
          <strong>{loading ? "…" : stats.total}</strong>
          <small>Records matching the selected filters</small>
        </article>

        <article className="fi-summary-card">
          <span>Have a financial account</span>
          <strong>{loading ? "…" : percent(stats.withAccount, stats.total)}</strong>
          <small>{loading ? "Loading records" : `${stats.withAccount} households`}</small>
        </article>

        <article className="fi-summary-card">
          <span>Have financial access</span>
          <strong>{loading ? "…" : percent(stats.withAccess, stats.total)}</strong>
          <small>{loading ? "Loading records" : `${stats.withAccess} households`}</small>
        </article>

        <article className="fi-summary-card">
          <span>No financial access</span>
          <strong>{loading ? "…" : percent(stats.withoutAccess, stats.total)}</strong>
          <small>{loading ? "Loading records" : `${stats.withoutAccess} households`}</small>
        </article>
      </div>

      <section className="fi-panel">
        <div className="fi-panel-heading">
          <div>
            <h2>Financial access overview</h2>
            <p>Share of records with a known financial-access status</p>
          </div>
        </div>

        {loading ? (
          <p className="fi-empty">Loading financial indicators…</p>
        ) : stats.total === 0 ? (
          <p className="fi-empty">No household records match these filters.</p>
        ) : (
          <div className="fi-bars">
            <div className="fi-bar-row">
              <div className="fi-bar-label">
                <span>Has access</span>
                <strong>{percent(stats.withAccess, stats.total)}</strong>
              </div>
              <div className="fi-bar-track">
                <div
                  className="fi-bar-fill fi-bar-access"
                  style={{ width: percent(stats.withAccess, stats.total) }}
                />
              </div>
            </div>

            <div className="fi-bar-row">
              <div className="fi-bar-label">
                <span>No access</span>
                <strong>{percent(stats.withoutAccess, stats.total)}</strong>
              </div>
              <div className="fi-bar-track">
                <div
                  className="fi-bar-fill fi-bar-no-access"
                  style={{ width: percent(stats.withoutAccess, stats.total) }}
                />
              </div>
            </div>

            {stats.unknownAccess > 0 && (
              <div className="fi-bar-row">
                <div className="fi-bar-label">
                  <span>Unknown / missing</span>
                  <strong>{percent(stats.unknownAccess, stats.total)}</strong>
                </div>
                <div className="fi-bar-track">
                  <div
                    className="fi-bar-fill fi-bar-unknown"
                    style={{ width: percent(stats.unknownAccess, stats.total) }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="fi-panel fi-records-panel">
        <div className="fi-panel-heading">
          <div>
            <h2>Household records</h2>
            <p>Search and filter the available household data</p>
          </div>
          <span className="fi-record-count">
            {loading ? "…" : `${filteredHouseholds.length} records`}
          </span>
        </div>

        <div className="fi-filters">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search household or province…"
            aria-label="Search household records"
          />

          <select
            value={accessFilter}
            onChange={(event) => setAccessFilter(event.target.value)}
            aria-label="Filter by financial access"
          >
            <option value="All">All access statuses</option>
            <option value="Has access">Has access</option>
            <option value="No access">No access</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div className="fi-table-wrap">
          <table className="fi-table">
            <thead>
              <tr>
                <th>Household ID</th>
                <th>Province</th>
                <th>Financial account</th>
                <th>Financial access</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredHouseholds.map((household, index) => (
                <tr key={household.hhid ?? index}>
                  <td>{household.hhid ?? "—"}</td>
                  <td>{household.province ?? "—"}</td>
                  <td>
                    {household.has_financial_account == null
                      ? "Unknown"
                      : isYes(household.has_financial_account)
                      ? "Yes"
                      : "No"}
                  </td>
                  <td>
                    <span className={`fi-access-pill ${
                      accessLabel(household.financial_access) === "Has access"
                        ? "fi-pill-yes"
                        : accessLabel(household.financial_access) === "No access"
                        ? "fi-pill-no"
                        : "fi-pill-unknown"
                    }`}>
                      {accessLabel(household.financial_access)}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && filteredHouseholds.length === 0 && (
                <tr>
                  <td colSpan="4" className="fi-empty-cell">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="fi-methodology">
        <h2>Interpretation notes</h2>
        <p>
          Financial account ownership measures whether a household record
          indicates an account. Financial access uses the separate
          financial-access field in the dataset. The two measures should not
          automatically be treated as equivalent.
        </p>
        <p>
          The current dataset is a small prototype sample. Percentages can
          change substantially when additional records or official survey data
          are connected.
        </p>
      </div>

   <footer className="rp-page-footer">
  <div className="rp-page-footer__brand">
    <strong>RP-FVIP</strong>
    <span> Financial Inclusion</span>
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