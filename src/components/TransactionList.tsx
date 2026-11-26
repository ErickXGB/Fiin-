import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { Account, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'expense', label: 'Gastos' },
  { id: 'income', label: 'Ingresos' },
  { id: 'transfer', label: 'Transferencias' },
] as const;

type Filter = (typeof FILTERS)[number]['id'];

interface TransactionListProps {
  transactions: Transaction[];
  accounts?: Account[];
  onRemove: (id: string, tx?: Transaction) => Promise<void>;
}

export default function TransactionList({ transactions, accounts = [], onRemove }: TransactionListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const visible = transactions.filter((tx) => filter === 'all' || tx.type === filter);

  return (
    <div className="mt-3">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 text-xs font-medium dark:bg-zinc-800">
        {FILTERS.map((opt) => (
          <button key={opt.id} type="button" onClick={() => setFilter(opt.id)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 ${filter === opt.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Sin movimientos para este filtro.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {visible.map((tx) => {
            const isTransfer = tx.type === 'transfer';
            const from = tx.accountId ? accMap[tx.accountId] : '';
            const to = tx.toAccountId ? accMap[tx.toAccountId] : '';
            return (
              <li key={tx.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isTransfer ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {isTransfer ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ArrowLeftRight size={14} className="shrink-0" />
                        {from || 'Cuenta'} → {to || 'Cuenta'}
                      </span>
                    ) : (
                      <>{tx.category}{tx.note ? ` · ${tx.note}` : ''}</>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tx.date}
                    {tx.note && isTransfer ? ` · ${tx.note}` : ''}
                    {!isTransfer && tx.accountId && accMap[tx.accountId] ? ` · ${accMap[tx.accountId]}` : ''}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${isTransfer ? 'text-blue-600 dark:text-blue-400' : tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {isTransfer ? '' : tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <button type="button" onClick={() => void onRemove(tx.id, tx)}
                  aria-label={`Eliminar ${tx.category}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-zinc-400 hover:text-red-500 active:bg-zinc-100 dark:text-zinc-500 dark:hover:text-red-400 dark:active:bg-zinc-800">
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
