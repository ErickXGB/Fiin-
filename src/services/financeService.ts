import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { adjustAccountBalance } from './accountService';
import type { Budget, Transaction } from '../types/finance';

export type NewBudget = Omit<Budget, 'id' | 'createdAt'>;
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

const budgetsCol = (uid: string) => collection(db, 'users', uid, 'budgets');
const transactionsCol = (uid: string) => collection(db, 'users', uid, 'transactions');
const accountsCol = (uid: string) => collection(db, 'users', uid, 'accounts');

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
  const createdAt = Date.now();
  if (data.type === 'transfer') {
    if (!data.accountId || !data.toAccountId || data.accountId === data.toAccountId) {
      throw new Error('Transferencia inválida');
    }
    const batch = writeBatch(db);
    const ref = doc(transactionsCol(uid));
    batch.set(ref, { ...data, createdAt });
    batch.update(doc(accountsCol(uid), data.accountId), { balance: increment(-data.amount) });
    batch.update(doc(accountsCol(uid), data.toAccountId), { balance: increment(data.amount) });
    await batch.commit();
    return ref.id;
  }
  const ref = await addDoc(transactionsCol(uid), { ...data, createdAt });
  if (data.accountId) {
    const delta = data.type === 'income' ? data.amount : -data.amount;
    await adjustAccountBalance(uid, data.accountId, delta);
  }
  return ref.id;
}

export async function updateTransaction(
  uid: string,
  id: string,
  data: Partial<NewTransaction>,
): Promise<void> {
  await updateDoc(doc(transactionsCol(uid), id), data);
}

type TransactionSnapshot = Pick<
  Transaction,
  'accountId' | 'toAccountId' | 'type' | 'amount'
>;

export async function deleteTransaction(
  uid: string,
  id: string,
  tx?: TransactionSnapshot,
): Promise<void> {
  const ref = doc(transactionsCol(uid), id);
  const details = tx ?? ((await getDoc(ref)).data() as TransactionSnapshot | undefined);
  if (details?.type === 'transfer' && details.accountId && details.toAccountId) {
    const batch = writeBatch(db);
    batch.delete(ref);
    batch.update(doc(accountsCol(uid), details.accountId), {
      balance: increment(details.amount),
    });
    batch.update(doc(accountsCol(uid), details.toAccountId), {
      balance: increment(-details.amount),
    });
    await batch.commit();
    return;
  }
  await deleteDoc(ref);
  if (details?.accountId) {
    const delta = details.type === 'income' ? -details.amount : details.amount;
    await adjustAccountBalance(uid, details.accountId, delta);
  }
}
