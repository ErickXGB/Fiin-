import type { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

interface TransactionListProps {
  transactions: Transaction[];
  onRemove: (id: string) => Promise<void>;
}

export default function TransactionList({ transactions, onRemove }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Sin movimientos aún.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {tx.category}
              {tx.note ? ` · ${tx.note}` : ''}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.date}</p>
          </div>
          <span
            className={
              tx.type === 'income'
                ? 'text-sm font-semibold text-emerald-600 dark:text-emerald-400'
                : 'text-sm font-semibold text-red-500 dark:text-red-400'
            }
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </span>
          <button
            type="button"
            onClick={() => void onRemove(tx.id)}
            aria-label={`Eliminar ${tx.category}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-zinc-400 hover:text-red-500 active:bg-zinc-100 dark:text-zinc-500 dark:hover:text-red-400 dark:active:bg-zinc-800"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
