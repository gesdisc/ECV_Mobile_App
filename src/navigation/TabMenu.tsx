import React, { Suspense } from "react";
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

import TerraLoader from "@nasa-terra/components/dist/react/loader";
import DataParamsWatcher from "../store/DataParamsWatcher";

import styles from "./TabMenu.module.css";

const CatalogPage = React.lazy(() => import("../pages/CatalogPage"));
const LocationPage = React.lazy(() => import("../pages/LocationPage"));
const DatePickerPage = React.lazy(() => import("../pages/DatePickerPage"));
const PlotPage = React.lazy(() => import("../pages/PlotPage"));

const TabBar: React.FC = () => (
  <IonReactRouter>
    <DataParamsWatcher />
    <IonTabs>
      <IonRouterOutlet>
        <Suspense
          fallback={
            <div className={styles.suspense}>
              <TerraLoader variant="orbit"></TerraLoader>
            </div>
          }
        >
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
        </Suspense>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" color={"primary"} id="tab-bar">
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

export default TabBar;
