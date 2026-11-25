import { formatCurrency } from '../utils/dateUtils';

interface BalanceCardProps {
  income: number;
  expenses: number;
  balance: number;
}

export default function BalanceCard({ income, expenses, balance }: BalanceCardProps) {
  const positive = balance >= 0;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Balance del mes</h2>
        <span
          className={
            positive
              ? 'text-lg font-semibold text-emerald-600 dark:text-emerald-400'
              : 'text-lg font-semibold text-red-500 dark:text-red-400'
          }
        >
          {positive ? '+' : '-'}
          {formatCurrency(Math.abs(balance))}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800/60">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Ingresos</p>
          <p className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(income)}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800/60">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gastos</p>
          <p className="mt-1 text-base font-semibold text-red-500 dark:text-red-400">
            {formatCurrency(expenses)}
          </p>
        </div>
      </div>
    </section>
  );
}
