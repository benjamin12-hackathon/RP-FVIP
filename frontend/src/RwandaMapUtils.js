
export function normalizeDistrictName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\bdistrict\b/g, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

export function getDistrictName(feature) {
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

export function getRings(geometry) {
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

export function getDistrictMapBounds(features) {
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

export function makeDistrictPath(feature, bounds) {
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
