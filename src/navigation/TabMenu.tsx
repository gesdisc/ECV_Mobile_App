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
  // calendarOutline,
} from "ionicons/icons";

import { TabMenuLabels } from "../constants/ui";

import CatalogPage from "../pages/CatalogPage";
import LocationPage from "../pages/LocationPage";
import VisualsPage from "../pages/VisualsPage";

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
        {/* <Route exact path={`/${TabMenuLabels.Date}`}>
          <Date />
        </Route> */}
        <Route exact path={`/${TabMenuLabels.VISUALS}`}>
          <VisualsPage />
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
        {/* <IonTabButton tab={TabMenuLabels.Date} href={`/${TabMenuLabels.Date}`}>
          <IonIcon aria-hidden="true" icon={calendarOutline} />
          <IonLabel>{TabMenuLabels.Date}</IonLabel>
        </IonTabButton> */}
        <IonTabButton
          tab={TabMenuLabels.VISUALS}
          href={`/${TabMenuLabels.VISUALS}`}
        >
          <IonIcon aria-hidden="true" icon={analyticsOutline} />
          <IonLabel>{TabMenuLabels.VISUALS}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>
);

export default TabMenu;
