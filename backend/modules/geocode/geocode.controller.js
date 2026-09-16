const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { reverseGeocode, forwardGeocode } = require("../../utils/geocoding");

const isValidLatitude = (lat) => typeof lat === "number" && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
const isValidLongitude = (lng) => typeof lng === "number" && !Number.isNaN(lng) && lng >= -180 && lng <= 180;

const reverseGeocodeHandler = asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return response.error(
      res,
      "A valid latitude (-90 to 90) and longitude (-180 to 180) are required",
      400
    );
  }

  try {
    const address = await reverseGeocode(latitude, longitude);
    return response.success(res, "Address detected successfully", {
      latitude,
      longitude,
      address,
    });
  } catch (err) {
    return response.success(
      res,
      "Location saved, but the address could not be detected automatically",
      { latitude, longitude, address: null }
    );
  }
});

const searchAddressHandler = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();

  if (q.length < 3) {
    return response.success(res, "Query too short", { results: [] });
  }

  try {
    const results = await forwardGeocode(q);
    return response.success(res, "Search results fetched successfully", { results });
  } catch (err) {
    return response.success(res, "Address search is temporarily unavailable", { results: [] });
  }
});

module.exports = { reverseGeocodeHandler, searchAddressHandler };
