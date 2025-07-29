import React, { useRef } from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { informationCircle } from "ionicons/icons";

import { TimeSeriesMetadata } from "../../types/time-series.types";

interface InfoPanelProps {
  metadata: TimeSeriesMetadata;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ metadata }) => {
  const dataInfoModal = useRef<HTMLIonModalElement>(null);
  return (
    <>
      <IonButton size="default" id="data-info-modal">
        <IonIcon aria-hidden="true" size="medium" icon={informationCircle} />
      </IonButton>

      <IonModal
        ref={dataInfoModal}
        trigger="data-info-modal"
        initialBreakpoint={0.25}
        breakpoints={[0, 1]}
      >
        <div className="block ion-padding">
          <p>Variable Longname: {metadata.param_name}</p>
          <p>Variable Shortname: {metadata.param_short_name}</p>
          <p>Units: {metadata.unit}</p>
          <a
            // href="https://doi.org/10.5067/Aura/OMI/DATA3005"
            href={`https://doi.org/${metadata.doi}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Dataset Information
          </a>
        </div>
      </IonModal>
    </>
  );
};

export default InfoPanel;

// check if cache has the data between the requested dates
// the system fetches new data if the requested dates
// are available in between previously cached data
