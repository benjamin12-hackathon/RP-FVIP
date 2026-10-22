
import { useEffect, useMemo, useState } from "react";
import "./PovertyExplorer.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const DISTRICT_PROVINCE = {
  Burera: "Northern",
  Gakenke: "Northern",
  Gicumbi: "Northern",
  Musanze: "Northern",
  Rulindo: "Northern",

  Gisagara: "Southern",
  Huye: "Southern",
  Kamonyi: "Southern",
  Muhanga: "Southern",
  Nyamagabe: "Southern",
  Nyanza: "Southern",
  Nyaruguru: "Southern",
  Ruhango: "Southern",

  Bugesera: "Eastern",
  Gatsibo: "Eastern",
  Kayonza: "Eastern",
  Kirehe: "Eastern",
  Ngoma: "Eastern",
  Nyagatare: "Eastern",
  Rwamagana: "Eastern",

  Karongi: "Western",
  Ngororero: "Western",
  Nyabihu: "Western",
  Nyamasheke: "Western",
  Rubavu: "Western",
  Rusizi: "Western",
  Rutsiro: "Western",

  Gasabo: "Kigali",
  Kicukiro: "Kigali",
  Nyarugenge: "Kigali",
};

const PROVINCES = [
  "Northern",
  "Eastern",
  "Southern",
  "Western",
  "Kigali",
];

function PEIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    poverty: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5c-.7-.8-1.7-1.2-3-1.2-1.7 0-3 .9-3 2.2 0 3.5 6.5 1.3 6.5 4.6 0 1.3-1.3 2.3-3.2 2.3-1.3 0-2.5-.5-3.3-1.4M12 5.5v13" />
      </>
    ),
    extreme: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4.5M12 17h.01" />
      </>
    ),
    mpi: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    ),
  };

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...common}
    >
      {paths[type] || paths.database}
    </svg>
  );
}

function MetricCard({ icon, label, value, detail }) {
  return (
    <article className="pe-metric-card">
      <div className="pe-metric-top">
        <span className="pe-metric-label">{label}</span>
        <span className="pe-metric-icon">
          <PEIcon type={icon} />
        </span>
      </div>
      <div className="pe-metric-value">{value}</div>
      <div className="pe-metric-detail">{detail}</div>
    </article>
  );
}

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

function formatIndex(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(3) : "—";
}

