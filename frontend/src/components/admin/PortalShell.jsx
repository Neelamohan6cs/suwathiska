import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { HiBars3, HiXMark, HiOutlineArrowRightOnRectangle, HiOutlineGlobeAlt } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";

export default function PortalShell({ title, roleLabel, navItems, accent = "dairy" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dairy-600 font-display text-sm font-semibold text-white">
          PD
        </span>
        <div>
          <p className="font-display text-sm leading-tight text-white">{title}</p>
          <p className="text-[11px] uppercase tracking-wide text-dairy-300">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-dairy-200/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-dairy-200/80 hover:bg-white/5 hover:text-white"
        >
          <HiOutlineGlobeAlt className="h-4.5 w-4.5" /> View storefront
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-clay-300 hover:bg-white/5"
        >
          <HiOutlineArrowRightOnRectangle className="h-4.5 w-4.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-milk-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-dairy-900 lg:block">
        {SidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-dairy-900">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
              aria-label="Close menu"
            >
              <HiXMark className="h-5 w-5" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-dairy-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-dairy-700 lg:hidden"
            aria-label="Open menu"
          >
            <HiBars3 className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg text-dairy-900">{title}</h1>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-sm text-ink/60 sm:inline">Hi, {user?.name?.split(" ")[0]}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dairy-100 font-display text-sm text-dairy-700">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
