export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4">
      <div className="animate-fadeIn w-full max-w-sm rounded-xl2 bg-white p-6 shadow-card">
        <h3 className="font-display text-lg text-dairy-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink/60">{description}</p>}
        <div className="mt-6 flex justify-end gap-2.5">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={tone === "danger" ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
