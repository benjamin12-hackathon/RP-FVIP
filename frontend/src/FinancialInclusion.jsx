
import { useEffect, useMemo, useState } from "react";
import "./FinancialInclusion.css";
import RPPageFooter from "./RPPageFooter";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const PROVINCES = [
  "Northern Province",
  "Eastern Province",
  "Southern Province",
  "Western Province",
  "Kigali City",
];

const EMPTY_FINANCIAL = {
  has_access: null,
  no_access: null,
  formal_access: null,
  informal_access: null,
  financially_excluded: null,
  banked: null,
  other_formal: null,
  source: "",
  reference_period: "",
};

function FinancialIcon({ type }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "access":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16.5 9" />
        </svg>
      );
    case "excluded":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 8.5l7 7m0-7l-7 7" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M3 9h18L12 4 3 9Z" />
          <path d="M5 10v7m4-7v7m6-7v7m4-7v7M3 20h18M4 17h16" />
        </svg>
      );
    case "formal":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h4" />
        </svg>
      );
    case "informal":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0m0-3a4 4 0 0 1 6 3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" />
        </svg>
      );
  }
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

function normalizeProvince(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized || normalized === "all" || normalized === "all provinces") {
    return "National";
  }

  const aliases = {
    northern: "Northern Province",
    "northern province": "Northern Province",
    eastern: "Eastern Province",
    "eastern province": "Eastern Province",
    southern: "Southern Province",
    "southern province": "Southern Province",
    western: "Western Province",
    "western province": "Western Province",
    kigali: "Kigali City",
    "kigali city": "Kigali City",
  };

  return aliases[normalized] ?? value;
}

