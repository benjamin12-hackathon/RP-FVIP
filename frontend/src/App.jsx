
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import PovertyExplorer from "./PovertyExplorer";
import VulnerabilityProfiler from "./VulnerabilityProfiler";
import MultidimensionalPoverty from "./MultidimensionalPoverty";
import FinancialInclusion from "./FinancialInclusion";
import RwandaMap from "./RwandaMap";
import InsightsReports from "./InsightsReports";

const navigation = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "poverty", icon: "poverty", label: "Poverty Explorer" },
  { id: "vulnerability", icon: "vulnerability", label: "Vulnerability Profiler" },
  { id: "multidimensional", icon: "multidimensional", label: "Multidimensional Poverty" },
  { id: "financial", icon: "financial", label: "Financial Inclusion" },
  { id: "map", icon: "map", label: "Rwanda Map" },
  { id: "reports", icon: "reports", label: "Insights & Reports" },
];

const provinceData = [
  { name: "Northern", value: 20.2 },
  { name: "Eastern", value: 26.8 },
  { name: "Southern", value: 34.7 },
  { name: "Western", value: 37.4 },
  { name: "Kigali", value: 9.1 },
];

const verifiedProvinceIndicators = {
  Northern: { poverty: 20.2, extreme: 3.2, mpi: 28.7 },
  Eastern: { poverty: 26.8, extreme: 4.5, mpi: 34.4 },
  Southern: { poverty: 34.7, extreme: 7.4, mpi: 35.2 },
  Western: { poverty: 37.4, extreme: 9.0, mpi: 33.5 },
  Kigali: { poverty: 9.1, extreme: 1.1, mpi: 12.4 },
};

// Illustrative district values only; not official NISR estimates.
const districts = [
  { name: "Nyamagabe", value: 51.4 },
  { name: "Gisagara", value: 45.6 },
  { name: "Nyanza", value: 43.3 },
  { name: "Nyamasheke", value: 42.8 },
  { name: "Rusizi", value: 44.2 },
  { name: "Rutsiro", value: 40.8 },
  { name: "Kamonyi", value: 39.7 },
  { name: "Nyaruguru", value: 39.7 },
  { name: "Karongi", value: 38.2 },
  { name: "Rubavu", value: 38.8 },
  { name: "Kayonza", value: 36.6 },
  { name: "Nyagatare", value: 36.4 },
  { name: "Kirehe", value: 14.2 },
  { name: "Gatsibo", value: 18.4 },
  { name: "Gasabo", value: 11.1 },
  { name: "Kicukiro", value: 6.9 },
];

const districtProvince = {
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

const allDistrictNames = Object.keys(districtProvince);

const DISTRICT_GEOJSON_URL =
  "https://gis.naeb.gov.rw/server/rest/services/Hosted/Administrative_Boundaries_WFL1/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\bdistrict\b/g, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

function getDistrictName(feature) {
  const properties = feature?.properties || {};

  const preferredKeys = [
    "district_name",
    "DISTRICT_NAME",
    "district",
    "District",
    "DISTRICT",
    "name",
    "NAME",
    "name_2",
    "NAME_2",
    "adm2_en",
    "ADM2_EN",
    "adm2_name",
    "ADM2_NAME",
  ];

  for (const key of preferredKeys) {
    const value = properties[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim().replace(/\s+District$/i, "");
    }
  }

  const matchingKey = Object.keys(properties).find((key) =>
    /district.*name|name.*district|adm2.*en|adm2.*name/i.test(key)
  );

  const fallback = matchingKey ? properties[matchingKey] : "";

  return typeof fallback === "string"
    ? fallback.trim().replace(/\s+District$/i, "")
    : "";
}

function getRings(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.filter(
      (ring) => Array.isArray(ring) && ring.length > 0
    );
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon) =>
      Array.isArray(polygon)
        ? polygon.filter(
            (ring) => Array.isArray(ring) && ring.length > 0
          )
        : []
    );
  }

  return [];
}

function getDistrictMapBounds(features) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  if (!Array.isArray(features) || features.length === 0) {
    return null;
  }

  features.forEach((feature) => {
    getRings(feature?.geometry).forEach((ring) => {
      ring.forEach((point) => {
        if (!Array.isArray(point) || point.length < 2) return;

        const longitude = Number(point[0]);
        const latitude = Number(point[1]);

        if (
          !Number.isFinite(longitude) ||
          !Number.isFinite(latitude)
        ) {
          return;
        }

        minLon = Math.min(minLon, longitude);
        maxLon = Math.max(maxLon, longitude);
        minLat = Math.min(minLat, latitude);
        maxLat = Math.max(maxLat, latitude);
      });
    });
  });

  if (
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLon) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat) ||
    minLon === maxLon ||
    minLat === maxLat
  ) {
    return null;
  }

  return { minLon, maxLon, minLat, maxLat };
}

