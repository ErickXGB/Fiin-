import type { PeriodStats } from '../hooks/useFinance';
import { formatCurrency } from '../utils/dateUtils';

interface BudgetCardProps {
  title: 'Presupuesto Semanal' | 'Presupuesto Mensual';
  stats: PeriodStats;
  onEditLimit: () => void;
}

export default function BudgetCard({ title, stats, onEditLimit }: BudgetCardProps) {
  const barColor = stats.isOver
    ? 'bg-red-500'
    : stats.isWarning
      ? 'bg-amber-400'
      : 'bg-emerald-500';
  const width = Math.min(Math.max(stats.percentage, 0), 100);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h2>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(stats.spent)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">de {formatCurrency(stats.limit)}</p>
        </div>
        <button
          type="button"
          onClick={onEditLimit}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-700"
        >
          Editar
        </button>
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
        <span className={stats.isOver ? 'font-medium text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}>
          {Math.round(stats.percentage)}% usado
        </span>
        <span
          className={
            stats.remaining < 0
              ? 'font-medium text-red-500 dark:text-red-400'
              : 'font-medium text-emerald-600 dark:text-emerald-400'
          }
        >
          {stats.remaining < 0 ? 'Excedido ' : 'Disponible '}
          {formatCurrency(Math.abs(stats.remaining))}
        </span>
      </div>
    </section>
  );
}
