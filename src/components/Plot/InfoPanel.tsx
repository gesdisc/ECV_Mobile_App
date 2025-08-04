import React, { useRef } from "react";
import { IonContent, IonItem, IonLabel, IonList, IonModal } from "@ionic/react";

import catalog from "../Catalog/catalog.json";
import { TimeSeriesMetadata } from "../../types/time-series.types";

interface InfoPanelProps {
  metadata: TimeSeriesMetadata;
}

// check if cache has the data between the requested dates
// the system fetches new data if the requested dates
// are available in between previously cached data
const InfoPanel: React.FC<InfoPanelProps> = ({ metadata }) => {
  const dataInfoModal = useRef<HTMLIonModalElement>(null);

  const currentVariableData = catalog.find(
    (data) =>
      data.dataFieldId ===
      `${metadata.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${metadata.param_short_name}`)
  );

  // prettier-ignore
  const dataVariableInfo = [
    { label: "Label", value: currentVariableData?.label },
    { label: "Longname", value: metadata.param_name },
    { label: "Shortname", value: metadata.param_short_name },
    { label: "Units", value: metadata.unit },
    { label: "Fill Value", value: metadata.undef },
    { label: "Mean Value", value: metadata.mean },
    { label: "Lat. Resolution", value: metadata.lat_resolution },
    { label: "Lon. Resolution", value: metadata.lon_resolution },
    { label: "Data Product Name", value: metadata.prod_name },
    { label: "DOI", value: metadata.doi },
  ];

  // prettier-ignore
  const requestInfo = [
    { label: "Timestamp", value: metadata.Request_time },
    { label: "Begin Datetime", value: metadata.begin_time  },
    { label: "End Datetime", value: metadata.end_time },
    { label: "Lat", value: metadata.lat },
    { label: "Lon", value: metadata.lon },
  ];

  const displayRequestInfo = () => {
    return requestInfo.map((item) => {
      return (
        <IonItem key={item.label}>
          <IonLabel>
            <span style={{ fontWeight: "bold" }}>{item.label}: </span>{" "}
            {item.value}
          </IonLabel>
        </IonItem>
      );
    });
  };

  const displayDataVariableInfo = () => {
    return dataVariableInfo.map((item) => {
      return (
        <IonItem key={item.label}>
          <IonLabel>
            <span style={{ fontWeight: "bold" }}>{item.label}: </span>{" "}
            {item.value}
          </IonLabel>
        </IonItem>
      );
    });
  };

  return (
    <IonModal
      ref={dataInfoModal}
      trigger="data-info-modal"
      initialBreakpoint={0.5}
      breakpoints={[0, 1]}
    >
      <IonContent className="ion-padding">
        <IonList>
          <IonItem slot="header" color="primary">
            <IonLabel>Request</IonLabel>
          </IonItem>
          {displayRequestInfo()}
        </IonList>

        <IonList>
          <IonItem slot="header" color="primary">
            <IonLabel>Data Variable</IonLabel>
          </IonItem>
          {displayDataVariableInfo()}
          <IonItem>
            <IonLabel>
              <a
                // href="https://doi.org/10.5067/Aura/OMI/DATA3005"
                href={`https://doi.org/${metadata.doi}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Dataset Information
              </a>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default InfoPanel;