function makeDistrictPath(feature, bounds) {
  if (!feature?.geometry || !bounds) return "";

  const rings = getRings(feature.geometry);
  const { minLon, maxLon, minLat, maxLat } = bounds;

  const viewWidth = 360;
  const viewHeight = 440;
  const padding = 18;

  const lonRange = maxLon - minLon;
  const latRange = maxLat - minLat;

  if (lonRange <= 0 || latRange <= 0) return "";

  const scale = Math.min(
    (viewWidth - padding * 2) / lonRange,
    (viewHeight - padding * 2) / latRange
  );

  const drawnWidth = lonRange * scale;
  const drawnHeight = latRange * scale;
  const offsetX = (viewWidth - drawnWidth) / 2;
  const offsetY = (viewHeight - drawnHeight) / 2;

  const project = (point) => {
    const longitude = Number(point?.[0]);
    const latitude = Number(point?.[1]);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return null;
    }

    const x = offsetX + (longitude - minLon) * scale;
    const y = viewHeight - offsetY - (latitude - minLat) * scale;

    return [x, y];
  };

  return rings
    .map((ring) => {
      if (!Array.isArray(ring) || ring.length === 0) return "";

      const commands = ring
        .map((point, index) => {
          const projected = project(point);
          if (!projected) return "";

          const [x, y] = projected;
          return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .filter(Boolean);

      return commands.length ? `${commands.join(" ")} Z` : "";
    })
    .filter(Boolean)
    .join(" ");
}

function getKpiMetrics(province, district, area, population) {
  const unavailable = {
    poverty: "—",
    extreme: "—",
    mpi: "—",
    financial: "—",
    scope: "No verified data for this selection",
  };

  if (area !== "All" || population !== "All") {
    return unavailable;
  }

  if (district !== "All Districts") {
    return unavailable;
  }

  if (province !== "All Provinces") {
    const data = verifiedProvinceIndicators[province];
    if (!data) return unavailable;

    return {
      poverty: `${data.poverty.toFixed(1)}%`,
      extreme: `${data.extreme.toFixed(1)}%`,
      mpi: `${data.mpi.toFixed(1)}%`,
      financial: "—",
      scope: `${province} • EICV7`,
    };
  }

  return {
    poverty: "27.4%",
    extreme: "5.4%",
    mpi: "30.5%",
    financial: "96.0%",
    scope: "National indicator",
  };
}


function getSelectionScope(province, district, area, population) {
  const parts = [];

  if (province !== "All Provinces") parts.push(province);
  if (district !== "All Districts") parts.push(district);
  if (area !== "All") parts.push(area);
  if (population !== "All") parts.push(population);

  return parts.length ? parts.join(" • ") : "National";
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [province, setProvince] = useState("All Provinces");
  const [district, setDistrict] = useState("All Districts");
  const [area, setArea] = useState("All");
  const [population, setPopulation] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("Nyamagabe");
  const [dashboardMapZoom, setDashboardMapZoom] = useState(1);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
const [notifications, setNotifications] = useState([
  {
    id: 1,
    title: "Welcome to RP-FVIP",
    message:
      "Explore poverty, deprivation and financial inclusion indicators.",
    icon: "i",
    read: false,
  },
  {
    id: 3,
    title: "EICV7 dataset unavailable",
    message:
      "The EICV7 dataset is not currently available on the official NISR website. This platform uses demo data for demonstration purposes.",
    icon: "!",
    read: false,
  },
]);

const hasUnreadNotifications = notifications.some((n) => !n.read);

  // One state and one request for the district map.
  const [districtMapFeatures, setDistrictMapFeatures] = useState([]);
  const [districtMapLoading, setDistrictMapLoading] = useState(true);
  const [districtMapError, setDistrictMapError] = useState("");
const [dashboardSummary, setDashboardSummary] = useState(null);
const [provinceChartData, setProvinceChartData] = useState([]);
const [summaryLoading, setSummaryLoading] = useState(true);
const [summaryError, setSummaryError] = useState("");
const [moduleData, setModuleData] = useState(null);
const [moduleLoading, setModuleLoading] = useState(true);
const [moduleError, setModuleError] = useState("");
const [databaseStatus, setDatabaseStatus] = useState("checking");

  const displayPercent = (value) =>
    moduleLoading
      ? "…"
      : value == null
        ? "—"
        : `${Number(value).toFixed(1)}%`;
  const mapBounds = useMemo(
    () => getDistrictMapBounds(districtMapFeatures),
    [districtMapFeatures]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadDistrictMap() {
      try {
        setDistrictMapLoading(true);
        setDistrictMapError("");

        const response = await fetch(DISTRICT_GEOJSON_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Map request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.features) || data.features.length === 0) {
          throw new Error("No district boundaries were returned.");
        }

        const features = data.features.filter((feature) => {
          const type = feature?.geometry?.type;
          return (
            (type === "Polygon" || type === "MultiPolygon") &&
            getDistrictName(feature)
          );
        });

        if (features.length === 0) {
          throw new Error("No usable district shapes or names were found.");
        }

        setDistrictMapFeatures(features);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("District map loading error:", error);
          setDistrictMapError(
            "District boundaries could not be loaded. Check your internet connection or the map service."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDistrictMapLoading(false);
        }
      }
    }

    loadDistrictMap();

    return () => controller.abort();
  }, []);

  
