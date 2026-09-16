import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineBell } from "react-icons/hi2";
import { getMyNotifications } from "../../api/notificationApi";
import { useAuth } from "../../context/AuthContext";

export default function NotificationBell() {
  const { isAuthenticated, role } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    const load = async () => {
      try {
        const res = await getMyNotifications();
        if (active) setUnread(res.data.unreadCount || 0);
      } catch {
        // silent fail, non-critical
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || role !== "customer") return null;

  return (
    <Link
      to="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-dairy-700 transition hover:bg-dairy-50"
      aria-label="Notifications"
    >
      <HiOutlineBell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
