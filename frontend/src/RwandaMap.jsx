import { useMemo, useState } from "react";
import "./RwandaMap.css";

const PROVINCES = [
  "All Provinces",
  "Northern",
  "Eastern",
  "Southern",
  "Western",
  "Kigali",
];

const DISTRICTS = [
  { name: "Nyamagabe", province: "Southern", poverty: 51.4 },
  { name: "Gisagara", province: "Southern", poverty: 45.6 },
  { name: "Nyanza", province: "Southern", poverty: 43.3 },
  { name: "Nyamasheke", province: "Western", poverty: 42.8 },
  { name: "Rusizi", province: "Western", poverty: 44.2 },
  { name: "Rutsiro", province: "Western", poverty: 40.8 },
  { name: "Kamonyi", province: "Southern", poverty: 39.7 },
  { name: "Nyaruguru", province: "Southern", poverty: 39.7 },
  { name: "Karongi", province: "Western", poverty: 38.2 },
  { name: "Rubavu", province: "Western", poverty: 38.8 },
  { name: "Kayonza", province: "Eastern", poverty: 36.6 },
  { name: "Nyagatare", province: "Eastern", poverty: 36.4 },
  { name: "Kirehe", province: "Eastern", poverty: 14.2 },
  { name: "Gatsibo", province: "Eastern", poverty: 18.4 },
  { name: "Gasabo", province: "Kigali", poverty: 11.1 },
  { name: "Kicukiro", province: "Kigali", poverty: 6.9 },
];

const getColor = (value) => {
  if (value == null) return "#d9e1ec";
  if (value < 20) return "#174ea6";
  if (value <= 30) return "#27966f";
  if (value <= 40) return "#f4d35e";
  if (value <= 50) return "#f59e0b";
  return "#dc4545";
};

