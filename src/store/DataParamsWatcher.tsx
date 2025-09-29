import React from "react";
import { useHistory } from "react-router";

import { TabMenuLabels } from "../constants/ui";
import { useDataParams } from "./DataParamsContext";
import { IonToast } from "@ionic/react";

function isEmpty(obj: Record<string, any>) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

// “logic-only” component
const DataParamsWatcher: React.FC = () => {
  const { staged, updateParams, cancelRequest } = useDataParams();
  const history = useHistory();

  const buttons = [
    {
      text: "Update Plot",
      role: "confirm",
      handler: () => {
        updateParams(staged);
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
      message={"Parameters have been modified."}
      color={"primary"}
      position={"bottom"}
      buttons={buttons}
      positionAnchor="tab-bar"
    />
  );
};

export default DataParamsWatcher;
