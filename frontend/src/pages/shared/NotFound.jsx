import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="font-display text-6xl text-dairy-200">404</span>
      <h1 className="text-2xl">Page not found</h1>
      <p className="max-w-sm text-sm text-ink/55">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
