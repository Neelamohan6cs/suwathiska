import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function PortalLoginForm({ expectedRole, title, subtitle, redirectPath }) {
  const { login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== expectedRole) {
        logout();
        toast.error("Access denied. This login is restricted to authorized accounts only.");
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dairy-900 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dairy-50 text-dairy-600">
          <HiOutlineShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl text-dairy-900">{title}</h1>
        <p className="mt-1 text-center text-sm text-ink/55">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          Restricted access. Accounts are issued by Suwasthika Dairy Feeds management.
        </p>
      </div>
    </div>
  );
}
