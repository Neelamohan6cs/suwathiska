import { useLocation } from "react-router-dom";

export function usePortalBase() {
  const { pathname } = useLocation();
  return pathname.startsWith("/manager") ? "/manager" : "/admin";
}
