import { collection, limit, onSnapshot, query, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeSyncState(
  uid: string,
  onChange: (fromCache: boolean) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'users', uid, 'transactions'), limit(1)),
    { includeMetadataChanges: true },
    (snapshot) => onChange(snapshot.metadata.fromCache),
    () => onChange(true),
  );
}
