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

import { TabMenuLabels } from "../constants/time-series";

import CatalogPage from "../pages/CatalogPage";
import LocationPage from "../pages/LocationPage";
import VisualsPage from "../pages/VisualsPage";

const TabMenu: React.FC = () => (
  <IonReactRouter>
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={`/${TabMenuLabels.Catalog}`}>
          <CatalogPage />
        </Route>
        <Route exact path={`/${TabMenuLabels.Location}`}>
          <LocationPage />
        </Route>
        <Route exact path={`/${TabMenuLabels.Date}`}>
          {/* <Date /> */}
        </Route>
        <Route exact path={`/${TabMenuLabels.Visuals}`}>
          <VisualsPage />
        </Route>
        <Route exact path="/">
          <Redirect to={`/${TabMenuLabels.Catalog}`} />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          tab={TabMenuLabels.Catalog}
          href={`/${TabMenuLabels.Catalog}`}
        >
          <IonIcon aria-hidden="true" icon={rainyOutline} />
          <IonLabel>{TabMenuLabels.Catalog}</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab={TabMenuLabels.Location}
          href={`/${TabMenuLabels.Location}`}
        >
          <IonIcon aria-hidden="true" icon={globeOutline} />
          <IonLabel>{TabMenuLabels.Location}</IonLabel>
        </IonTabButton>
        <IonTabButton tab={TabMenuLabels.Date} href={`/${TabMenuLabels.Date}`}>
          <IonIcon aria-hidden="true" icon={calendarOutline} />
          <IonLabel>{TabMenuLabels.Date}</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab={TabMenuLabels.Visuals}
          href={`/${TabMenuLabels.Visuals}`}
        >
          <IonIcon aria-hidden="true" icon={analyticsOutline} />
          <IonLabel>{TabMenuLabels.Visuals}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>
);

export default TabMenu;