export default function PovertyExplorer({
  initialProvince = "All Provinces",
  selectedDistrict = "Nyamagabe",
}) {
  const [summary, setSummary] = useState(null);
  const [provinceData, setProvinceData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [province, setProvince] = useState(initialProvince);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setProvince(initialProvince || "All Provinces");
  }, [initialProvince]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOfficialData() {
      setLoading(true);
      setError("");

      try {
        const [summaryResponse, provinceResponse, districtResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/dashboard/summary`, {
              signal: controller.signal,
            }),
            fetch(`${API_BASE}/api/poverty/province`, {
              signal: controller.signal,
            }),
            fetch(`${API_BASE}/api/poverty/district`, {
              signal: controller.signal,
            }),
          ]);

        if (
          !summaryResponse.ok ||
          !provinceResponse.ok ||
          !districtResponse.ok
        ) {
          throw new Error("Official poverty data could not be loaded.");
        }

        const [summaryJson, provinceJson, districtJson] = await Promise.all([
          summaryResponse.json(),
          provinceResponse.json(),
          districtResponse.json(),
        ]);

        const provinces = Array.isArray(provinceJson)
          ? provinceJson
          : provinceJson.value;

        if (!Array.isArray(provinces) || !Array.isArray(districtJson)) {
          throw new Error("The poverty API returned an unexpected data format.");
        }

        setSummary(summaryJson);
        setProvinceData(provinces);
        setDistrictData(districtJson);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Poverty Explorer data error:", err);
          setError(err.message || "Poverty data could not be loaded.");
          setSummary(null);
          setProvinceData([]);
          setDistrictData([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadOfficialData();

    return () => controller.abort();
  }, []);

  const filteredDistricts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return districtData
      .filter((item) => {
        const districtName = item.district || "";
        const districtProvince = DISTRICT_PROVINCE[districtName];

        const matchesProvince =
          province === "All Provinces" ||
          districtProvince === province;

        const matchesSearch = districtName.toLowerCase().includes(query);

        return matchesProvince && matchesSearch;
      })
      .sort((a, b) => a.district.localeCompare(b.district));
  }, [districtData, province, search]);

  const selectedProvinceData = provinceData.find(
    (item) => item.province === province
  );

  const selectedDistrictData = districtData.find(
    (item) => item.district === selectedDistrict
  );

  const areaRate =
    province === "All Provinces"
      ? summary?.poverty_rate
      : selectedProvinceData?.poverty_rate;

  const source =
    summary?.poverty_source || "National Institute of Statistics of Rwanda";

  const referencePeriod = summary?.reference_period || "2023–2024";

  return (
    <main className="poverty-explorer">
      <header className="pe-header">
        <div>
          <h1>Poverty Explorer</h1>
          <p>
            Explore verified poverty estimates across Rwanda’s provinces
            and districts.
          </p>
        </div>

        <div className="pe-source-badge">
          <PEIcon type="database" />
          <span>NISR EICV7</span>
        </div>
      </header>

      {error && (
        <div className="pe-error" role="alert">
          {error} Check that the backend API is running and accessible.
        </div>
      )}

      <section className="pe-metrics-grid">
        <MetricCard
          icon="poverty"
          label="National poverty rate"
          value={loading ? "Loading…" : formatPercent(summary?.poverty_rate)}
          detail={`NISR EICV7 · ${referencePeriod}`}
        />
        <MetricCard
          icon="extreme"
          label="Extreme poverty"
          value={
            loading
              ? "Loading…"
              : formatPercent(summary?.extreme_poverty_rate)
          }
          detail="National estimate"
        />
        <MetricCard
          icon="mpi"
          label="MPI index"
          value={loading ? "Loading…" : formatIndex(summary?.mpi_index)}
          detail="Multidimensional poverty"
        />
        <MetricCard
          icon="location"
          label={
            province === "All Provinces"
              ? "National / selected poverty rate"
              : `${province} poverty rate`
          }
          value={loading ? "Loading…" : formatPercent(areaRate)}
          detail={
            province === "All Provinces"
              ? "All provinces"
              : "Selected province"
          }
        />
      </section>

      <section className="pe-panel">
        <div className="pe-panel-header">
          <div>
            <h2>Poverty by province</h2>
            <p>Official provincial estimates from NISR EICV7.</p>
          </div>
          <span className="pe-period">{referencePeriod}</span>
        </div>

        {loading ? (
          <p className="pe-status">Loading official provincial estimates…</p>
        ) : provinceData.length === 0 ? (
          <p className="pe-status">No verified provincial data available.</p>
        ) : (
          <div className="pe-province-list">
            {provinceData.map((item) => (
              <button
                type="button"
                className={`pe-province-row ${
                  province === item.province ? "is-selected" : ""
                }`}
                key={item.province}
                onClick={() => setProvince(item.province)}
                aria-pressed={province === item.province}
              >
                <span className="pe-province-name">{item.province}</span>
                <span className="pe-bar-track">
                  <span
                    className="pe-bar-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(item.poverty_rate) || 0)
                      )}%`,
                    }}
                  />
                </span>
                <strong className="pe-province-value">
                  {formatPercent(item.poverty_rate)}
                </strong>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="pe-reset-button"
          onClick={() => setProvince("All Provinces")}
        >
          View all provinces
        </button>
      </section>

      <section className="pe-panel pe-district-panel">
        <div className="pe-panel-header">
          <div>
            <h2>District poverty estimates</h2>
            <p>
              Search districts and filter the list by province. Select a
              province above or use the filter below.
            </p>
          </div>
        </div>

        <div className="pe-filters">
          <label className="pe-filter-control">
            <span>Province</span>
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value)}
            >
              <option value="All Provinces">All Provinces</option>
              {PROVINCES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="pe-filter-control pe-search-control">
            <span>Search district</span>
            <span className="pe-search-input">
              <PEIcon type="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter district name"
              />
            </span>
          </label>
        </div>

        {loading ? (
          <p className="pe-status">Loading district estimates…</p>
        ) : (
          <>
            <div className="pe-table-wrap">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Province</th>
                    <th>Poverty rate</th>
                    <th>Reference period</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistricts.map((item) => (
                    <tr
                      key={item.district}
                      className={
                        item.district === selectedDistrict
                          ? "is-selected"
                          : ""
                      }
                    >
                      <td>{item.district}</td>
                      <td>{DISTRICT_PROVINCE[item.district] || "—"}</td>
                      <td>
                        <strong>{formatPercent(item.poverty_rate)}</strong>
                      </td>
                      <td>{item.reference_period || referencePeriod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDistricts.length === 0 && (
                <p className="pe-status">
                  No districts match your search and province selection.
                </p>
              )}
            </div>

            <div className="pe-table-footer">
              Showing {filteredDistricts.length} of {districtData.length}{" "}
              districts
            </div>
          </>
        )}
      </section>

      <footer className="pe-data-note">
        <strong>Data source:</strong> {source}. Reference period:{" "}
        {referencePeriod}. Household counts and other indicators are not
        estimated from demonstration records.
        {selectedDistrictData && (
          <span>
            {" "}
            Selected district: {selectedDistrictData.district} (
            {formatPercent(selectedDistrictData.poverty_rate)}).
          </span>
        )}
      </footer>
    </main>
  );
}
