const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

const getRoute = async (fromLatitude, fromLongitude, toLatitude, toLongitude) => {
  const coordinates = `${fromLongitude},${fromLatitude};${toLongitude},${toLatitude}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Routing request failed");
  }

  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No driving route could be found");
  }

  const route = data.routes[0];

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry,
  };
};

module.exports = { getRoute };
