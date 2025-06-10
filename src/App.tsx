import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { SQLiteConnection } from "@capacitor-community/sqlite";

import {
  mapOutline,
  globeOutline,
  rainyOutline,
  analyticsOutline,
} from "ionicons/icons";

import { LocationProvider } from "./UpdateLocation";

// import CatalogPage from "./pages/CatalogPage";
// import LocationPage from "./pages/LocationPage";
// import PlotPage from "./pages/PlotPage";
import Catalog from "./components/Catalog/Catalog";
import Location from "./components/Location/Location";
import Visuals from "./components/Visuals/Visuals";

const sqlite = new SQLiteConnection(CapacitorSQLite);

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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <LocationProvider>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/Catalog">
              <Catalog />
            </Route>
            <Route exact path="/Location">
              <Location />
            </Route>
            <Route exact path="/Visuals">
              <Visuals />
            </Route>
            <Route exact path="/">
              <Redirect to="/Catalog" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="Catalog" href="/Catalog">
              <IonIcon aria-hidden="true" icon={rainyOutline} />
              <IonLabel>Catalog</IonLabel>
            </IonTabButton>
            <IonTabButton tab="Location" href="/Location">
              <IonIcon aria-hidden="true" icon={globeOutline} />
              <IonLabel>Location</IonLabel>
            </IonTabButton>
            <IonTabButton tab="Visuals" href="/Visuals">
              <IonIcon aria-hidden="true" icon={analyticsOutline} />
              <IonLabel>Visuals</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </LocationProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
