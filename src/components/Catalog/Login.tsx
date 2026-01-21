import React, { useRef } from "react";
import { useAuth } from "../../store/AuthContext";

import TerraLoader from "@nasa-terra/components/dist/react/loader";
import TerraLogin from "@nasa-terra/components/dist/react/login";
import TerraButton from "@nasa-terra/components/dist/react/button";

const Login = () => {
  const { login, user, token, logout, isAuthenticated } = useAuth();
  const hydratedRef = useRef(false);

  // Emitted when a bearer token has been received from EDL.
  const myFn = (e: any) => {
    const { user, token, error, isLoading } = e.detail;

    if (isLoading || error || !user) return;
    console.log("BTN worked ", e.detail);

    if (hydratedRef.current) return;
    hydratedRef.current = true;

    login(token, user);
  };

  // console.log("CTX token", token);
  // console.log("CTX user", user);

  // console.log("USER ", user);
  // console.log("TOKEN ", token);

  const logoutHandler = () => {
    hydratedRef.current = false;
    logout();
  };

  return (
    <TerraLogin onTerraLogin={myFn}>
      <TerraLoader
        slot="loading"
        indeterminate
        variant="small"
        style={{ height: "auto" }}
      ></TerraLoader>
      {/* <span slot="logged-in">
                {user?.first_name} You are logged in!
              </span> */}
      <TerraButton
        slot="logged-in"
        variant="text"
        // href={`${EDL_DOMAIN}/logout?redirect_uri=${window.location.href}`}
        onClick={logoutHandler}
      >
        Logout
      </TerraButton>
    </TerraLogin>
  );
};

export default Login;
