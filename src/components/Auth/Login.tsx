import React, { useRef } from "react";
import { IonContent, IonIcon, IonPopover } from "@ionic/react";
import { caretDownOutline } from "ionicons/icons";

import { useAuth } from "../../store/AuthContext";

import TerraLoader from "@nasa-terra/components/dist/react/loader";
import TerraLogin, {
  TerraLoginEvent,
} from "@nasa-terra/components/dist/react/login";
import TerraButton from "@nasa-terra/components/dist/react/button";

import styles from "./Login.module.css";

const EDL_DOMAIN = "https://uat.urs.earthdata.nasa.gov";

const Login: React.FC = () => {
  const { login, logout, user } = useAuth();
  const hydratedRef = useRef(false);

  // Emitted when a bearer token has been received from EDL.
  const terraLoginHandler = (e: TerraLoginEvent) => {
    const { user, token, error, isLoading } = e.detail;

    if (isLoading || error || !user || !token) return;

    if (hydratedRef.current) return;

    hydratedRef.current = true;

    login(token, user);
  };

  const logoutHandler = () => {
    hydratedRef.current = false;
    logout();
  };

  return (
    <>
      <TerraLogin onTerraLogin={terraLoginHandler} buttonLabel="Login">
        <TerraLoader
          slot="loading"
          indeterminate
          variant="small"
          style={{ height: "auto" }}
        ></TerraLoader>
        <TerraButton
          slot="logged-in"
          variant="text"
          id="popover-button"
          className={styles.logout}
        >
          {user?.uid}
          <IonIcon slot="suffix" icon={caretDownOutline} size="small"></IonIcon>
        </TerraButton>
      </TerraLogin>

      <IonPopover
        trigger="popover-button"
        dismissOnSelect={true}
        arrow={true}
        className={styles.popover}
      >
        <IonContent class="ion-padding">
          <TerraButton
            variant="primary"
            href={`${EDL_DOMAIN}/logout?redirect_uri=${window.location.href}`}
            onClick={logoutHandler}
          >
            Logout
          </TerraButton>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default Login;
