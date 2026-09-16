import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import { ASSET_URL } from "../api/axios";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(ASSET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  const value = useMemo(
    () => ({
      joinOrderRoom: (orderId) => socketRef.current?.emit("joinDeliveryRoom", orderId),
      leaveOrderRoom: (orderId) => socketRef.current?.emit("leaveDeliveryRoom", orderId),
      on: (event, handler) => socketRef.current?.on(event, handler),
      off: (event, handler) => socketRef.current?.off(event, handler),
      getSocket: () => socketRef.current,
    }),
    []
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
