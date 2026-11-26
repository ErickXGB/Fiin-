export type TransactionType = 'expense' | 'income' | 'transfer';

export type BudgetPeriod = 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

export interface Budget {
  id: string;
  period: BudgetPeriod;
  limitAmount: number;
  /** Lunes de la semana o día 1 del mes, en formato YYYY-MM-DD. */
  startDate: string;
  categoryLimits?: Record<string, number>;
  createdAt?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  balance: number;
  color?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  /** Fecha local en formato YYYY-MM-DD. */
  date: string;
  note: string;
  accountId?: string;
  /** Cuenta destino (solo transferencias). */
  toAccountId?: string;
  createdAt?: number;
}
