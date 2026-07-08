import { createContext, useContext, useState } from "react";
import { translate } from "./i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(
        navigator.language?.startsWith("ja") ? "ja" : "en"
    );

    const t = (key, ...args) => translate(lang, key, ...args);
    const toggleLang = () => setLang((prev) => (prev === "ja" ? "en" : "ja"));

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return ctx;
}