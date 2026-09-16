import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("dairyfeed_lang") || "en");

  useEffect(() => {
    localStorage.setItem("dairyfeed_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ta" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
