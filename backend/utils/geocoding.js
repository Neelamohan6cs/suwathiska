const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const APP_USER_AGENT = "SuwasthikaCattleFeed/1.0 (delivery-tracking; contact@Suwasthikafeed.in)";

const reverseGeocode = async (latitude, longitude) => {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": APP_USER_AGENT, "Accept-Language": "en" },
  });

  if (!res.ok) {
    throw new Error("Reverse geocoding request failed");
  }

  const data = await res.json();
  const a = data.address || {};

  return {
    formattedAddress: data.display_name || "",
    country: a.country || "",
    state: a.state || "",
    district: a.state_district || a.district || a.county || "",
    taluk: a.county || a.subdistrict || "",
    village: a.village || a.hamlet || "",
    city: a.city || a.town || a.municipality || "",
    area: a.suburb || a.neighbourhood || a.locality || "",
    postalCode: a.postcode || "",
  };
};

const forwardGeocode = async (query) => {
  const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=5&countrycodes=in`;

  const res = await fetch(url, {
    headers: { "User-Agent": APP_USER_AGENT, "Accept-Language": "en" },
  });

  if (!res.ok) {
    throw new Error("Address search request failed");
  }

  const data = await res.json();

  return data.map((item) => ({
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
};

module.exports = { reverseGeocode, forwardGeocode };