export default function RwandaMap({
  districtMapFeatures = [],
  mapBounds,
  districtMapLoading = false,
  districtMapError = "",
  selectedDistrict: initialDistrict = "Nyamagabe",
  onSelectDistrict,
  onBack,
}) {
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [indicator, setIndicator] = useState("Poverty Rate");
  const [compareWith, setCompareWith] = useState("Financial Exclusion");
  const [province, setProvince] = useState("All Provinces");
  const [area, setArea] = useState("All");
  const [year, setYear] = useState("2023/24");
  const [zoom, setZoom] = useState(1);

  const selectedData = useMemo(
    () => DISTRICTS.find((item) => item.name === selectedDistrict),
    [selectedDistrict]
  );

  const filteredFeatures = useMemo(() => {
    return districtMapFeatures.filter((feature) => {
      const props = feature.properties || {};
      const name = String(
        props.district_name ||
        props.District ||
        props.district ||
        props.name ||
        props.ADM2_EN ||
        props.adm2_en ||
        ""
      ).replace(/\s+district$/i, "").trim();

      const district = DISTRICTS.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      );

      if (province !== "All Provinces" && district?.province !== province) {
        return false;
      }

      return true;
    });
  }, [districtMapFeatures, province]);

  const handleSelect = (name) => {
    setSelectedDistrict(name);
    onSelectDistrict?.(name);
  };

  return (
    <main className="rwanda-map-page">
      <header className="rwanda-map-heading">
        <div>
        <p className="rwanda-map-eyebrow">RP-FVIP / GEOGRAPHIC INTELLIGENCE</p>
          
        </div>
      </header>

      <section className="rwanda-map-filters" aria-label="Map filters">
        <label>
          <span>Indicator</span>
          <select value={indicator} onChange={(e) => setIndicator(e.target.value)}>
            <option>Poverty Rate</option>
            <option>Multidimensional Poverty</option>
            <option>Financial Exclusion</option>
          </select>
        </label>

        <label>
          <span>Compare with</span>
          <select value={compareWith} onChange={(e) => setCompareWith(e.target.value)}>
            <option>Financial Exclusion</option>
            <option>Poverty Rate</option>
            <option>Multidimensional Poverty</option>
          </select>
        </label>

        <label>
          <span>Province</span>
          <select value={province} onChange={(e) => setProvince(e.target.value)}>
            {PROVINCES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Area</span>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option>All</option>
            <option>Urban</option>
            <option>Rural</option>
          </select>
        </label>

        <label>
          <span>Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option>2023/24</option>
            <option>2022/23</option>
            <option>2021/22</option>
          </select>
        </label>
      </section>

      <div className="rwanda-map-workspace">
        <section className="rwanda-map-card">
          <div className="rwanda-map-card-header">
            <div>
              <h2>{indicator} by district</h2>
              <p>Select a district to inspect its indicators.</p>
            </div>
            <span className="demo-badge">Illustrative demo data</span>
          </div>

          <div className="rwanda-map-canvas">
            <span className="neighbor-label neighbor-uganda">UGANDA</span>
            <span className="neighbor-label neighbor-drc">DR CONGO</span>
            <span className="neighbor-label neighbor-tanzania">TANZANIA</span>
            <span className="neighbor-label neighbor-burundi">BURUNDI</span>
            <span className="map-compass">N<br />▲</span>

            {districtMapLoading ? (
              <div className="map-message">Loading district boundaries…</div>
            ) : districtMapError ? (
              <div className="map-message">
                District boundaries could not be loaded. Check your connection and retry.
              </div>
            ) : filteredFeatures.length === 0 || !mapBounds ? (
              <div className="map-message">
                No district boundaries available. The map needs valid GeoJSON features.
              </div>
            ) : (
              <svg
                className="rwanda-map-svg"
                viewBox="0 0 360 440"
                role="img"
                aria-label="Interactive map of Rwanda districts"
              >
                <g transform={`translate(${180 * (1 - zoom)}, ${220 * (1 - zoom)}) scale(${zoom})`}>
                  {filteredFeatures.map((feature, index) => {
                    const props = feature.properties || {};
                    const rawName =
                      props.district_name ||
                      props.District ||
                      props.district ||
                      props.name ||
                      props.ADM2_EN ||
                      props.adm2_en ||
                      "";
                    const name = String(rawName).replace(/\s+district$/i, "").trim();
                    const data = DISTRICTS.find(
                      (item) => item.name.toLowerCase() === name.toLowerCase()
                    );

                    const rings = feature.geometry?.type === "Polygon"
                      ? feature.geometry.coordinates
                      : feature.geometry?.type === "MultiPolygon"
                        ? feature.geometry.coordinates.flat(1)
                        : [];

                    const coordinates = rings.flat();
                    const points = coordinates.map(([lon, lat]) => {
                      const x = ((lon - mapBounds.minLon) /
                        (mapBounds.maxLon - mapBounds.minLon || 1)) * 320 + 20;
                      const y = 20 + ((mapBounds.maxLat - lat) /
                        (mapBounds.maxLat - mapBounds.minLat || 1)) * 400;
                      return `${x},${y}`;
                    });

                    if (!points.length) return null;

                    return (
                      <polygon
                        key={`${name}-${index}`}
                        points={points.join(" ")}
                        fill={getColor(data?.poverty)}
                        className={selectedDistrict === name ? "district-shape selected" : "district-shape"}
                        tabIndex={0}
                        role="button"
                        aria-label={`${name || "Unknown district"} district`}
                        onClick={() => data && handleSelect(name)}
                        onKeyDown={(event) => {
                          if (data && (event.key === "Enter" || event.key === " ")) {
                            event.preventDefault();
                            handleSelect(name);
                          }
                        }}
                      >
                        <title>
                          {name}: {data ? `${data.poverty}% illustrative poverty estimate` : "No demo estimate"}
                        </title>
                      </polygon>
                    );
                  })}
                </g>
              </svg>
            )}

            <div className="map-zoom-controls">
              <button type="button" onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))} aria-label="Zoom out">−</button>
              <button type="button" onClick={() => setZoom(1)} aria-label="Reset map zoom">⌂</button>
            </div>
          </div>

          <div className="rwanda-map-legend">
            <strong>Poverty rate</strong>
            {[
              ["#174ea6", "Below 20%"],
              ["#27966f", "20–30%"],
              ["#f4d35e", "31–40%"],
              ["#f59e0b", "41–50%"],
              ["#dc4545", "51% and above"],
              ["#d9e1ec", "No demo data"],
            ].map(([color, label]) => (
              <span key={label}><i style={{ background: color }} />{label}</span>
            ))}
          </div>
          <p className="rwanda-map-disclaimer">
            Demo estimates are illustrative only and are not official district statistics.
            The selected year and area filters are UI controls until verified data are connected.
          </p>
        </section>

        <aside className="district-intelligence">
          <div className="intelligence-header">
            <div>
              <p className="rwanda-map-eyebrow">DISTRICT INTELLIGENCE</p>
              <h2>{selectedDistrict} District</h2>
              <p>{selectedData?.province || "Province unavailable"} Province</p>
            </div>
            <span className="selected-dot" />
          </div>

          <div className="intelligence-stat poverty-stat">
            <span>◉</span>
            <div>
              <p>Poverty Rate</p>
              <strong>{selectedData ? `${selectedData.poverty.toFixed(1)}%` : "—"}</strong>
              <small>Illustrative share of population</small>
            </div>
          </div>

          <div className="intelligence-stat mpi-stat">
            <span>▦</span>
            <div>
              <p>Multidimensional Poverty</p>
              <strong>Not available</strong>
              <small>Verified district data required</small>
            </div>
          </div>

          <div className="intelligence-stat finance-stat">
            <span>↗</span>
            <div>
              <p>Financial Exclusion</p>
              <strong>Not available</strong>
              <small>Verified district data required</small>
            </div>
          </div>

          <section className="deprivation-panel">
            <h3>Key Deprivation Patterns</h3>
            <p>Illustrative placeholders - not measured district indicators.</p>
            {[
              ["Housing", 78],
              ["Cooking fuel", 62],
              ["Water", 48],
              ["Health insurance", 35],
            ].map(([label, value]) => (
              <div className="deprivation-row" key={label}>
                <div><span>{label}</span><strong>{value}%</strong></div>
                <div className="deprivation-track">
                  <span style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </section>

          <section className="compare-panel">
            <h3>Compare Indicators</h3>
            {[
              ["High poverty + high financial exclusion", "#dc4545"],
              ["High poverty + lower financial exclusion", "#f59e0b"],
              ["Lower poverty + high financial exclusion", "#8ac7a8"],
              ["Lower poverty + lower financial exclusion", "#27966f"],
            ].map(([label, color]) => (
              <div className="compare-row" key={label}>
                <i style={{ background: color }} />
                <span>{label}</span>
                <b aria-hidden="true">→</b>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <section className="why-map-matters">
        <div className="why-map-icon" aria-hidden="true">▤</div>
        <div>
          <h2>Why this matters</h2>
          <p>
            This map helps you explore how poverty, multidimensional deprivation and
            financial access gaps overlap across districts, so you can identify where
            support is needed most and make evidence-based decisions.
          </p>
        </div>
        <div className="why-map-note">
          <strong>Data-driven insights</strong>
          <span>For a more inclusive Rwanda.</span>
        </div>
      </section>

     
<footer className="rp-page-footer">
  <div className="rp-page-footer__brand">
    <strong>RP-FVIP</strong>
    <span>· Multidimensional Poverty</span>
  </div>

  <div className="rp-page-footer__note">
    Demo data analysis only
  </div>

  <button
    className="rp-back-button"
    type="button"
    onClick={() => window.location.reload()}
  >
    Back to Dashboard
  </button>
</footer>
    </main>
  );
}