function FinancialKpi({ title, value, detail, type }) {
  return (
    <article className="fi-summary-card">
      <div className="fi-kpi-top">
        <span className="fi-kpi-icon">
          <FinancialIcon type={type} />
        </span>
        <span className="fi-kpi-title">{title}</span>
      </div>
      <strong className="fi-kpi-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function FinancialInclusion({
  onBack,
  province = "All Provinces",
}) {
  const [national, setNational] = useState(EMPTY_FINANCIAL);
  const [provinceData, setProvinceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadIndicators() {
      setLoading(true);
      setError("");

      try {
        const requests = [
          fetch(`${API_BASE_URL}/api/dashboard/modules`, {
            signal: controller.signal,
          }),
          ...PROVINCES.map((name) => {
            const encoded = encodeURIComponent(name);
            return fetch(
              `${API_BASE_URL}/api/dashboard/modules?province=${encoded}`,
              { signal: controller.signal }
            );
          }),
        ];

        const responses = await Promise.all(requests);

        if (responses.some((response) => !response.ok)) {
          throw new Error("One or more indicator requests failed.");
        }

        const results = await Promise.all(
          responses.map((response) => response.json())
        );

        if (controller.signal.aborted) return;

        setNational({
          ...EMPTY_FINANCIAL,
          ...(results[0].financial ?? {}),
        });

        const byProvince = {};

        PROVINCES.forEach((name, index) => {
          byProvince[name] = {
            ...EMPTY_FINANCIAL,
            ...(results[index + 1].financial ?? {}),
          };
        });

        setProvinceData(byProvince);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Unable to load verified financial indicators. Check that the API is running and try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadIndicators();

    return () => controller.abort();
  }, []);

  const selectedProvince = normalizeProvince(province);

  const current = useMemo(() => {
    if (selectedProvince === "National") return national;
    return provinceData[selectedProvince] ?? EMPTY_FINANCIAL;
  }, [selectedProvince, national, provinceData]);

  const source = current.source || national.source || "FinScope 2024";
  const referencePeriod =
    current.reference_period || national.reference_period || "2024";

  const kpis = [
    {
      title: "Financial inclusion",
      value: formatPercent(current.has_access),
      detail: "Population with financial access",
      type: "access",
    },
    {
      title: "Financially excluded",
      value: formatPercent(current.financially_excluded),
      detail: "Excluded from financial services",
      type: "excluded",
    },
    {
      title: "Banked",
      value: formatPercent(current.banked),
      detail: "Banking access indicator",
      type: "bank",
    },
    {
      title: "Other formal services",
      value: formatPercent(current.other_formal),
      detail: "Formal non-bank services",
      type: "formal",
    },
  ];

  return (
    <section className="fi-page">
      <header className="fi-header">
        <div className="fi-header-content">
          <h1>Financial Inclusion</h1>
        </div>

        <div className="fi-source-badge">
          <FinancialIcon type="formal" />
          <div>
            <strong>{source}</strong>
            <span>Reference period: {referencePeriod}</span>
          </div>
        </div>
      </header>

      <div className="fi-notice" role="note">
        <span className="fi-notice-icon">
          <FinancialIcon type="access" />
        </span>
        <p>
          This page displays aggregate indicators returned by the API and
          attributed to FinScope 2024. These are not household-level records.
          Indicators may have different definitions and should not be assumed
          to be mutually exclusive.
        </p>
      </div>

      {error && (
        <div className="fi-error" role="alert">
          {error}
        </div>
      )}

      <div className="fi-section-heading">
        <div>
          <h2>{selectedProvince === "National" ? "National overview" : selectedProvince}</h2>
          <p>
            {selectedProvince === "National"
              ? "Financial inclusion indicators for Rwanda"
              : "Financial inclusion indicators for the selected province"}
          </p>
        </div>
        <span className="fi-geography-tag">
          {selectedProvince === "National" ? "National data" : "Province data"}
        </span>
      </div>

      <div className="fi-summary-grid">
        {kpis.map((item) => (
          <FinancialKpi
            key={item.title}
            {...item}
            value={loading ? "…" : item.value}
          />
        ))}
      </div>

      <section className="fi-panel">
        <div className="fi-panel-heading">
          <div>
            <h2>Financial access indicators</h2>
            <p>
              Reported percentages for the selected geographic area
            </p>
          </div>
        </div>

        {loading ? (
          <p className="fi-empty">Loading financial indicators…</p>
        ) : error ? (
          <p className="fi-empty">Indicators are currently unavailable.</p>
        ) : (
          <div className="fi-indicator-grid">
            <article className="fi-indicator-item">
              <span>Financial inclusion</span>
              <strong>{formatPercent(current.has_access)}</strong>
              <small>Source-reported API indicator</small>
            </article>
            <article className="fi-indicator-item">
              <span>Financial exclusion</span>
              <strong>{formatPercent(current.financially_excluded)}</strong>
              <small>Source-reported exclusion indicator</small>
            </article>
            <article className="fi-indicator-item">
              <span>Formally served</span>
              <strong>{formatPercent(current.formal_access)}</strong>
              <small>Formal financial access</small>
            </article>
            <article className="fi-indicator-item">
              <span>Informal only</span>
              <strong>{formatPercent(current.informal_access)}</strong>
              <small>Informal-only access indicator</small>
            </article>
          </div>
        )}
      </section>

      <section className="fi-panel fi-records-panel">
        <div className="fi-panel-heading">
          <div>
            <h2>Province comparison</h2>
            <p>
              Compare the available FinScope 2024 financial indicators by
              province.
            </p>
          </div>
          <span className="fi-record-count">
            {loading ? "Loading…" : `${PROVINCES.length} provinces`}
          </span>
        </div>

        <div className="fi-table-wrap">
          <table className="fi-table">
            <thead>
              <tr>
                <th>Province</th>
                <th>Financial inclusion</th>
                <th>Excluded</th>
                <th>Banked</th>
                <th>Other formal</th>
                <th>Informal only</th>
              </tr>
            </thead>
            <tbody>
              {PROVINCES.map((name) => {
                const item = provinceData[name] ?? EMPTY_FINANCIAL;
                const selected = selectedProvince === name;

                return (
                  <tr
                    key={name}
                    className={selected ? "fi-selected-row" : ""}
                  >
                    <td>
                      <span className="fi-province-name">{name}</span>
                      {selected && (
                        <span className="fi-selected-label">Selected</span>
                      )}
                    </td>
                    <td>{loading ? "…" : formatPercent(item.has_access)}</td>
                    <td>{loading ? "…" : formatPercent(item.financially_excluded)}</td>
                    <td>{loading ? "…" : formatPercent(item.banked)}</td>
                    <td>{loading ? "…" : formatPercent(item.other_formal)}</td>
                    <td>{loading ? "…" : formatPercent(item.informal_access)}</td>
                  </tr>
                );
              })}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="fi-empty-cell">
                    Province indicators could not be loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="fi-table-note">
          A dash means the API did not return a usable value. Values are
          displayed as returned; no household-level estimates are calculated
          on this page.
        </p>
      </section>

      <section className="fi-methodology">
        <h2>Data source and interpretation</h2>
        <p>
          <strong>Source:</strong> {source}. <strong>Reference period:</strong>{" "}
          {referencePeriod}.
        </p>
        <p>
          Financial inclusion, financial exclusion, banking, formal non-bank
          services, and informal-only services are distinct indicators.
          Differences in definitions, rounding, or survey reporting mean that
          their percentages should not automatically be added together or
          treated as complementary categories.
        </p>
        <p>
          This page uses aggregate API indicators only. It does not calculate
          national or provincial estimates from demonstration household
          records.
        </p>
      </section>

      <RPPageFooter
        page="Financial Inclusion"
        note={`Source: ${source}`}
        onBack={onBack}
      />
    </section>
  );
}
