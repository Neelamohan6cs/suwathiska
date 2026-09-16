import { createContext, useCallback, useContext, useState } from "react";
import { HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi2";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3800);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const icons = {
    success: <HiCheckCircle className="h-5 w-5 text-leaf-500 shrink-0" />,
    error: <HiXCircle className="h-5 w-5 text-clay-500 shrink-0" />,
    info: <HiInformationCircle className="h-5 w-5 text-dairy-500 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fadeIn flex items-start gap-2.5 rounded-xl border border-dairy-100 bg-white px-4 py-3 shadow-card"
          >
            {icons[t.type]}
            <p className="text-sm text-ink">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
