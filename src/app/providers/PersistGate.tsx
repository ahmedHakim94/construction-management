import { PersistGate as PersistGateComponent } from "redux-persist/integration/react";
import type { Persistor } from "redux-persist";

interface PersistGateProps {
  persistor: Persistor;
  children: React.ReactNode;
}

export function PersistGate({ persistor, children }: PersistGateProps) {
  return <PersistGateComponent persistor={persistor}>{children}</PersistGateComponent>;
}
