import { Button } from "antd";
import { useI18n } from "@/i18n/I18nProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Button
        type={language === "ru" ? "primary" : "default"}
        size="small"
        onClick={() => setLanguage("ru")}
      >
        RU
      </Button>
      <Button
        type={language === "en" ? "primary" : "default"}
        size="small"
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
    </div>
  );
}
