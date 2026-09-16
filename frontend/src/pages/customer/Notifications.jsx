import { useEffect, useState } from "react";
import { HiOutlineBellSlash } from "react-icons/hi2";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notificationApi";
import { formatDateTime } from "../../utils/format";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMyNotifications()
      .then((res) => setNotifications(res.data.notifications))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) return <PageLoader label="Loading notifications" />;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="text-sm font-semibold text-dairy-600 hover:text-dairy-700">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<HiOutlineBellSlash />} title="No notifications" description="We'll let you know when something changes with your orders." />
      ) : (
        <div className="card divide-y divide-dairy-100">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-dairy-50/60 ${
                !n.isRead ? "bg-dairy-50/40" : ""
              }`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-dairy-600" : "bg-transparent"}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink/60">{n.message}</p>
                <p className="mt-1 text-xs text-ink/40">{formatDateTime(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
