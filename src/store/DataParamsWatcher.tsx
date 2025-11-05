import React from "react";
import { useHistory } from "react-router";
import isEmpty from "lodash/isEmpty";

import { TabMenuLabels } from "../constants/ui";
import { useDataParams } from "./DataParamsContext";
import { DefaultParams } from "../constants/time-series";

import { IonToast } from "@ionic/react";

const DataParamsWatcher: React.FC = () => {
  const {
    staged,
    metadata,
    params: ctxParams,
    updateParams,
    cancelRequest,
  } = useDataParams();
  const history = useHistory();

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
      isOpen={!isEmpty(staged)}
      message={
        !isEmpty(metadata)
          ? "Parameters have been modified."
          : `Do you want to plot "${DefaultParams.VARIABLE}"?`
      }
      color={"primary"}
      position={"bottom"}
      buttons={buttons}
      positionAnchor="tab-bar"
    />
  );
};

export default DataParamsWatcher;
