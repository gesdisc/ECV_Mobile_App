import React, { useRef } from "react";
import { TOKEN_KEY, useAuth } from "../../store/AuthContext";

import TerraLoader from "@nasa-terra/components/dist/react/loader";
import TerraLogin from "@nasa-terra/components/dist/react/login";
import TerraButton from "@nasa-terra/components/dist/react/button";

const EDL_DOMAIN = "https://uat.urs.earthdata.nasa.gov";

const Login: React.FC = () => {
  const { login, logout } = useAuth();
  const hydratedRef = useRef(false);

  // Emitted when a bearer token has been received from EDL.
  const terraLoginHandler = (e: any) => {
    const { user, token, error, isLoading } = e.detail;

    if (isLoading || error || !user) return;

    if (hydratedRef.current) return;

    hydratedRef.current = true;

    if (localStorage.getItem(TOKEN_KEY)) return;
    login(token, user);
  };

  const logoutHandler = () => {
    hydratedRef.current = false;
    logout();
  };

  return (
    <TerraLogin onTerraLogin={terraLoginHandler}>
      <TerraLoader
        slot="loading"
        indeterminate
        variant="small"
        style={{ height: "auto" }}
      ></TerraLoader>
      <TerraButton
        slot="logged-in"
        variant="text"
        href={`${EDL_DOMAIN}/logout?redirect_uri=${window.location.href}`}
        onClick={logoutHandler}
      >
        Logout
      </TerraButton>
    </TerraLogin>
  );
};

export default Login;