useEffect(() => {
  const controller = new AbortController();

  async function loadModuleData() {
    try {
      setModuleLoading(true);
      setModuleError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/dashboard/modules?province=${encodeURIComponent(province)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Could not load module data.");
      }

      const data = await response.json();
      setModuleData(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Module data error:", error);
        setModuleError("Module data could not be loaded.");
        setModuleData(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setModuleLoading(false);
      }
    }
  }

  loadModuleData();

  return () => controller.abort();
}, [province]);


useEffect(() => {
  let isMounted = true;
  let previousStatus = "checking";

  async function checkDatabase() {
    let newStatus;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/health"
      );

      if (!response.ok) {
        throw new Error("API unavailable");
      }

      const data = await response.json();

      newStatus =
        data.status === "ok" &&
        data.database === "connected"
          ? "connected"
          : "disconnected";
    } catch {
      newStatus = "disconnected";
    }

    if (!isMounted) return;

    setDatabaseStatus(newStatus);

    if (
      previousStatus !== "checking" &&
      previousStatus !== newStatus
    ) {
      setNotifications((previousNotifications) => [
        ...previousNotifications,
        {
          id: Date.now(),
          title:
            newStatus === "connected"
              ? "API connection restored"
              : "API connection lost",
          message:
            newStatus === "connected"
              ? "The API and database are reachable again."
              : "The API or database cannot currently be reached.",
          icon: newStatus === "connected" ? "✓" : "!",
          read: false,
        },
      ]);
    }

    previousStatus = newStatus;
  }

  checkDatabase();

  const intervalId = setInterval(checkDatabase, 10000);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);


