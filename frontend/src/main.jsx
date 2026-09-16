import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
