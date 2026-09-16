import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const svgIcon = (emoji, background) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:${background};box-shadow:0 2px 8px rgba(15,50,78,0.35);font-size:16px;border:2px solid white;">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

export const customerIcon = svgIcon("📍", "#1D6FA8");
export const driverIcon = svgIcon("🚚", "#D9962A");
export const pickerIcon = new L.Icon.Default();
