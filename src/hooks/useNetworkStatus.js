import { useState, useEffect } from 'react';

/**
 * useNetworkStatus
 * Returns { isOnline } — true when browser has network access.
 * Listens to 'online' / 'offline' window events.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { isOnline };
};
