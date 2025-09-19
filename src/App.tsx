import React from "react";
import { IonApp, setupIonicReact } from "@ionic/react";

import { DataParamsProvider } from "./store/DataParamsContext";
import { PlotTypeProvider } from "./store/PlotTypeContext";
import { NetworkProvider } from "./store/NetworkContext";
import { ToastProvider } from "./store/ToastContext";

import AppContent from "./components/AppContent";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./styles.css";

/* Terra Styles */
// import "@nasa-terra/components/dist/themes/light.css";
import "@nasa-terra/components/dist/themes/horizon.css";

import { setBasePath } from "@nasa-terra/components/dist/utilities/base-path";

setBasePath("https://cdn.jsdelivr.net/npm/@nasa-terra/components@0.0.58/cdn/");

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <ToastProvider>
        <NetworkProvider>
          <PlotTypeProvider>
            <DataParamsProvider>
              <AppContent />
            </DataParamsProvider>
          </PlotTypeProvider>
        </NetworkProvider>
      </ToastProvider>
    </IonApp>
  );
};

export default App;
