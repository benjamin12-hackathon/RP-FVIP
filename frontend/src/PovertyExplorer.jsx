import { useEffect, useMemo, useState } from "react";
import "./PovertyExplorer.css";

const API_BASE = "http://127.0.0.1:8000";

const formatNumber = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? "-"
    : Number(value).toLocaleString();

const formatPercent = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? "-"
    : `${Number(value).toFixed(1)}%`;

function MetricCard({ label, value, detail, icon, tone = "blue" }) {
  return (
    <article className={`pe-metric pe-${tone}`}>
      <div className="pe-metric-top">
        <span>{label}</span>
        <span className="pe-metric-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function BarList({ title, subtitle, rows, valueKey = "count", labelKey = "label", suffix = "" }) {
  const max = Math.max(1, ...rows.map((row) => Number(row[valueKey]) || 0));
  return (
    <section className="pe-panel">
      <div className="pe-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {rows.length ? (
        <div className="pe-bars">
          {rows.map((row) => {
            const value = Number(row[valueKey]) || 0;
            return (
              <div className="pe-bar-row" key={row[labelKey]}>
                <div className="pe-bar-label-line">
                  <span>{row[labelKey]}</span>
                  <strong>{formatNumber(value)}{suffix}</strong>
                </div>
                <div className="pe-bar-track">
                  <span style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="pe-empty">No records available for this selection.</p>
      )}
    </section>
  );
}

export default function PovertyExplorer({
  onBack,
  initialProvince = "All Provinces",
  selectedDistrict = "",
}) {
  const [households, setHouseholds] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [province, setProvince] = useState("All Provinces");
  useEffect(() => {
  setProvince(initialProvince);
}, [initialProvince]);
const [activeDistrict, setActiveDistrict] = useState(selectedDistrict);
  const [povertyStatus, setPovertyStatus] = useState("All");
  const [educationLevel, setEducationLevel] = useState("All");
  const [financialAccess, setFinancialAccess] = useState("All");
  const [search, setSearch] = useState("");

useEffect(() => {
  setProvince(initialProvince);
}, [initialProvince]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/api/households`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`API request failed (${response.status})`);
        const payload = await response.json();
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.households)
            ? payload.households
            : Array.isArray(payload.data)
              ? payload.data
              : [];
        setHouseholds(rows);
        setProvinceOptions([...new Set(rows.map((row) => row.province).filter(Boolean))].sort());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Could not load household records. Make sure the FastAPI server is running on port 8000.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return households.filter((row) => {
      const matchesProvince = province === "All Provinces" || row.province === province;
      const isPoor = Number(row.poverty_status) === 1;
      const matchesPoverty =
        povertyStatus === "All" ||
        (povertyStatus === "Poor" && isPoor) ||
        (povertyStatus === "Not poor" && row.poverty_status != null && !isPoor);
      const matchesEducation = educationLevel === "All" || row.education_level === educationLevel;
      const matchesFinancial = financialAccess === "All" || row.financial_access === financialAccess;
      const matchesSearch =
        !term ||
        [row.hhid, row.province, row.education_level, row.financial_access, row.poverty_group]
          .some((value) => String(value ?? "").toLowerCase().includes(term));
      return matchesProvince && matchesPoverty && matchesEducation && matchesFinancial && matchesSearch;
    });
  }, [households, province, povertyStatus, educationLevel, financialAccess, search]);

  const metrics = useMemo(() => {
    const povertyKnown = filtered.filter((row) => row.poverty_status != null);
    const poor = povertyKnown.filter((row) => Number(row.poverty_status) === 1).length;
    const sizes = filtered.map((row) => Number(row.household_size)).filter(Number.isFinite);
    const sizeAverage = sizes.length ? sizes.reduce((sum, value) => sum + value, 0) / sizes.length : null;
    return {
      total: filtered.length,
      poor,
      povertyRate: povertyKnown.length ? (poor / povertyKnown.length) * 100 : null,
      avgSize: sizeAverage,
      povertyDenominator: povertyKnown.length,
    };
  }, [filtered]);

  const provinceRows = useMemo(() => {
    const grouped = new Map();
    filtered.forEach((row) => {
      if (!row.province) return;
      const current = grouped.get(row.province) || { label: row.province, total: 0, known: 0, poor: 0 };
      current.total += 1;
      if (row.poverty_status != null) {
        current.known += 1;
        if (Number(row.poverty_status) === 1) current.poor += 1;
      }
      grouped.set(row.province, current);
    });
    return [...grouped.values()]
      .map((row) => ({ ...row, rate: row.known ? (row.poor / row.known) * 100 : null }))
      .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
  }, [filtered]);

  const educationRows = useMemo(() => {
    const grouped = new Map();
    filtered.forEach((row) => {
      const label = row.education_level || "Unknown";
      grouped.set(label, (grouped.get(label) || 0) + 1);
    });
    return [...grouped.entries()].map(([label, count]) => ({ label, count }));
  }, [filtered]);

  const financialRows = useMemo(() => {
    const grouped = new Map();
    filtered.forEach((row) => {
      const label = row.financial_access || "Unknown";
      grouped.set(label, (grouped.get(label) || 0) + 1);
    });
    return [...grouped.entries()].map(([label, count]) => ({ label, count }));
  }, [filtered]);

  const educationOptions = useMemo(
    () => [...new Set(households.map((row) => row.education_level).filter(Boolean))].sort(),
    [households],
  );
  const financialOptions = useMemo(
    () => [...new Set(households.map((row) => row.financial_access).filter(Boolean))].sort(),
    [households],
  );

  function resetFilters() {
    setProvince("All Provinces");
    setPovertyStatus("All");
    setEducationLevel("All");
    setFinancialAccess("All");
    setSearch("");
    setActiveDistrict("");
  }

  return (
    <div className="poverty-explorer">
      <header className="pe-page-header">
        <div>
          <h1>RP-FVIP / ANALYTICS</h1>
          {activeDistrict && (
  <div className="pe-district-context">
    <strong>Selected District: {activeDistrict}</strong>
    <p>
      Showing available demo household data for {province}.
      District-level household records are not yet available
      in the current database.
    </p>
  </div>
)}

        </div>
        <div className="pe-source-badge">
        
          <div><strong>Demo database</strong><small>Prototype data · not official EICV7 estimates</small></div>
        </div>
      </header>

      <section className="pe-filter-panel" aria-label="Poverty Explorer filters">
        <div className="pe-filter-heading">
          <div><p>Filters apply to the indicators, charts and table below.</p></div>
          <button type="button" className="pe-reset" onClick={resetFilters}>Reset filters</button>
        </div>
        <div className="pe-filter-grid">
          <label>Province
     <select
  value={province}
  onChange={(e) => {
    setProvince(e.target.value);
    setActiveDistrict("");
  }}
>
              <option>All Provinces</option>
              {provinceOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>Poverty status
            <select value={povertyStatus} onChange={(event) => setPovertyStatus(event.target.value)}>
              <option>All</option><option>Poor</option><option>Not poor</option>
            </select>
          </label>
          <label>Education level
            <select value={educationLevel} onChange={(event) => setEducationLevel(event.target.value)}>
              <option>All</option>
              {educationOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>Financial access
            <select value={financialAccess} onChange={(event) => setFinancialAccess(event.target.value)}>
              <option>All</option>
              {financialOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </section>

      {error && <div className="pe-alert" role="alert"><strong>Data connection issue</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Retry</button></div>}

      <div className="pe-kpi-grid">
        <MetricCard label="Households in selection" value={loading ? "…" : formatNumber(metrics.total)} detail="Records after applying filters" icon="⌂" />
        <MetricCard label="Poverty rate" value={loading ? "…" : formatPercent(metrics.povertyRate)} detail={`${metrics.povertyDenominator} records with known poverty status`} icon="%" tone="purple" />
        <MetricCard label="Households classified as poor" value={loading ? "…" : formatNumber(metrics.poor)} detail="Based on poverty_status = 1" icon="!" tone="orange" />
        <MetricCard label="Average household size" value={loading ? "…" : (metrics.avgSize == null ? "-" : metrics.avgSize.toFixed(1))} detail="Excludes missing household sizes" icon="↗" tone="green" />
      </div>

      <div className="pe-chart-grid">
        <section className="pe-panel pe-province-panel">
          <div className="pe-panel-heading">
            <div><h2>Poverty rate by province</h2><p>Calculated from the records in the current selection.</p></div>
            <span className="pe-mini-tag">Demo</span>
          </div>
          {provinceRows.length ? (
            <div className="pe-province-list">
              {provinceRows.map((row) => (
                <button type="button" className="pe-province-row" key={row.label} onClick={() => setProvince(row.label)}>
                  <span className="pe-province-name">{row.label}</span>
                  <span className="pe-province-track"><span style={{ width: `${Math.max(0, Math.min(100, row.rate ?? 0))}%` }} /></span>
                  <strong>{formatPercent(row.rate)}</strong>
                  <small>{row.known} known / {row.total} households</small>
                </button>
              ))}
            </div>
          ) : <p className="pe-empty">No province records for these filters.</p>}
          <p className="pe-chart-note">Only provinces represented in the available records are shown. This is not an official provincial poverty estimate.</p>
        </section>
        <BarList title="Education profile" subtitle="Household records by recorded education level." rows={educationRows} />
        <BarList title="Financial access profile" subtitle="Records grouped by the financial_access field." rows={financialRows} />
      </div>

      <section className="pe-panel pe-table-panel">
        <div className="pe-panel-heading pe-table-heading">
          <div><h2>Household records</h2><p>{formatNumber(filtered.length)} records match the selected filters.</p></div>
          <label className="pe-search">Search records
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="HHID, province, education…" />
          </label>
        </div>
        <div className="pe-table-wrap">
          <table>
            <thead><tr><th>Household ID</th><th>Province</th><th>Household size</th><th>Education</th><th>Financial access</th><th>Poverty status</th></tr></thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={row.hhid ?? index}>
                  <td>{row.hhid ?? "-"}</td>
                  <td>{row.province ?? ""}</td>
                  <td>{row.household_size ?? "-"}</td>
                  <td>{row.education_level ?? "-"}</td>
                  <td><span className={`pe-status ${row.financial_access === "Has access" ? "pe-status-good" : row.financial_access === "No access" ? "pe-status-warn" : ""}`}>{row.financial_access ?? "Unknown"}</span></td>
                  <td><span className={`pe-status ${Number(row.poverty_status) === 1 ? "pe-status-warn" : row.poverty_status != null ? "pe-status-good" : ""}`}>{row.poverty_status == null ? "Unknown" : Number(row.poverty_status) === 1 ? "Poor" : "Not poor"}</span></td>
                </tr>
              ))}
              {!filtered.length && <tr><td className="pe-no-rows" colSpan="6">{loading ? "Loading household records…" : "No records match the selected filters."}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pe-table-footer"><span>Showing {filtered.length} of {households.length} loaded records</span><span>Source: local RP-FVIP demo database</span></div>
      </section>

    
<footer className="rp-page-footer">
  <div className="rp-page-footer__brand">
    <strong>RP-FVIP</strong>
    <span>· Poverty Explorer</span>
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
    </div>
  );
}
