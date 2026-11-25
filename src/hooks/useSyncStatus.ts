import { useEffect, useState } from 'react';
import { subscribeSyncState } from '../services/syncService';

export function useSyncStatus(uid: string | null) {
  const [fromCache, setFromCache] = useState(true);
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!uid) {
      setFromCache(true);
      return;
    }
    return subscribeSyncState(uid, setFromCache);
  }, [uid]);

  return { online, fromCache };
}
