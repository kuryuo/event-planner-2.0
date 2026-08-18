import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { applyThemeFromStorage } from "@/hooks/ui/useTheme.ts";
import "./index.css";
import "./styles/antd-components.scss";
import App from "./App.tsx";
import { store } from "./store/store";
import { ToastProvider } from "@/components/toast/ToastProvider.tsx";
import { AntdAppProvider } from "@/providers/AntdAppProvider.tsx";
import { IS_MOCK_MODE } from "@/config/runtime";
import { I18nProvider } from "@/i18n/I18nProvider";

const enableMocking = async () => {
  if (!IS_MOCK_MODE) {
    return;
  }

  const { worker } = await import("./mocks/browser");

  await worker.start({
    onUnhandledRequest: "bypass",
  });
};

const startApplication = async () => {
  await enableMocking();
  applyThemeFromStorage();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <I18nProvider>
        <Provider store={store}>
          <AntdAppProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AntdAppProvider>
        </Provider>
      </I18nProvider>
    </React.StrictMode>
  );
};

void startApplication();
