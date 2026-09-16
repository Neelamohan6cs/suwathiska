import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { driverIcon, customerIcon } from "../../utils/leafletIcons";

function FitBounds({ points }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (points.length < 1) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
    didFit.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);

  return null;
}

export default function DeliveryRouteMap({ driverLocation, customerLocation, routeGeometry, height = 320 }) {
  const routeLatLngs = useMemo(() => {
    if (!routeGeometry?.coordinates) return [];
    return routeGeometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [routeGeometry]);

  const points = [];
  if (driverLocation) points.push([driverLocation.latitude, driverLocation.longitude]);
  if (customerLocation) points.push([customerLocation.latitude, customerLocation.longitude]);

  const center = points[0] || [11.2342, 78.8807];

  return (
    <div className="overflow-hidden rounded-xl2 border border-dairy-100" style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 0 && <FitBounds points={points} />}
        {driverLocation && (
          <Marker position={[driverLocation.latitude, driverLocation.longitude]} icon={driverIcon} />
        )}
        {customerLocation && (
          <Marker position={[customerLocation.latitude, customerLocation.longitude]} icon={customerIcon} />
        )}
        {routeLatLngs.length > 0 && <Polyline positions={routeLatLngs} pathOptions={{ color: "#1D6FA8", weight: 5 }} />}
      </MapContainer>
    </div>
  );
}
