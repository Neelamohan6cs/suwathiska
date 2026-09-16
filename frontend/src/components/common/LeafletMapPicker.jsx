import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { HiOutlineMapPin, HiOutlineMagnifyingGlass, HiOutlineArrowPath } from "react-icons/hi2";
import { pickerIcon } from "../../utils/leafletIcons";
import { getCurrentPosition } from "../../utils/geolocation";
import { reverseGeocode, searchAddress } from "../../api/geocodeApi";
import { useToast } from "../../context/ToastContext";
import Spinner from "./Spinner";

const DEFAULT_CENTER = { latitude: 11.2342, longitude: 78.8807 };

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnChange({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], map.getZoom() < 14 ? 15 : map.getZoom());
  }, [position?.latitude, position?.longitude]);
  return null;
}

export default function LeafletMapPicker({ value, onConfirm }) {
  const toast = useToast();
  const [position, setPosition] = useState(value || null);
  const [address, setAddress] = useState(value?.address || null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  const runReverseGeocode = async (pos) => {
    setGeocoding(true);
    setAddress(null);
    try {
      const res = await reverseGeocode(pos.latitude, pos.longitude);
      setAddress(res.data.address);
    } catch (err) {
      setAddress(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSelect = (pos) => {
    setPosition(pos);
    setResults([]);
    runReverseGeocode(pos);
  };

  const handleUseGps = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      handleSelect(pos);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleSearchChange = (val) => {
    setQuery(val);
    clearTimeout(searchTimer.current);
    if (val.trim().length < 3) {
      setResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchAddress(val.trim());
        setResults(res.data.results);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handlePickResult = (result) => {
    setQuery(result.displayName);
    handleSelect({ latitude: result.latitude, longitude: result.longitude });
  };

  useEffect(() => {
    if (!position) handleUseGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center = position || DEFAULT_CENTER;

  return (
    <div className="space-y-3">
      <div className="relative">
        <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-dairy-400" />
        <input
          className="input pl-10"
          placeholder="Search for a place or address…"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searching && <Spinner size="h-4 w-4" className="absolute right-3.5 top-1/2 -translate-y-1/2" />}
        {results.length > 0 && (
          <div className="absolute z-[500] mt-1 w-full overflow-hidden rounded-lg border border-dairy-100 bg-white shadow-card">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePickResult(r)}
                className="block w-full truncate px-3.5 py-2.5 text-left text-sm text-ink/80 hover:bg-dairy-50"
              >
                {r.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl2 border border-dairy-100" style={{ height: 320 }}>
        <MapContainer center={[center.latitude, center.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          <RecenterOnChange position={position} />
          {position && (
            <Marker
              position={[position.latitude, position.longitude]}
              icon={pickerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng();
                  handleSelect({ latitude: latlng.lat, longitude: latlng.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={handleUseGps} disabled={locating} className="btn-secondary text-xs">
          {locating ? "Locating…" : "Use my current location"}
        </button>
        <span className="text-xs text-ink/45">Tap the map or drag the pin to fine-tune</span>
      </div>

      <div className="rounded-xl2 border border-dairy-100 bg-dairy-50/50 p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-dairy-900">
          <HiOutlineMapPin className="h-4 w-4" /> Selected Delivery Location
        </p>
        {!position ? (
          <p className="mt-1.5 text-sm text-ink/50">No location selected yet.</p>
        ) : geocoding ? (
          <p className="mt-1.5 flex items-center gap-2 text-sm text-ink/50">
            <Spinner size="h-3.5 w-3.5" /> Detecting address…
          </p>
        ) : address ? (
          <div className="mt-1.5 space-y-0.5 text-sm text-ink/70">
            <p>{address.formattedAddress}</p>
            <p className="text-xs text-ink/50">
              {[address.village || address.city, address.district, address.state, address.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-wheat-600">
            Location selected successfully. Address could not be detected automatically.
          </p>
        )}
        {position && (
          <button
            type="button"
            onClick={() => onConfirm({ ...position, address })}
            disabled={geocoding}
            className="btn-primary mt-3 w-full"
          >
            Confirm Location
          </button>
        )}
      </div>
    </div>
  );
}
