export const getCurrentPosition = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission was denied. Please select your location manually on the map."));
        } else {
          reject(new Error("Unable to detect your current location. Please select it manually on the map."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  });

export const watchPosition = (onUpdate, onError, { minIntervalMs = 10000 } = {}) => {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation is not supported on this device"));
    return () => {};
  }

  let lastEmitted = 0;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      if (now - lastEmitted < minIntervalMs) return;
      lastEmitted = now;
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      onError?.(
        error.code === error.PERMISSION_DENIED
          ? new Error("Location permission was denied.")
          : new Error("Unable to track your live location right now.")
      );
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
};
