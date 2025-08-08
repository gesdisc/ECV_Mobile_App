import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";

import {
  globeOutline,
  rainyOutline,
  analyticsOutline,
  calendarOutline,
} from "ionicons/icons";

import { TabMenuLabels } from "../constants/ui";

import CatalogPage from "../pages/CatalogPage";
import LocationPage from "../pages/LocationPage";
import PlotPage from "../pages/PlotPage";
import DatePickerPage from "../pages/DatePickerPage";

const TabMenu: React.FC = () => (
  <IonReactRouter>
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={`/${TabMenuLabels.CATALOG}`}>
          <CatalogPage />
        </Route>
        <Route exact path={`/${TabMenuLabels.LOCATION}`}>
          <LocationPage />
        </Route>
        <Route exact path={`/${TabMenuLabels.DATE}`}>
          <DatePickerPage />
        </Route>
        <Route exact path={`/${TabMenuLabels.PLOT}`}>
          <PlotPage />
        </Route>
        <Route exact path="/">
          <Redirect to={`/${TabMenuLabels.CATALOG}`} />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          tab={TabMenuLabels.CATALOG}
          href={`/${TabMenuLabels.CATALOG}`}
        >
          <IonIcon aria-hidden="true" icon={rainyOutline} />
          <IonLabel>{TabMenuLabels.CATALOG}</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab={TabMenuLabels.LOCATION}
          href={`/${TabMenuLabels.LOCATION}`}
        >
          <IonIcon aria-hidden="true" icon={globeOutline} />
          <IonLabel>{TabMenuLabels.LOCATION}</IonLabel>
        </IonTabButton>
        <IonTabButton tab={TabMenuLabels.DATE} href={`/${TabMenuLabels.DATE}`}>
          <IonIcon aria-hidden="true" icon={calendarOutline} />
          <IonLabel>{TabMenuLabels.DATE}</IonLabel>
        </IonTabButton>
        <IonTabButton tab={TabMenuLabels.PLOT} href={`/${TabMenuLabels.PLOT}`}>
          <IonIcon aria-hidden="true" icon={analyticsOutline} />
          <IonLabel>{TabMenuLabels.PLOT}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>
);

export default TabMenu;
