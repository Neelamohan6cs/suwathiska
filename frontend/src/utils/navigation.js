export const buildNavigateUrl = (latitude, longitude) => `geo:${latitude},${longitude}?q=${latitude},${longitude}`;

export const buildOsmDirectionsUrl = (latitude, longitude) =>
  `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`;
