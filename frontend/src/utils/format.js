export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const localize = (field, lang) => {
  if (field === null || field === undefined) return "";
  if (typeof field === "string" || typeof field === "number") return field;
  if (typeof field === "object") return field[lang] ?? field.en ?? "";
  return "";
};

export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "—";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ${mins % 60} min`;
};
