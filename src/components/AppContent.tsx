import React, { useEffect } from "react";
import { cloudOfflineOutline } from "ionicons/icons";
import { useNetwork } from "../store/NetworkContext";
import { useToast } from "../store/ToastContext";

import TabMenu from "../navigation/TabMenu";

const AppContent = () => {
  const { isOnline } = useNetwork();
  const { showToast } = useToast();

  useEffect(() => {
    showToast({
      isOpen: !isOnline,
      message: "You are offline!",
      color: "warning",
      duration: 5000,
      icon: cloudOfflineOutline,
      buttons: [
        {
          text: "Dismiss",
          role: "cancel",
        },
      ],
    });
  }, [isOnline]);

  return <TabMenu />;
};

export default AppContent;
