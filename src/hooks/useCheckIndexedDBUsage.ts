import { useState, useEffect } from "react";

/**
 *
 * @returns object with totalSpace, usedSpace, error
 * @summary Checks borswer's storage total allocated space & used space
 */
const useCheckIndexedDBUsage = () => {
  const [totalSpace, setTotalSpace] = useState<null | number>(null);
  const [usedSpace, setUsedSpace] = useState<null | number>(null);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const checkIndexedDBUsage = async () => {
      setTotalSpace(null);
      setUsedSpace(null);
      setError(null);

      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const quota = await navigator.storage.estimate();
          const totalSpace = quota.quota; // Total allocated space for the origin (in bytes)
          const usedSpace = quota.usage; // Used space by the origin (in bytes)

          if (usedSpace !== undefined && totalSpace !== undefined) {
            setTotalSpace(totalSpace / (1024 * 1024)); // convert to MB
            setUsedSpace(usedSpace / (1024 * 1024)); // convert to MB
          }
        } catch (error) {
          if (error instanceof Error) {
            error.name === "QuotaExceededError"
              ? setError("IndexedDB storage limit reached!")
              : setError(`"IndexedDB error: ${error.message}`);
            // Implement logic to handle the limit
          }
        }
      } else {
        console.warn("Storage Estimation API not supported in this browser.");
      }
    };

    checkIndexedDBUsage();
  }, []);

  return {
    totalSpace,
    usedSpace,
    error,
  };
};

export default useCheckIndexedDBUsage;
