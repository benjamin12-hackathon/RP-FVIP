
import { useMemo } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  MapPinned,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import "./InsightsReports.css";

function formatNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return Number(value).toLocaleString();
}

function formatPercent(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
}

function downloadCsv(filename, rows) {
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv =
    "\uFEFF" +
    rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getValueStatus(value) {
  return value === null || value === undefined || value === ""
    ? "Unavailable"
    : "Available";
}

export default function InsightsReports({
  dashboardSummary,
  provinceChartData = [],
  onBack,
}) {
  const summary = dashboardSummary ?? {};

  const isDemo =
    String(summary.data_status ?? "").toLowerCase() === "demo";

  const hasPartialOfficialData =
    String(summary.data_status ?? "").toLowerCase() === "official_partial";

  const povertySource = summary.poverty_source || "NISR EICV7";
  const povertyPeriod = summary.reference_period || "2023–2024";
  const financialSource =
    summary.financial_inclusion_source || "FinScope 2024";
  const financialPeriod =
    summary.financial_inclusion_reference_period || "2024";

  const provinceRows = useMemo(
    () =>
      [...(Array.isArray(provinceChartData) ? provinceChartData : [])]
        .filter(
          (item) =>
            item?.name &&
            item.value !== null &&
            item.value !== undefined &&
            item.value !== "" &&
            Number.isFinite(Number(item.value))
        )
        .map((item) => ({
          name: String(item.name),
          value: Number(item.value),
        }))
        .sort((a, b) => b.value - a.value),
    [provinceChartData]
  );

  const metrics = [
    {
      label: "Poverty rate",
      value: formatPercent(summary.poverty_rate),
      note: `NISR EICV7 · ${povertyPeriod}`,
      icon: Activity,
      tone: "blue",
    },
    {
      label: "Extreme poverty",
      value: formatPercent(summary.extreme_poverty_rate),
      note: `NISR EICV7 · ${povertyPeriod}`,
      icon: AlertCircle,
      tone: "rose",
    },
    {
      label: "MPI incidence",
      value: formatPercent(summary.mpi_incidence),
      note: `NISR EICV7 · ${povertyPeriod}`,
      icon: BarChart3,
      tone: "teal",
    },
    {
      label: "Financial inclusion",
      value: formatPercent(summary.financial_inclusion_rate),
      note: `${financialSource} · ${financialPeriod}`,
      icon: Wallet,
      tone: "violet",
    },
  ];

  const handleExportCsv = () => {
    const rows = [
      ["RP-FVIP — Insights & Reports"],
      ["Generated on", new Date().toISOString()],
      ["Overall data status", summary.data_status || "Not specified"],
      [],
      ["Indicator", "Value", "Source", "Reference period", "Availability"],
      [
        "Poverty rate (%)",
        summary.poverty_rate,
        povertySource,
        povertyPeriod,
        getValueStatus(summary.poverty_rate),
      ],
      [
        "Extreme poverty rate (%)",
        summary.extreme_poverty_rate,
        povertySource,
        povertyPeriod,
        getValueStatus(summary.extreme_poverty_rate),
      ],
      [
        "MPI incidence (%)",
        summary.mpi_incidence,
        povertySource,
        povertyPeriod,
        getValueStatus(summary.mpi_incidence),
      ],
      [
        "MPI intensity (%)",
        summary.mpi_intensity,
        povertySource,
        povertyPeriod,
        getValueStatus(summary.mpi_intensity),
      ],
      [
        "MPI index",
        summary.mpi_index,
        povertySource,
        povertyPeriod,
        getValueStatus(summary.mpi_index),
      ],
      [
        "Financial inclusion (%)",
        summary.financial_inclusion_rate,
        financialSource,
        financialPeriod,
        getValueStatus(summary.financial_inclusion_rate),
      ],
      [
        "Household count",
        summary.household_count,
        "Not supplied by dashboard summary API",
        "",
        getValueStatus(summary.household_count),
      ],
      [],
      ["Provincial poverty indicators"],
      ["Province", "Poverty rate (%)", "Source", "Reference period"],
      ...provinceRows.map((item) => [
        item.name,
        item.value,
        povertySource,
        povertyPeriod,
      ]),
      [],
      [
        "Interpretation note",
        "Check source, methodology, geographic coverage and representativeness before interpreting or publishing results.",
      ],
      [
        "Data limitation",
        "Unavailable indicators are left blank. A blank value must not be interpreted as zero.",
      ],
    ];

    downloadCsv("rp-fvip-insights-report.csv", rows);
  };

  return (
    <main className="insights-reports">
      <header className="ir-page-header">
        <div className="ir-page-title">

          <h1>Insights &amp; Reports</h1>

        </div>

        <button
          className="ir-export-button"
          type="button"
          onClick={handleExportCsv}
        >
          <ArrowDownToLine size={17} aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </header>

      <section
        className={`ir-data-notice ${
          isDemo ? "ir-data-notice--warning" : "ir-data-notice--info"
        }`}
        role="status"
      >
        <span className="ir-notice-icon" aria-hidden="true">
          {isDemo ? (
            <AlertCircle size={19} />
          ) : hasPartialOfficialData ? (
            <Database size={19} />
          ) : (
            <ShieldCheck size={19} />
          )}
        </span>

        <div className="ir-notice-content">
          <strong>
            {isDemo
              ? "Demonstration data detected"
              : hasPartialOfficialData
                ? "Official indicators available — partial coverage"
                : "Review indicator sources and coverage"}
          </strong>
          <p>
            {isDemo
              ? "The current summary is marked as demonstration data. Do not interpret it as an official national estimate."
              : hasPartialOfficialData
                ? "The dashboard summary identifies NISR EICV7 indicators for 2023–2024 and FinScope 2024 financial-inclusion data. Some indicators may be unavailable; verify each source and reference period before use."
                : "Check each indicator’s source, reference period and availability. A connected API does not, by itself, establish that every figure is complete or verified."}
          </p>
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">01 / OVERVIEW</span>
            <h2>Executive summary</h2>
            <p>
              Key indicators supplied by the dashboard API for the current
              selection.
            </p>
          </div>
        </div>

        <div className="ir-metrics-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                className={`ir-metric-card ir-metric-card--${metric.tone}`}
                key={metric.label}
              >
                <div className="ir-metric-top">
                  <span className="ir-metric-label">
                    {metric.label}
                  </span>
                  <span className="ir-metric-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                </div>

                <strong className="ir-metric-value">
                  {metric.value}
                </strong>

                <div className="ir-metric-bottom">
                  <span className="ir-metric-source-dot" />
                  <p>{metric.note}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="ir-summary-meta">
          <div className="ir-summary-meta-item">
            <Database size={16} aria-hidden="true" />
            <span>
              <strong>Household records:</strong>{" "}
              {formatNumber(summary.household_count)}
            </span>
          </div>

          <div className="ir-summary-meta-item">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>
              <strong>API data status:</strong>{" "}
              {summary.data_status || "Not specified"}
            </span>
          </div>
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">02 / GEOGRAPHY</span>
            <h2>Provincial poverty indicators</h2>
            <p>
              Compare available province-level poverty estimates from the
              dashboard’s current data response.
            </p>
          </div>
        </div>

        <div className="ir-panel">
          <div className="ir-panel-header">
            <div className="ir-panel-title">
              <span className="ir-panel-icon" aria-hidden="true">
                <MapPinned size={19} />
              </span>
              <div>
                <h3>Province comparison</h3>
                <span>
                  Poverty rate · {povertySource} · {povertyPeriod}
                </span>
              </div>
            </div>

            <span
              className={`ir-source-tag ${
                provinceRows.length
                  ? "ir-source-tag--available"
                  : "ir-source-tag--empty"
              }`}
            >
              {provinceRows.length
                ? `${provinceRows.length} provinces`
                : "No data"}
            </span>
          </div>

          {provinceRows.length > 0 ? (
            <div className="ir-province-list">
              {provinceRows.map((item) => (
                <div className="ir-province-row" key={item.name}>
                  <span className="ir-province-name">
                    {item.name}
                  </span>

                  <div
                    className="ir-bar-track"
                    role="img"
                    aria-label={`${item.name}: ${formatPercent(item.value)}`}
                  >
                    <span
                      className="ir-bar-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, item.value)
                        )}%`,
                      }}
                    />
                  </div>

                  <strong className="ir-province-value">
                    {formatPercent(item.value)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="ir-empty-state">
              <span className="ir-empty-icon" aria-hidden="true">
                <BarChart3 size={28} />
              </span>
              <h3>No provincial data available</h3>
              <p>
                Provincial estimates will appear here when valid values
                have been returned by the dashboard API.
              </p>
            </div>
          )}

          <div className="ir-chart-footnote">
            <AlertCircle size={16} aria-hidden="true" />
            <p>
              These values represent the poverty estimates returned by the
              API. Confirm the official source, reference period and
              methodology before publication. Missing values are not
              treated as zero.
            </p>
          </div>
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">03 / PRIORITIES</span>
            <h2>Analytical priorities</h2>
            <p>
              Areas for further investigation, not findings established by
              the indicators displayed above.
            </p>
          </div>
        </div>

        <div className="ir-priority-grid">
          <article className="ir-priority-card">
            <span className="ir-priority-icon" aria-hidden="true">
              <MapPinned size={20} />
            </span>
            <div className="ir-priority-content">
              <h3>Geographic disparities</h3>
              <p>
                Compare provincial and district poverty estimates using
                consistent reference periods and validated geographic data.
              </p>
              <span className="ir-priority-label">Spatial analysis</span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-icon" aria-hidden="true">
              <GraduationCap size={20} />
            </span>
            <div className="ir-priority-content">
              <h3>Education &amp; livelihoods</h3>
              <p>
                Investigate the relationship between education, employment
                and poverty when suitable verified indicators are available.
              </p>
              <span className="ir-priority-label">
                Socioeconomic analysis
              </span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-icon" aria-hidden="true">
              <Wallet size={20} />
            </span>
            <div className="ir-priority-content">
              <h3>Financial inclusion</h3>
              <p>
                Review access to financial services using the separately
                sourced FinScope 2024 indicators and their definitions.
              </p>
              <span className="ir-priority-label">
                Access &amp; resilience
              </span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-icon" aria-hidden="true">
              <BookOpen size={20} />
            </span>
            <div className="ir-priority-content">
              <h3>Multidimensional deprivation</h3>
              <p>
                Examine MPI incidence, intensity and index values together
                where the underlying indicators are available.
              </p>
              <span className="ir-priority-label">MPI analysis</span>
            </div>
          </article>
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">04 / DATA QUALITY</span>
            <h2>Data quality &amp; reliability</h2>
            <p>
              Understand the coverage, provenance and limitations of the
              currently available indicators.
            </p>
          </div>
        </div>

        <div className="ir-method-grid">
          <article className="ir-method-card">
            <span className="ir-method-icon ir-method-icon--blue">
              <Database size={20} aria-hidden="true" />
            </span>
            <h3>Dataset coverage</h3>
            <p>
              The dashboard summary does not currently provide a household
              count. Geographic coverage and representativeness should be
              confirmed separately.
            </p>
            <span className="ir-method-status">
              {summary.household_count === null ||
              summary.household_count === undefined
                ? "Household count unavailable"
                : `${formatNumber(summary.household_count)} records reported`}
            </span>
          </article>

          <article className="ir-method-card">
            <span className="ir-method-icon ir-method-icon--teal">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <h3>Indicator sources</h3>
            <p>
              Poverty and MPI indicators are attributed to NISR EICV7
              for {povertyPeriod}. Financial inclusion is attributed to
              {` ${financialSource}`} for {financialPeriod}. These sources
              must not be presented as interchangeable.
            </p>
            <span className="ir-method-status">
              Sources identified separately
            </span>
          </article>

          <article className="ir-method-card">
            <span className="ir-method-icon ir-method-icon--amber">
              <AlertCircle size={20} aria-hidden="true" />
            </span>
            <h3>Before using results</h3>
            <p>
              Verify the original source, indicator definition, reference
              period, missing values and geographic coverage before using
              results in reports or policy decisions.
            </p>
            <span className="ir-method-status">
              Verify before publication
            </span>
          </article>
        </div>
      </section>

      <footer className="content-footer">
        <div>
          <strong>RP-FVIP /</strong>
          <span>
            Insights &amp; Reports
          </span>
        </div>
        <span>EICV7 2023/24 • Analytical prototype</span>
        {onBack && (
        <div className="ir-back-row">
          <button
            className="ir-back-button"
            type="button"
            onClick={onBack}
          >
            Back to Dashboard
          </button>
        </div>
      )}
      </footer>

    </main>
  );
}