useEffect(() => {
  const controller = new AbortController();

  async function loadDashboardData() {
    try {
      setSummaryLoading(true);
      setSummaryError("");

      const selectedProvince = encodeURIComponent(province);

      const [summaryResponse, provinceResponse] = await Promise.all([
        fetch(
          `http://127.0.0.1:8000/api/dashboard/summary?province=${selectedProvince}`,
          { signal: controller.signal }
        ),
        fetch("http://127.0.0.1:8000/api/poverty/province", {
          signal: controller.signal,
        }),
      ]);

      if (!summaryResponse.ok || !provinceResponse.ok) {
        throw new Error("Could not load dashboard data.");
      }

     
const summary = await summaryResponse.json();
const provincePayload = await provinceResponse.json();

const provinceRows = Array.isArray(provincePayload)
  ? provincePayload
  : provincePayload.value ?? [];

setDashboardSummary(summary);

setProvinceChartData(
  provinceRows.map((item) => ({
    name: item.province,
    value: Number(item.poverty_rate),
  }))
);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Dashboard data error:", error);
        setSummaryError("Dashboard data could not be loaded.");
        setDashboardSummary(null);
        setProvinceChartData([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSummaryLoading(false);
      }
    }
  }

  loadDashboardData();
const displayPercent = (value) =>
  moduleLoading
    ? "…"
    : value == null
      ? "—"
      : `${Number(value).toFixed(1)}%`;
  return () => controller.abort();
}, [province]);

  const selectedDistrictData =
    districts.find(
      (item) => normalizeName(item.name) === normalizeName(selectedDistrict)
    ) || null;

  const filteredDistrictNames =
    province === "All Provinces"
      ? allDistrictNames
      : allDistrictNames.filter(
          (name) => districtProvince[name] === province
        );

  
const selectionHasUnsupportedFilters =
  district !== "All Districts" ||
  area !== "All" ||
  population !== "All";

const summaryIsAvailable =
  dashboardSummary && !selectionHasUnsupportedFilters;

const kpis = {
  poverty:
    summaryLoading
      ? "Loading…"
      : summaryIsAvailable && dashboardSummary.poverty_rate !== null
        ? `${dashboardSummary.poverty_rate.toFixed(1)}%`
        : "—",

  extreme: "—",
  mpi: "—",

  financial:
    summaryLoading
      ? "Loading…"
      : summaryIsAvailable &&
          dashboardSummary.financial_inclusion_rate !== null
        ? `${dashboardSummary.financial_inclusion_rate.toFixed(1)}%`
        : "—",

  scope: summaryIsAvailable
    ? `${dashboardSummary.household_count} demo households`
    : "No verified data for this selection",
};

const selectionScope = getSelectionScope(
  province,
  district,
  area,
  population
);
  const handleNavigation = (id) => {
    setActivePage(id);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  const handleProvinceChange = (newProvince) => {
    setProvince(newProvince);
    setDistrict("All Districts");
  };

  const handleDistrictChange = (newDistrict) => {
    setDistrict(newDistrict);

    if (newDistrict !== "All Districts") {
      setSelectedDistrict(newDistrict);
    }
  };

  
const handleExploreDistrict = () => {
  const provinceForDistrict = districtProvince[selectedDistrict];

  if (provinceForDistrict) {
    setProvince(provinceForDistrict);
    setDistrict(selectedDistrict);
  } else {
    setProvince("All Provinces");
    setDistrict("All Districts");
  }

  setActivePage("poverty");
};

  const handleReset = () => {
    setProvince("All Provinces");
    setDistrict("All Districts");
    setArea("All");
    setPopulation("All");
    setSelectedDistrict("Nyamagabe");
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        
<button
  type="button"
  className="brand"
  onClick={() => setActivePage("dashboard")}
  aria-label="Go to Dashboard"
>
  <div className="brand-logo">
    <div className="brand-logo-inner">
      <span className="brand-sun" />
      <span className="brand-land" />
    </div>
  </div>

  <div className="brand-text">
    <strong className="brand-abbreviation">RP-FVIP</strong>

    <span className="brand-description">
      Rwanda Poverty &amp; Financial
      <br />
      Vulnerability Intelligence
      <br />
      Platform
    </span>
  </div>
</button>


        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className="nav-icon">
                <SidebarIcon type={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="mountain-art">
            <span />
            <span />
            <span />
          </div>
          <div className="footer-message">
            <p>Better data.</p>
            <p>Better decisions.</p>
            <p>A stronger Rwanda.</p>
          </div>
          <div className="rwanda-flag">
            <span className="flag-blue" />
            <span className="flag-yellow" />
            <span className="flag-green" />
            <span className="flag-sun" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-message">
            Data-driven insights for a more inclusive Rwanda.
          </div>

          <div className="topbar-user">
            <div className="notification-wrapper">
              <button
                type="button"
                className={`notification-button ${notificationsOpen ? "is-open" : ""}`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="21"
                  height="21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
               
               {hasUnreadNotifications && (
               <span className="notification-dot" />
                 )}
              </button>

{notificationsOpen && (
  <div className="topbar-dropdown notification-dropdown">
    <div className="dropdown-heading">
      <strong>Notifications</strong>
      <button
        type="button"
        className="dropdown-close"
        aria-label="Close notifications"
        onClick={() => setNotificationsOpen(false)}
      >
        ×
      </button>
    </div>

    <div className="notification-message is-read">
      <span className="notification-message-icon">
        {databaseStatus === "connected"
          ? "✓"
          : databaseStatus === "disconnected"
            ? "!"
            : "…"}
      </span>

      <div>
        <strong>API Status</strong>
        <p>
          {databaseStatus === "connected"
            ? "Connected. API and database are available."
            : databaseStatus === "disconnected"
              ? "Disconnected. API or database cannot be reached."
              : "Checking API and database connection..."}
        </p>
      </div>
    </div>

    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`notification-message ${
          notification.read ? "is-read" : "is-unread"
        }`}
      >
        <span className="notification-message-icon">
          {notification.icon}
        </span>

        <div>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      </div>
    ))}

    {hasUnreadNotifications && (
      <button
        type="button"
        className="dropdown-footer-button"
       onClick={() => {
  setNotifications((prev) =>
    prev
      .filter(
        (notification) =>
          notification.title !== "API connection restored" &&
          notification.title !== "API connection lost"
      )
      .map((notification) => ({
        ...notification,
        read: true,
      }))
  );

  setNotificationsOpen(false);
}}
      >
        Mark as viewed
      </button>
    )}
  </div>
)}
 </div>
            <div className="user-menu-wrapper">
              <button
                type="button"
                className="user-menu-button"
                aria-expanded={userMenuOpen}
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
              >
                <span className="user-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2z" />
                  </svg>
                </span>
              
              </button>

              {userMenuOpen && (
                <div className="topbar-dropdown user-dropdown">
                  <div className="user-dropdown-heading">
                    <span className="user-avatar">G</span>
                    <div>
                      <strong>Guest User</strong>
                      <small>Guest access</small>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleNavigation("dashboard")}
                  >
                    <span>⌂</span>Dashboard
                  </button>

                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleNavigation("reports")}
                  >
                    <span>▤</span>Insights &amp; Reports
                  </button>

                  <div className="dropdown-divider" />

                <button type="button"
                 className="dropdown-close"
                 aria-label="Close user menu"
                onClick={() => setUserMenuOpen(false)}
                >
                ×
              </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          {activePage === "dashboard" ? (
            <>
              <section className="page-header">
                <div>
                  <h1>
                    Welcome to the Rwanda Poverty &amp; Vulnerability 
                    Intelligence Platform
                  </h1>
                  <p>
                    Explore data, discover patterns, and support evidence-based decisions for inclusive development.
                  </p>
                </div>

                <div className="data-source">
                  <span>Data Source</span>
                  <strong>EICV7</strong>
                  <small>(2023/24)</small>
                </div>
              </section>

              <section className="filter-card">
                <Filter
                  label="Province"
                  value={province}
                  onChange={handleProvinceChange}
                  options={[
                    "All Provinces",
                    "Northern",
                    "Southern",
                    "Eastern",
                    "Western",
                    "Kigali",
                  ]}
                />

                <Filter
                  label="District"
                  value={district}
                  onChange={handleDistrictChange}
                  options={["All Districts", ...filteredDistrictNames]}
                />

                <Filter
                  label="Urban/Rural"
                  value={area}
                  onChange={setArea}
                  options={["All", "Urban", "Rural"]}
                />

                <Filter
                  label="Population Group"
                  value={population}
                  onChange={setPopulation}
                  options={[
                    "All",
                    "Children",
                    "Youth",
                    "Working Age",
                    "Older Persons",
                  ]}
                />

                <button type="button" className="reset-button" onClick={handleReset}>
                  Reset
                </button>
              </section>

              <section className="kpi-grid" aria-label="Key indicators">
                <KpiCard
                  icon="people"
                  title="Poverty Rate"
                  value={kpis.poverty}
                  subtitle={kpis.scope === "National indicator" ? "of the population" : kpis.scope}
                  type="blue"
                />
                <KpiCard
                  icon="database"
                  title="Extreme Poverty Rate"
                  value={kpis.extreme}
                  subtitle={kpis.extreme === "—" ? "Data unavailable for selection" : "of the population"}
                  type="purple"
                />
                <KpiCard
                  icon="chart"
                  title="Multidimensional Poverty"
                  value={kpis.mpi}
                  subtitle={kpis.mpi === "—" ? "Data unavailable for selection" : "of the population"}
                  type="green"
                />
                <KpiCard
                  icon="bank"
                  title="Financial Inclusion"
                  value={kpis.financial}
                  subtitle={kpis.financial === "—" ? "No verified provincial figure" : "of adults"}
                  type="orange"
                />
              </section>
                   {summaryError && (
                    <p role="alert">{summaryError}</p>
                   )}
              <p className="data-note">
                Figures reflect the selected geographic scope only where verified data are available.
                A dash (-) means the selected breakdown is not available in this prototype.
              </p>

              <section className="analytics-grid">
                <div className="panel province-panel">
                  <PanelHeader
                    title="Poverty Rate by Province"
                    subtitle="EICV7 monetary poverty rate • 2023/24"
                  />

                  <div
                    className="province-chart"
                    role="img"
                    aria-label="EICV7 monetary poverty rate by province"
                  >
                    <div className="province-y-axis" aria-hidden="true">
                      {[40, 30, 20, 10, 0].map((tick) => (
                        <span key={tick}>{tick}%</span>
                      ))}
                    </div>

                    <div className="province-plot">
                      {[10, 20, 30, 40].map((tick) => (
                        <div
                          className="province-gridline"
                          key={tick}
                          style={{ bottom: `${(tick / 45) * 100}%` }}
                        >
                          <span />
                        </div>
                      ))}

                      <div className="province-bars">
                       {provinceChartData.map((item) => (
                          <button
                            type="button"
                            key={item.name}
                            className={`province-bar-column ${
                              province === item.name ? "is-selected" : ""
                            }`}
                            onClick={() => handleProvinceChange(item.name)}
                            title={`Filter dashboard to ${item.name}: ${item.value}% poverty`}
                            aria-label={`${item.name}: ${item.value}% monetary poverty. Select province`}
                          >
                            <span className="province-bar-value">
                              {item.value.toFixed(1)}%
                            </span>

                            <span
                              className={`province-bar province-${item.name.toLowerCase()}`}
                              style={{ height: `${(item.value / 45) * 100}%` }}
                            />

                            <span className="province-bar-label">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="chart-footnote">
                    Source: NISR, EICV7 Main Indicators Report, 2023/24.
                    Select a province to filter the dashboard.
                  </p>
                </div>

               
<section className="rwanda-map-card map-panel">

                
<div className="rwanda-map-card-header">
  <div>
    <h2>Poverty Rate by District</h2>
    <p>Illustrative demo values - not official district estimates</p>
  </div>
  <span className="demo-badge">Illustrative demo data</span>
</div>


                  <div className="map-container">
                    {districtMapLoading ? (
                      <div className="district-map-message" role="status">
                        <span className="map-loader" />
                        <strong>Loading Rwanda district boundaries…</strong>
                      </div>
                    ) : districtMapError ? (
                      <div className="district-map-message map-load-error" role="alert">
                        <strong>Map unavailable</strong>
                        <p>{districtMapError}</p>
                        <button
                          type="button"
                          className="reset-button"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </button>
                      </div>
                    ) : !mapBounds ? (
                      <div className="district-map-message map-load-error" role="alert">
                        <strong>Map geometry unavailable</strong>
                        <p>The boundary data could not be converted into map coordinates.</p>
                      </div>
                    ) : (
                      <div className="map-background">
                        <div className="map-svg-area">
                          <span className="map-country uganda">UGANDA</span>
                          <span className="map-country drc">DRC</span>
                          <span className="map-country tanzania">TANZANIA</span>
                          <span className="map-country burundi">BURUNDI</span>

                          <span className="map-north">
                            N <span>▲</span>
                          </span>

                         <svg
  className="rwanda-map-svg"
  viewBox="0 0 360 440"
  role="group"
  aria-label="Interactive map of Rwanda districts"
>
  <g
    transform={`translate(${180 * (1 - dashboardMapZoom)}, ${
      220 * (1 - dashboardMapZoom)
    }) scale(${dashboardMapZoom})`}
  >
                            {districtMapFeatures.map((feature, index) => {
                              const name = getDistrictName(feature);
                              if (!name) return null;

                              const demoDistrict = districts.find(
                                (item) =>
                                  normalizeName(item.name) === normalizeName(name)
                              );

                              const value = Number(demoDistrict?.value);
                              const hasValue =
                                demoDistrict &&
                                demoDistrict.value !== null &&
                                demoDistrict.value !== "" &&
                                Number.isFinite(value);

                              const isSelected =
                                normalizeName(selectedDistrict) === normalizeName(name);

                              const levelClass = !hasValue
                                ? "level-unknown"
                                : value >= 40
                                  ? "level-red"
                                  : value >= 30
                                    ? "level-orange"
                                    : value >= 20
                                      ? "level-yellow"
                                      : "level-green";

                              const path = makeDistrictPath(feature, mapBounds);
                              if (!path) return null;

                              return (
                                <path
                                  key={feature.id ?? `${name}-${index}`}
                                  d={path}
                                  className={`rwanda-district ${levelClass} ${
                                    isSelected ? "selected" : ""
                                  }`}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={
                                    hasValue
                                      ? `${name} District, demo poverty value ${value}%`
                                      : `${name} District, no demo value available`
                                  }
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedDistrict(name)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      setSelectedDistrict(name);
                                    }
                                  }}
                                >
                                  <title>
                                    {hasValue
                                      ? `${name} District - illustrative demo poverty estimate: ${value}%`
                                      : `${name} District - No demo estimate`}
                                  </title>
                                </path>
                              );
                               })}
  </g>
</svg>
<div className="dashboard-map-controls">
  <button
    type="button"
    onClick={() =>
      setDashboardMapZoom((zoom) => Math.min(2.2, zoom + 0.15))
    }
    aria-label="Zoom in"
    title="Zoom in"
  >
    +
  </button>

  <button
    type="button"
    onClick={() =>
      setDashboardMapZoom((zoom) => Math.max(0.8, zoom - 0.15))
    }
    aria-label="Zoom out"
    title="Zoom out"
  >
    −
  </button>

  <button
    type="button"
    onClick={() => setDashboardMapZoom(1)}
    aria-label="Reset map view"
    title="Reset map view"
  >
    ⌂
  </button>
</div>
                        </div>

                        <div className="map-legend">
                          <div className="map-legend-item">
                            <span className="map-legend-dot red" />
                            <span>≥ 40%</span>
                          </div>
                          <div className="map-legend-item">
                            <span className="map-legend-dot orange" />
                            <span>30–39.9%</span>
                          </div>
                          <div className="map-legend-item">
                            <span className="map-legend-dot yellow" />
                            <span>20–29.9%</span>
                          </div>
                          <div className="map-legend-item">
                            <span className="map-legend-dot green" />
                            <span>Below 20%</span>
                          </div>
                          <div className="map-legend-item">
                            <span className="map-legend-dot unknown" />
                            <span>No demo data</span>
                          </div>
                        </div>
                      </div>
                    )}

                    
                  </div>
                </section>

<div className="panel insights-panel">
  <PanelHeader
    title="Key Insights"
    subtitle="Priority areas for analysis"
  />

  <div className="insights-list">
    <Insight
      icon="trend"
      title="Rural–urban poverty"
      text="Compare poverty rates across rural and urban areas using the same indicator and reporting period."
      color="pink"
      tag="Geographic patterns"
    />

    <Insight
      icon="people"
      title="Education & employment"
      text="Examine how education attainment and employment status vary across population groups experiencing poverty."
      color="blue"
      tag="Social vulnerability"
    />

    <Insight
      icon="bank"
      title="Financial inclusion"
      text="Compare formal access, informal access and financial exclusion across districts and population groups."
      color="green"
      tag="Financial access"
    />

    <Insight
      icon="chart"
      title="Multidimensional deprivation"
      text="Review education, health and living-standard indicators together to identify overlapping disadvantages."
      color="purple"
      tag="MPI analysis"
    />
  </div>

  <p className="insights-note">
    These are analytical priorities, not confirmed findings.
    Validate each conclusion against the relevant EICV7 data.
  </p>

  <button
    type="button"
    className="primary-button text-link"
    onClick={() => handleNavigation("reports")}
  >
    View detailed analysis <span aria-hidden="true"></span>
  </button>
</div>
              </section>

<section className="lower-grid">
  {/* Multidimensional Poverty */}
  <div className="panel lower-module-panel mpi-panel">
    <PanelHeader
      title="Multidimensional Poverty"
    subtitle="Illustrative dimension scores • Demo data"
    />

    <div className="progress-list">
    
<Progress
  label="Education"
  value={moduleData?.mpi?.education}
/>
<Progress
  label="Health"
  value={moduleData?.mpi?.health}
/>
<Progress
  label="Living Standards"
  value={moduleData?.mpi?.living_standards}
/>
<Progress
  label="Housing"
  value={moduleData?.mpi?.housing}
/>
<Progress
  label="Water & Sanitation"
  value={moduleData?.mpi?.water_sanitation}
/>
<Progress
  label="Electricity"
  value={moduleData?.mpi?.electricity}
/>
<Progress
  label="Employment"
  value={moduleData?.mpi?.employment}
/>
    </div>

    <p className="module-data-note">
      Demo values only. Verified indicators will follow the selected filters
      once the EICV7 data pipeline is connected.
    </p>

    <button
      type="button"
      className="primary-button module-action"
      onClick={() => handleNavigation("multidimensional")}
    >
      Explore MPI <span aria-hidden="true"></span>
    </button>
  </div>

  {/* Household Vulnerability Profile */}
  <div className="panel lower-module-panel vulnerability-panel">
    <PanelHeader
      title="Household Vulnerability Profile"
      subtitle="Illustrative indicators • Demo data"
    />

    <div className="vulnerability-list">
<ProfileRow
  label="Large household size (≥ 6)"
  value={displayPercent(moduleData?.vulnerability?.large_households)}
/>
<ProfileRow
  label="No formal education"
  value={displayPercent(moduleData?.vulnerability?.no_formal_education)}
/>
<ProfileRow
  label="Unemployment"
  value={displayPercent(moduleData?.vulnerability?.unemployment)}
/>
<ProfileRow
  label="Poor housing conditions"
  value={displayPercent(moduleData?.vulnerability?.poor_housing)}
/>
<ProfileRow
  label="No financial access"
  value={displayPercent(moduleData?.vulnerability?.no_financial_access)}
/>
<ProfileRow
  label="Dependents"
  value={displayPercent(moduleData?.vulnerability?.dependents)}
/>
    </div>

    <p className="module-data-note">
      Demo values only. Indicator definitions and estimates will be verified
      against the EICV7 data dictionary.
    </p>

    <button
      type="button"
      className="primary-button module-action"
      onClick={() => handleNavigation("vulnerability")}
    >
      Explore Vulnerability <span aria-hidden="true"></span>
    </button>
  </div>

  {/* Financial Inclusion */}
  <div className="panel lower-module-panel financial-panel">
    <PanelHeader
      title="Financial Inclusion"
      subtitle="Illustrative access overview • Demo data"
    />

    <div className="donut-wrapper">
    
<div
  className="donut"
  style={{
    background:
      moduleData?.financial?.has_access == null
        ? "#e8eef4"
        : `conic-gradient(
            #40aa7b 0% ${Math.max(
              0,
              Math.min(Number(moduleData.financial.has_access), 100)
            )}%,
            #f59e0b ${Math.max(
              0,
              Math.min(Number(moduleData.financial.has_access), 100)
            )}% 100%
          )`,
  }}
>
  <div className="donut-center">
    <strong>
      {displayPercent(moduleData?.financial?.has_access)}
    </strong>
    <span>Included</span>
  </div>
</div>
    </div>

    <div className="financial-legend">
     <LegendRow
  color="green"
  label="Formal access"
  value={displayPercent(moduleData?.financial?.formal_access)}
/>
<LegendRow
  color="blue"
  label="Informal access"
  value={displayPercent(moduleData?.financial?.informal_access)}
/>
<LegendRow
  color="orange"
  label="Financially excluded"
  value={displayPercent(moduleData?.financial?.financially_excluded)}
/>
    </div>

    <p className="module-data-note">
      Demo values only. The final breakdown will depend on verified financial
      access variables and the selected population.
    </p>

    <button
      type="button"
      className="primary-button module-action"
      onClick={() => handleNavigation("financial")}
    >
      Explore Financial Inclusion <span aria-hidden="true"></span>
    </button>
  </div>
</section>

              <section className="district-focus">
                <div>
                  <span className="eyebrow">SELECTED DISTRICT </span>
                  <h2>{selectedDistrict} District</h2>
                  <p>
                    Illustrative prototype value only. Replace with a verified district estimate before publication.
                  </p>
                </div>
                <div className="district-stat">
                  <span>Illustrative poverty estimate</span>
                  <strong>
                    {selectedDistrictData ? `${selectedDistrictData.value}%` : "—"}
                  </strong>
                </div>
                
<button
  type="button"
  className="primary-button"
  onClick={handleExploreDistrict}
>
  Explore District
</button>
              </section>

              <section className="quick-actions">
                <QuickAction
                  title="Poverty Explorer"
                  text="Compare poverty across areas and population groups."
                  onClick={() => handleNavigation("poverty")}
                />
                <QuickAction
                  title="Vulnerability Profiler"
                  text="Explore characteristics associated with observed poverty."
                  onClick={() => handleNavigation("vulnerability")}
                />
                <QuickAction
                  title="Rwanda Map"
                  text="Explore district-level geographic patterns."
                  onClick={() => handleNavigation("map")}
                />
                <QuickAction
                  title="Insights & Reports"
                  text="Review analytical findings and methodology."
                  onClick={() => handleNavigation("reports")}
                />
              </section>

              <footer className="content-footer">
                <div>
                  <strong>RP-FVIP</strong>
                  <span>Rwanda Poverty &amp; Financial Vulnerability Intelligence Platform</span>
                </div>
                <span>EICV7 2023/24 • Analytical prototype</span>
              </footer>
            </>
  ) : activePage === "poverty" ? (
  <PovertyExplorer
    onBack={() => setActivePage("dashboard")}
    initialProvince={province}
    selectedDistrict={selectedDistrict}
  />
) : activePage === "vulnerability" ? (
  <VulnerabilityProfiler
    onBack={() => setActivePage("dashboard")}
  />

  ) : activePage === "multidimensional" ? (
  <MultidimensionalPoverty
    onBack={() => setActivePage("dashboard")}
    province={province}
  />
  ) : activePage === "financial" ? (
    <FinancialInclusion
      onBack={() => setActivePage("dashboard")}
      province={province}
    />
  ) : activePage === "map" ? (
    <RwandaMap
      districtMapFeatures={districtMapFeatures}
      mapBounds={mapBounds}
      districtMapLoading={districtMapLoading}
      districtMapError={districtMapError}
      selectedDistrict={selectedDistrict}
      onSelectDistrict={setSelectedDistrict}
    />
    ) : activePage === "reports" ? (
  <InsightsReports
    dashboardSummary={dashboardSummary}
    provinceChartData={provinceChartData}
    onBack={() => setActivePage("dashboard")}
  />
  ) : (

  
            <section className="placeholder-page">
              <span className="placeholder-icon">◆</span>
              <h1>{navigation.find((item) => item.id === activePage)?.label}</h1>
              <p>This module is being connected to the RP-FVIP analytical pipeline.</p>
              <button
                className="primary-button"
                onClick={() => setActivePage("dashboard")}
              >
                 Back to Dashboard
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarIcon({ type }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    dashboard: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9 20v-5h6v5" />
      </>
    ),
    poverty: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.2 4.2M8.5 10.8h4.6M10.8 8.5v4.6" />
      </>
    ),
    vulnerability: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <circle cx="12" cy="16" r="3" />
      </>
    ),
    multidimensional: (
      <>
        <path d="m12 3 7 4v8l-7 4-7-4V7l7-4Z" />
        <path d="m12 3 7 4-7 4-7-4 7-4ZM12 11v8" />
      </>
    ),
    financial: (
      <>
        <path d="M4 9h16M5 9v8M9 9v8M15 9v8M19 9v8M3 19h18M12 3l9 4H3l9-4Z" />
      </>
    ),
    map: (
      <>
        <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    reports: (
      <>
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M15 3v4h4M9 11h6M9 15h6M9 19h4" />
      </>
    ),
  };

  return <svg {...common}>{paths[type] || paths.reports}</svg>;
}

