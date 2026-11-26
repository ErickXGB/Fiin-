import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Account } from '../types/finance';

export type NewAccount = Omit<Account, 'id'>;

const accountsCol = (uid: string) => collection(db, 'users', uid, 'accounts');

const toModel = <T>(snap: QueryDocumentSnapshot<DocumentData>): T =>
  ({ id: snap.id, ...snap.data() }) as T;

export function subscribeAccounts(
  uid: string,
  onData: (accounts: Account[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(accountsCol(uid), orderBy('name'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toModel<Account>(d))),
    onError,
  );
}

export async function ensureDefaultAccount(uid: string): Promise<void> {
  const snap = await getDocs(accountsCol(uid));
  if (snap.empty) {
    await addDoc(accountsCol(uid), { name: 'Efectivo', type: 'cash', balance: 0 });
  }
}

export async function createAccount(uid: string, data: NewAccount): Promise<string> {
  const ref = await addDoc(accountsCol(uid), data);
  return ref.id;
}

export async function updateAccount(uid: string, id: string, data: Partial<NewAccount>): Promise<void> {
  await updateDoc(doc(accountsCol(uid), id), data as Record<string, unknown>);
}

export async function deleteAccount(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(accountsCol(uid), id));
}

export async function adjustAccountBalance(
  uid: string,
  accountId: string,
  delta: number,
): Promise<void> {
  await updateDoc(doc(accountsCol(uid), accountId), { balance: increment(delta) });
}
