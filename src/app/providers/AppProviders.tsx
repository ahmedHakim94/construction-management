import { Provider } from "react-redux";
import { PersistGate } from "@/app/providers/PersistGate";
import { store, persistor } from "@/app/store/store";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {

  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
        <ToastContainer
          rtl={i18n.language === "ar"}
          position={isArabic ? "top-right" : "top-left"}
        />
      </PersistGate>
    </Provider>
  );
}
