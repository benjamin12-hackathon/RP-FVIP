
import { useEffect, useMemo, useState } from "react";
import RPPageFooter from "./RPPageFooter";
import {
  ArrowLeft,
  ChartColumn,
  CircleHelp,
  Droplets,
  HeartPulse,
  House,
  Info,
  Layers,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "./RwandaMap.css";
import {
  getDistrictName,
  makeDistrictPath,
  normalizeDistrictName,
} from "./RwandaMapUtils";

const PROVINCES = [
  "All Provinces",
  "Northern",
  "Eastern",
  "Southern",
  "Western",
  "Kigali",
];

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

const INDICATORS = [
  "Poverty Rate",
  "Multidimensional Poverty",
  "Financial Exclusion",
];

const getProvinceForDistrict = (district) => {
  const normalized = normalizeDistrictName(district);

  const matchedDistrict = Object.keys(DISTRICT_PROVINCE).find(
    (name) => normalizeDistrictName(name) === normalized
  );

  return matchedDistrict ? DISTRICT_PROVINCE[matchedDistrict] : null;
};

const getOfficialDistrict = (data, district) =>
  data.find(
    (item) =>
      normalizeDistrictName(item?.district) ===
      normalizeDistrictName(district)
  ) || null;

const getPovertyValue = (record) => {
  if (
    record?.poverty_rate === null ||
    record?.poverty_rate === undefined ||
    record?.poverty_rate === ""
  ) {
    return null;
  }

  const value = Number(record.poverty_rate);

  return Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
};

const getPovertyLevel = (value) => {
  if (value == null) return "level-unknown";
  if (value >= 40) return "level-red";
  if (value >= 30) return "level-orange";
  if (value >= 20) return "level-yellow";
  return "level-green";
};

export default function RwandaMap({
  districtMapFeatures = [],
  mapBounds,
  districtMapLoading = false,
  districtMapError = "",
  officialDistrictData = [],
  officialDistrictLoading = false,
  officialDistrictError = "",
  selectedDistrict: initialDistrict = "Nyamagabe",
  onSelectDistrict,
  onBack,
}) {
  const [selectedDistrict, setSelectedDistrict] =
    useState(initialDistrict || "Nyamagabe");

  const [indicator, setIndicator] = useState("Poverty Rate");
  const [province, setProvince] = useState("All Provinces");
  const [zoom, setZoom] = useState(1);

  // Keep the map selection synchronized with the parent Dashboard.
  useEffect(() => {
    if (!initialDistrict) return;

    setSelectedDistrict(initialDistrict);

    const districtProvince = getProvinceForDistrict(initialDistrict);

    setProvince((currentProvince) => {
      if (
        currentProvince !== "All Provinces" &&
        districtProvince !== currentProvince
      ) {
        return "All Provinces";
      }

      return currentProvince;
    });
  }, [initialDistrict]);

  const districtOptions = useMemo(
    () =>
      Object.keys(DISTRICT_PROVINCE)
        .filter(
          (district) =>
            province === "All Provinces" ||
            DISTRICT_PROVINCE[district] === province
        )
        .sort((a, b) => a.localeCompare(b)),
    [province]
  );

  const selectedData = useMemo(
    () => getOfficialDistrict(officialDistrictData, selectedDistrict),
    [officialDistrictData, selectedDistrict]
  );

  const selectedPoverty = getPovertyValue(selectedData);

  const indicatorAvailable = indicator === "Poverty Rate";

  const filteredFeatures = useMemo(
    () =>
      districtMapFeatures.filter((feature) => {
        const name = getDistrictName(feature);
        const districtProvince = getProvinceForDistrict(name);

        return (
          province === "All Provinces" ||
          districtProvince === province
        );
      }),
    [districtMapFeatures, province]
  );

  const handleSelect = (name) => {
    if (!name) return;

    setSelectedDistrict(name);
    onSelectDistrict?.(name);
  };

  const handleProvinceChange = (event) => {
    const nextProvince = event.target.value;
    setProvince(nextProvince);

    const nextDistricts = Object.keys(DISTRICT_PROVINCE)
      .filter(
        (district) =>
          nextProvince === "All Provinces" ||
          DISTRICT_PROVINCE[district] === nextProvince
      )
      .sort((a, b) => a.localeCompare(b));

    const currentDistrictFits =
      nextProvince === "All Provinces" ||
      getProvinceForDistrict(selectedDistrict) === nextProvince;

    if (!currentDistrictFits && nextDistricts.length > 0) {
      handleSelect(nextDistricts[0]);
    }
  };

  const handleDistrictChange = (event) => {
    handleSelect(event.target.value);
  };

  const handleIndicatorChange = (event) => {
    setIndicator(event.target.value);
  };

  const mapDataLoading =
    indicatorAvailable && officialDistrictLoading;

  const mapDataError =
    indicatorAvailable && Boolean(officialDistrictError);

  const mapHasBoundaries =
    Array.isArray(districtMapFeatures) &&
    districtMapFeatures.length > 0 &&
    Boolean(mapBounds);

  return (
    <main className="rwanda-map-page">
      <header className="rwanda-map-heading">
        <div className="rwanda-map-heading-copy">

          <h1>Rwanda Poverty Map</h1>

        </div>

        <div className="rwanda-map-heading-badge">
          <MapPin size={17} aria-hidden="true" />
          <span>Rwanda · District view</span>
        </div>
      </header>

      <section
        className="rwanda-map-filters"
        aria-label="Map filters"
      >
        <div className="rwanda-map-filter-heading">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <div>
            <h2>Explore the map</h2>
            <p>Choose an indicator and geographic area.</p>
          </div>
        </div>

        <label className="rwanda-map-filter">
          <span>Indicator</span>
          <select
            value={indicator}
            onChange={handleIndicatorChange}
          >
            {INDICATORS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="rwanda-map-filter">
          <span>Province</span>
          <select
            value={province}
            onChange={handleProvinceChange}
          >
            {PROVINCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="rwanda-map-filter">
          <span>District</span>
          <select
            value={
              districtOptions.includes(selectedDistrict)
                ? selectedDistrict
                : districtOptions[0] || ""
            }
            onChange={handleDistrictChange}
            disabled={districtOptions.length === 0}
          >
            {districtOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="rwanda-map-workspace">
        <section className="rwanda-map-card">
          <div className="rwanda-map-card-header">
            <div>
              <div className="rwanda-map-section-title">
                <Layers size={18} aria-hidden="true" />
                <span>District distribution</span>
              </div>

              <h2>{indicator} by district</h2>

              <p>
                Select a district on the map or use the district
                filter to inspect its available data.
              </p>
            </div>

            <span className="rwanda-map-source-badge">
              {indicatorAvailable
                ? "Poverty · 2023–2024"
                : "Indicator data unavailable"}
            </span>
          </div>

          <div className="rwanda-map-canvas">
            <span className="neighbor-label neighbor-uganda">
              UGANDA
            </span>
            <span className="neighbor-label neighbor-drc">
              DR CONGO
            </span>
            <span className="neighbor-label neighbor-tanzania">
              TANZANIA
            </span>
            <span className="neighbor-label neighbor-burundi">
              BURUNDI
            </span>


<div className="map-compass" aria-label="North">
  <span className="map-compass-label">N</span>
  <span className="map-compass-arrow">▲</span>
</div>


            {districtMapLoading ? (
              <div className="map-message" role="status">
                Loading district boundaries...
              </div>
            ) : districtMapError ? (
              <div className="map-message" role="alert">
                <Info size={20} aria-hidden="true" />
                <span>
                  District boundaries could not be loaded.
                  Check your connection and try again.
                </span>
              </div>
            ) : !mapHasBoundaries ? (
              <div className="map-message" role="status">
                District boundaries are currently unavailable.
              </div>
            ) : (
              <svg
                className="rwanda-map-svg"
                viewBox="0 0 360 440"
                role="group"
                aria-label="Interactive map of Rwanda districts"
              >
                <g
                  transform={`translate(${180 * (1 - zoom)}, ${
                    220 * (1 - zoom)
                  }) scale(${zoom})`}
                >
                  {filteredFeatures.map((feature, index) => {
                    const name = getDistrictName(feature);

                    if (!name) return null;

                    const officialDistrict = getOfficialDistrict(
                      officialDistrictData,
                      name
                    );

                    const value = indicatorAvailable
                      ? getPovertyValue(officialDistrict)
                      : null;

                    const path = makeDistrictPath(
                      feature,
                      mapBounds
                    );

                    if (!path) return null;

                    const levelClass = getPovertyLevel(value);
                    const isSelected =
                      normalizeDistrictName(selectedDistrict) ===
                      normalizeDistrictName(name);

                    const title = value !== null
                      ? `${name}: ${value.toFixed(1)}% poverty rate`
                      : `${name}: verified ${indicator.toLowerCase()} data unavailable`;

                    return (
                      <path
                        key={`${name}-${index}`}
                        d={path}
                        className={`district-shape ${levelClass} ${
                          isSelected ? "selected" : ""
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-label={title}
                        aria-pressed={isSelected}
                        onClick={() => handleSelect(name)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            handleSelect(name);
                          }
                        }}
                      >
                        <title>{title}</title>
                      </path>
                    );
                  })}
                </g>
              </svg>
            )}

            {mapHasBoundaries && !districtMapLoading && (
              <div className="map-zoom-controls">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) =>
                      Math.min(2.2, current + 0.15)
                    )
                  }
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn size={18} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) =>
                      Math.max(0.8, current - 0.15)
                    )
                  }
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <ZoomOut size={18} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="Reset map zoom"
                  title="Reset zoom"
                >
                  <RotateCcw size={17} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <div className="rwanda-map-legend">
            <div className="rwanda-map-legend-heading">
              <strong>
                {indicatorAvailable
                  ? "Poverty rate"
                  : indicator}
              </strong>
              <span>
                {indicatorAvailable
                  ? "Share of population"
                  : "No verified district-level values available"}
              </span>
            </div>

            {indicatorAvailable ? (
              <div className="rwanda-map-legend-items">
                {[
                  ["level-green", "Below 20%"],
                  ["level-yellow", "20%–29.9%"],
                  ["level-orange", "30%–39.9%"],
                  ["level-red", "40% and above"],
                  ["level-unknown", "No verified data"],
                ].map(([className, label]) => (
                  <span
                    className="rwanda-map-legend-item"
                    key={label}
                  >
                    <i
                      className={`rwanda-map-legend-swatch ${className}`}
                    />
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="rwanda-map-unavailable-note">
                The selected indicator is not currently available
                in the verified district dataset.
              </p>
            )}
          </div>

          <div className="rwanda-map-data-note">
            <Info size={16} aria-hidden="true" />
            <p>
              Map values are shown only when a matching district
              record is available. Missing values are not estimated
              or replaced with sample data.
            </p>
          </div>
        </section>

        <aside className="district-intelligence">
          <div className="intelligence-header">
            <div className="intelligence-title-copy">
              <p className="rwanda-map-eyebrow">
                DISTRICT INTELLIGENCE
              </p>

              <h2>{selectedDistrict} District</h2>

              <p>
                {getProvinceForDistrict(selectedDistrict)
                  ? `${getProvinceForDistrict(selectedDistrict)} Province`
                  : "Province information unavailable"}
              </p>
            </div>

            <span className="selected-dot" />
          </div>

          <div className="intelligence-selection-note">
            <MapPin size={16} aria-hidden="true" />
            <span>
              This panel updates when you select a district on the
              map or use the filters.
            </span>
          </div>

          <div className="intelligence-stat poverty-stat">
            <span className="intelligence-stat-icon">
              <ChartColumn size={21} aria-hidden="true" />
            </span>

            <div className="intelligence-stat-content">
              <p>Poverty Rate</p>

              {officialDistrictLoading ? (
                <strong className="intelligence-value-loading">
                  Loading...
                </strong>
              ) : officialDistrictError ? (
                <strong>Unavailable</strong>
              ) : selectedPoverty !== null ? (
                <strong>{selectedPoverty.toFixed(1)}%</strong>
              ) : (
                <strong>Not available</strong>
              )}

              <small>
                {selectedData?.source
                  ? `${selectedData.source} · ${
                      selectedData.reference_period || "Reference period unavailable"
                    }`
                  : "No matching verified district record"}
              </small>
            </div>
          </div>

          <div className="intelligence-stat mpi-stat">
            <span className="intelligence-stat-icon">
              <House size={21} aria-hidden="true" />
            </span>

            <div className="intelligence-stat-content">
              <p>Multidimensional Poverty</p>
              <strong>Not available</strong>
              <small>
                Verified district-level indicator data are not
                available in the current dataset.
              </small>
            </div>
          </div>

          <div className="intelligence-stat finance-stat">
            <span className="intelligence-stat-icon">
              <Wallet size={21} aria-hidden="true" />
            </span>

            <div className="intelligence-stat-content">
              <p>Financial Exclusion</p>
              <strong>Not available</strong>
              <small>
                Verified district-level indicator data are not
                available in the current dataset.
              </small>
            </div>
          </div>

          <section className="deprivation-panel">
            <div className="intelligence-subheading">
              <Droplets size={19} aria-hidden="true" />
              <h3>Key Deprivation Patterns</h3>
            </div>

            <p className="intelligence-empty-state">
              <CircleHelp size={18} aria-hidden="true" />
              <span>
                Housing, cooking fuel, water and health-related
                deprivation values are not displayed because
                verified district-level measurements are not
                available here.
              </span>
            </p>
          </section>

          <section className="compare-panel">
            <div className="intelligence-subheading">
              <Layers size={19} aria-hidden="true" />
              <h3>Indicator Comparison</h3>
            </div>

            <p className="intelligence-empty-state">
              <Info size={18} aria-hidden="true" />
              <span>
                A district-level comparison will be available when
                verified poverty, multidimensional poverty and
                financial inclusion indicators can be matched by
                district and reference period.
              </span>
            </p>
          </section>
        </aside>
      </div>

      <section className="why-map-matters">
        <div className="why-map-icon" aria-hidden="true">
          <HeartPulse size={25} />
        </div>

        <div className="why-map-copy">
          <h2>Why this matters</h2>
          <p>
            Explore available district-level poverty data to help
            identify geographic differences and support evidence-based
            decisions. Indicators are shown only where matching
            records are available.
          </p>
        </div>

        <div className="why-map-note">
          <strong>Evidence-led insights</strong>
          <span>Supporting a more inclusive Rwanda.</span>
        </div>
      </section>


<RPPageFooter
  page="Rwanda Map"
  note={
    officialDistrictLoading
      ? "Loading source data..."
      : officialDistrictError
        ? "Official source data unavailable"
        : "Source: NISR EICV7 · 2023–2024"
  }
  onBack={onBack}
/>

    </main>
  );
}
