import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget, Transaction } from '../types/finance';

export type NewBudget = Omit<Budget, 'id' | 'createdAt'>;
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

const budgetsCol = (uid: string) => collection(db, 'users', uid, 'budgets');
const transactionsCol = (uid: string) => collection(db, 'users', uid, 'transactions');

const toModel = <T>(snap: QueryDocumentSnapshot<DocumentData>): T =>
  ({ id: snap.id, ...snap.data() }) as T;

export function subscribeBudgets(
  uid: string,
  onData: (budgets: Budget[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(budgetsCol(uid), orderBy('startDate', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toModel<Budget>(d))),
    onError,
  );
}

export function subscribeTransactions(
  uid: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(transactionsCol(uid), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toModel<Transaction>(d))),
    onError,
  );
}

export async function createBudget(uid: string, data: NewBudget): Promise<string> {
  const ref = await addDoc(budgetsCol(uid), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateBudget(
  uid: string,
  id: string,
  data: Partial<NewBudget>,
): Promise<void> {
  await updateDoc(doc(budgetsCol(uid), id), data);
}

export async function deleteBudget(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(budgetsCol(uid), id));
}

export async function createTransaction(uid: string, data: NewTransaction): Promise<string> {
  const ref = await addDoc(transactionsCol(uid), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateTransaction(
  uid: string,
  id: string,
  data: Partial<NewTransaction>,
): Promise<void> {
  await updateDoc(doc(transactionsCol(uid), id), data);
}

export async function deleteTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(transactionsCol(uid), id));
}
