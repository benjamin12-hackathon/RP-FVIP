
import { useMemo } from "react";
import "./InsightsReports.css";

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `${Number(value).toFixed(1)}%`;
}


function downloadCsv(filename, rows) {
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = "\uFEFF" + rows
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

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
  URL.revokeObjectURL(url);
}

export default function InsightsReports({
  dashboardSummary,
  provinceChartData = [],
  onBack,
}) {
  const summary = dashboardSummary ?? {};
  
  const handleExportCsv = () => {
    const rows = [
      ["RP-FVIP — Insights & Reports"],
      ["Data status", isDemo ? "DEMO DATA" : "Source verification required"],
      ["Notice", "Not official NISR estimates"],
      [],
      ["Executive summary"],
      ["Indicator", "Value"],
      ["Households in dataset", summary.household_count ?? ""],
      ["Poverty rate (%)", summary.poverty_rate ?? ""],
      ["Financial inclusion (%)", summary.financial_inclusion_rate ?? ""],
      [],
      ["Provincial poverty indicators"],
      ["Province", "Poverty rate (%)"],
      ...provinceRows.map((item) => [item.name, item.value ?? ""]),
      [],
      ["Interpretation note", "Check source, sample size, reference period and representativeness."],
    ];

    downloadCsv("rp-fvip-insights-report.csv", rows);
  };


  const isDemo = String(summary.data_status ?? "demo").toLowerCase() === "demo";

  const provinceRows = useMemo(
    () =>
      [...provinceChartData]
        .filter((item) => item?.name)
        .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0)),
    [provinceChartData]
  );

  const metrics = [
    {
      label: "Households in dataset",
      value: formatNumber(summary.household_count),
      note: "Records currently available",
     
    },
    {
      label: "Poverty rate",
      value: formatPercent(summary.poverty_rate),
      note: "Based on the active dataset",
      
    },
    {
      label: "Financial inclusion",
      value: formatPercent(summary.financial_inclusion_rate),
      note: "Households with financial access",
      
    },
    {
      label: "  Data status",
      value: isDemo ? "Demo" : "Connected",
      note: isDemo
        ? "Prototype data - not nationally representative"
        : "Check source and coverage before publication",
    
    },
  ];

  return (
    <main className="insights-reports">
    
<header className="ir-page-header">
 
<div className="ir-page-header">
  <div className="ir-page-title">
    <p className="ir-eyebrow">RP-FVIP / INSIGHTS &amp; REPORTS</p>
  </div>
</div>
 <button className="ir-export-button" type="button"
          onClick={handleExportCsv}> Export CSV  </button>
</header>


      {isDemo && (
        <section className="ir-data-notice" role="status">
          <span className="ir-notice-icon">i</span>
          <div>
            <strong>Prototype dataset in use</strong>
            <p>
              These figures describe the current demo records only. They are
              not official national estimates and should not be used to draw
              conclusions about Rwanda’s population.
            </p>
          </div>
        </section>
      )}

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">01 / OVERVIEW</span>
            <h2>Executive summary</h2>
            <p>A snapshot of the data currently connected to the platform.</p>
          </div>
        </div>

        <div className="ir-metrics-grid">
          {metrics.map((metric) => (
            <article className="ir-metric-card" key={metric.label}>
              <div className="ir-metric-top">
                <span className="ir-metric-label">{metric.label}</span>
                <span className="ir-metric-icon" aria-hidden="true">
                  {metric.icon}
                </span>
              </div>
              <strong className="ir-metric-value">{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">02 / GEOGRAPHY</span>
            <h2>Provincial poverty indicators</h2>
            <p>
              Compare the values available in the dashboard’s current
              province-level chart.
            </p>
          </div>
        </div>

        <div className="ir-panel">
          <div className="ir-panel-header">
            <div>
              <h3>Province comparison</h3>
              <span>Displayed values (%)</span>
            </div>
            <span className="ir-demo-tag">
              {isDemo ? "DEMO CONTEXT" : "CHECK SOURCE"}
            </span>
          </div>

          {provinceRows.length > 0 ? (
            <div className="ir-province-list">
              {provinceRows.map((item) => {
                const value = Number(item.value ?? 0);
                const width = Math.max(0, Math.min(100, value));

                return (
                  <div className="ir-province-row" key={item.name}>
                    <span className="ir-province-name">{item.name}</span>
                    <div
                      className="ir-bar-track"
                      role="img"
                      aria-label={`${item.name}: ${formatPercent(value)}`}
                    >
                      <span
                        className="ir-bar-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <strong className="ir-province-value">
                      {formatPercent(value)}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ir-empty-state">
              <span aria-hidden="true">▤</span>
              <h3>No province data available</h3>
              <p>
                Province indicators will appear here when the dashboard data
                has loaded.
              </p>
            </div>
          )}

          <p className="ir-chart-footnote">
            Important: geographic values should only be interpreted after
            checking their source, sample size, reference period, and
            representativeness.
          </p>
        </div>
      </section>

      <section className="ir-section">
        <div className="ir-section-heading">
          <div>
            <span className="ir-section-kicker">03 / PRIORITIES</span>
            <h2>Analytical priorities</h2>
            <p>
              Questions for further investigation, not confirmed findings.
            </p>
          </div>
        </div>

        <div className="ir-priority-grid">
          <article className="ir-priority-card">
            <span className="ir-priority-number">01</span>
            <div>
              <h3>Geographic disparities</h3>
              <p>
                Examine how poverty indicators vary by province and district
                using comparable, validated estimates.
              </p>
              <span className="ir-priority-label">Spatial analysis</span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-number">02</span>
            <div>
              <h3>Education &amp; livelihoods</h3>
              <p>
                Investigate associations between educational attainment,
                household circumstances, and poverty outcomes.
              </p>
              <span className="ir-priority-label">Socioeconomic analysis</span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-number">03</span>
            <div>
              <h3>Financial inclusion</h3>
              <p>
                Explore access to financial services and identify groups
                that may need further investigation.
              </p>
              <span className="ir-priority-label">Access &amp; resilience</span>
            </div>
          </article>

          <article className="ir-priority-card">
            <span className="ir-priority-number">04</span>
            <div>
              <h3>Multidimensional deprivation</h3>
              <p>
                Assess education, living conditions, and other dimensions
                when suitable indicators are available.
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
        Key limitations to consider before interpreting or publishing
        the current indicators.
      </p>
    </div>
  </div>

  <div className="ir-method-grid">
    <article className="ir-method-card">
      <span className="ir-method-icon" aria-hidden="true">▦</span>
      <h3>Dataset coverage</h3>
      <p>
        {isDemo
          ? `The current demonstration dataset contains ${formatNumber(
              summary.household_count
            )} household records. It is not nationally representative.`
          : `The current dataset contains ${formatNumber(
              summary.household_count
            )} household records. Geographic coverage and representativeness must be confirmed.`}
      </p>
      <span className="ir-method-status">
        {isDemo ? "Demo dataset" : "Coverage verification required"}
      </span>
    </article>

    <article className="ir-method-card">
      <span className="ir-method-icon" aria-hidden="true">%</span>
      <h3>Indicator interpretation</h3>
      <p>
        Poverty rate is calculated from the poverty_status field.
        Financial inclusion is calculated from has_financial_account.
        Results depend on the available records and variable definitions.
      </p>
      <span className="ir-method-status">
        Indicator definitions documented
      </span>
    </article>

    <article className="ir-method-card">
      <span className="ir-method-icon" aria-hidden="true">!</span>
      <h3>Before using results</h3>
      <p>
        Confirm missing values, data source, reference period,
        geographic coverage, and methodology before using results
        for policy decisions or publishing official statistics.
      </p>
      <span className="ir-method-status">
        {isDemo ? "Not official NISR statistics" : "Source verification required"}
      </span>
    </article>
  </div>
</section>


      <footer className="rp-page-footer">
  <div className="rp-page-footer__brand">
    <strong>RP-FVIP</strong>
    <span>· Vulnerability Profiler</span>
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
    </main>
  );
}
