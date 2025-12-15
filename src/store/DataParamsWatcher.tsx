import React from "react";
import { useHistory, useLocation } from "react-router";
import { IonToast } from "@ionic/react";
import isEmpty from "lodash/isEmpty";

import { TabMenuLabels } from "../constants/ui";
import { useDataParams } from "./DataParamsContext";
import { DefaultParams } from "../constants/time-series";

import catalog from "../components/Catalog/catalog.json";

const DataParamsWatcher: React.FC = () => {
  const {
    staged,
    metadata,
    params: ctxParams,
    updateParams,
    cancelRequest,
  } = useDataParams();
  const history = useHistory();
  const location = useLocation();

  const variableDetails = catalog.find(
    (data) => data.dataFieldId === DefaultParams.VARIABLE
  );

  // default position anchor: "tab-bar"
  // Toast position anchor should change on location page
  const anchor = () =>
    location.pathname === `/${TabMenuLabels.LOCATION}`
      ? "location-footer"
      : "tab-bar";

  const buttons = [
    {
      text: !isEmpty(metadata) ? "Update Plot" : "Plot",
      role: "confirm",
      handler: () => {
        updateParams({
          ...staged,
          variable: ctxParams.variable
            ? ctxParams.variable
            : DefaultParams.VARIABLE,
        });
        history.push(`/${TabMenuLabels.PLOT}`);
      },
    },
    {
      text: "Cancel",
      role: "cancel",
      handler: () => cancelRequest(),
    },
  ];

  return (
    <IonToast
      key={anchor()}
      isOpen={!isEmpty(staged)}
      message={
        !isEmpty(metadata)
          ? "Parameters have been modified."
          : `Do you want to plot "${variableDetails?.label}"?`
      }
      color={"primary"}
      position={"bottom"}
      buttons={buttons}
      positionAnchor={anchor()}
    />
  );
};

export default DataParamsWatcher;
