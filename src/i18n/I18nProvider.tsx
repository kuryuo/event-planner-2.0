import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentLanguage,
  setCurrentLanguage,
  translate,
  type Language,
} from "@/i18n/index";
import { store } from "@/store/store";
import { baseApi } from "@/services/api/baseApi";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    getCurrentLanguage(),
  );

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    store.dispatch(
      baseApi.util.invalidateTags([
        "Event",
        "Profile",
        "EventPost",
        "Category",
        "Chat",
        "Notification",
        "Board",
        "BoardTask",
        "EventNotes",
      ]),
    );
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(key, params, language),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
};
