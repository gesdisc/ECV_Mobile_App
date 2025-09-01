import React from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
// import { Capacitor } from "@capacitor/core";
// import { CapacitorSQLite } from "@capacitor-community/sqlite";
// import { SQLiteConnection } from "@capacitor-community/sqlite";

import { DataParamsProvider } from "./store/DataParamsContext";
import { PlotTypeProvider } from "./store/PlotTypeContext";

import TabMenu from "./navigation/TabMenu";

// const sqlite = new SQLiteConnection(CapacitorSQLite);

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
// import "@nasa-terra/components/dist/themes/light.css"; produces error
import "@nasa-terra/components/dist/themes/horizon.css";

import { setBasePath } from "@nasa-terra/components/dist/utilities/base-path";

setBasePath("https://cdn.jsdelivr.net/npm/@nasa-terra/components@0.0.58/cdn/");

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <PlotTypeProvider>
      <DataParamsProvider>
        <TabMenu />
      </DataParamsProvider>
    </PlotTypeProvider>
  </IonApp>
);

export default App;
