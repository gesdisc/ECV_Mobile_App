import { useState, useEffect } from "react";

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
          if (error instanceof Error) setError(error.message);
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

// function useFetch(url) {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(url);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const result = await response.json();
//         setData(result);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [url]); // Re-run effect if URL changes

//   return { data, loading, error };
// }
