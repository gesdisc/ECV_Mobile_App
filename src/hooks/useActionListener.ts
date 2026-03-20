import { useEffect } from "react";
import { ActionType, useDataParams } from "../store/DataParamsContext";

/**
 * Subscribes to DataParams action events.
 *
 * This hook listens ONLY while the component is mounted.
 * No past events are replayed.
 *
 */
export const useActionListener = (
  actionType: ActionType,
  handler: () => void
) => {
  const { subscribeToAction } = useDataParams();

  useEffect(() => {
    const unsubscribe = subscribeToAction((action) => {
      if (action === actionType) {
        handler();
      }
    });

    return unsubscribe;
  }, [subscribeToAction, actionType, handler]);
};
