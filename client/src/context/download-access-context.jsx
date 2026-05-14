import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DOWNLOAD_ACCESS_KEY } from "../lib/constants.js";

const DownloadAccessContext = createContext(null);

export function DownloadAccessProvider({ children }) {
  const [accessMap, setAccessMap] = useState(() => {
    const storedValue = window.sessionStorage.getItem(DOWNLOAD_ACCESS_KEY);

    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch {
        window.sessionStorage.removeItem(DOWNLOAD_ACCESS_KEY);
      }
    }

    return {};
  });

  useEffect(() => {
    window.sessionStorage.setItem(DOWNLOAD_ACCESS_KEY, JSON.stringify(accessMap));
  }, [accessMap]);

  const value = useMemo(
    () => ({
      accessMap,
      saveAccess(uuid, payload) {
        setAccessMap((currentMap) => ({
          ...currentMap,
          [uuid]: payload,
        }));
      },
      clearAccess(uuid) {
        setAccessMap((currentMap) => {
          const nextMap = { ...currentMap };
          delete nextMap[uuid];
          return nextMap;
        });
      },
    }),
    [accessMap],
  );

  return (
    <DownloadAccessContext.Provider value={value}>
      {children}
    </DownloadAccessContext.Provider>
  );
}

export function useDownloadAccess() {
  const context = useContext(DownloadAccessContext);

  if (!context) {
    throw new Error("useDownloadAccess must be used inside DownloadAccessProvider.");
  }

  return context;
}
