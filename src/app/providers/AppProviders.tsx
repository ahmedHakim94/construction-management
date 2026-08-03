import { Provider } from "react-redux";
import { PersistGate } from "@/app/providers/PersistGate";
import { store, persistor } from "@/app/store/store";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </Provider>
  );
}