function KpiIcon({ type }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 29,
    height: 29,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19v-1a6 6 0 0 1 12 0v1H3Z" />
        <path d="M16 14a5 5 0 0 1 5 5h-4" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="7.5" ry="3" />
        <path d="M4.5 5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5M4.5 10v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5M4.5 15v4c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V4M4 20h17" />
        <path d="m7 15 4-4 3 2 5-7" />
        <path d="M15.5 6H19v3.5" />
      </>
    ),
    bank: (
      <>
        <path d="m3 9 9-6 9 6H3Z" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M2 22h20" />
      </>
    ),
  };

  return <svg {...common}>{icons[type] || icons.chart}</svg>;
}


function Filter({ label, value, onChange, options }) {
  const isDefault = [
    "All",
    "All Provinces",
    "All Districts",
  ].includes(value);

  return (
    <label className="filter">
      <span>{label}</span>
      <select
        className={isDefault ? "filter-select is-default" : "filter-select is-selected"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}


function KpiCard({ icon, title, value, subtitle, type }) {
  return (
    <article className={`kpi-card ${type}`}>
      <div className="kpi-icon">
        <KpiIcon type={icon} />
      </div>
      <div className="kpi-content">
        <span className="kpi-title">{title}</span>
        <strong className={value === "—" ? "kpi-value unavailable" : "kpi-value"}>
          {value}
        </strong>
        <small>{subtitle}</small>
      </div>
    </article>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
}


function Insight({ icon, title, text, color, tag }) {
  return (
    <article className="insight">
      <div className={`insight-icon ${color}`} aria-hidden="true">
        {icon === "trend" ? (
          <svg viewBox="0 0 24 24">
            <path d="M3 17l6-6 4 3 8-9" />
            <path d="M15 5h6v6" />
          </svg>
        ) : (
          <KpiIcon type={icon} />
        )}
      </div>

      <div className="insight-copy">
        <span className="insight-tag">{tag}</span>
        <h4 className="insight-title">{title}</h4>
        <p className="insight-description">{text}</p>
      </div>
    </article>
  );
}


function Progress({ label, value }) {
  const available = value != null && Number.isFinite(Number(value));
  const percentage = available
    ? Math.max(0, Math.min(Number(value), 100))
    : null;

  return (
    <div className="progress-row">
      <span>{label}</span>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: available ? `${percentage}%` : "0%",
          }}
        />
      </div>

      <strong>{available ? `${percentage.toFixed(1)}%` : "—"}</strong>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="legend-row">
      <div>
        <span className={`legend-dot ${color}`} />
        {label}
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({ title, text, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <span>→</span>
    </button>
  );
}

export default App;