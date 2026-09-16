import { Link } from "react-router-dom";
import { HiOutlineNoSymbol } from "react-icons/hi2";

export default function AccessDenied() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-500/10 text-clay-500">
        <HiOutlineNoSymbol className="h-8 w-8" />
      </span>
      <h1 className="text-2xl">Access Denied</h1>
      <p className="max-w-sm text-sm text-ink/55">
        You don't have permission to view this page with your current account.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
