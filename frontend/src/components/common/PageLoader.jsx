import Spinner from "./Spinner";

export default function PageLoader({ label = "Loading" }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-16">
      <Spinner size="h-8 w-8" />
      <p className="text-sm text-ink/60">{label}...</p>
    </div>
  );
}
