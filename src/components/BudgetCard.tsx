import { useState } from 'react';
import type { PeriodStats } from '../hooks/useFinance';
import type { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

const EXPENSE_CATS = ['Comida', 'Transporte', 'Hogar', 'Ocio', 'Salud', 'Otros'];

interface BudgetCardProps {
  title: 'Presupuesto Semanal' | 'Presupuesto Mensual';
  stats: PeriodStats;
  transactions: Transaction[];
  categoryLimits?: Record<string, number>;
  onEditLimit: () => void;
}

function CatBar({ name, spent, limit }: { name: string; spent: number; limit: number }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over = limit > 0 && spent > limit;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600 dark:text-zinc-400">{name}</span>
        <span className={over ? 'font-medium text-red-500' : 'text-zinc-500 dark:text-zinc-400'}>
          {formatCurrency(spent)}{limit > 0 ? ` / ${formatCurrency(limit)}` : ''}
        </span>
      </div>
      {limit > 0 && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BudgetCard({ title, stats, transactions, categoryLimits = {}, onEditLimit }: BudgetCardProps) {
  const [open, setOpen] = useState(false);
  const barColor = stats.isOver ? 'bg-red-500' : stats.isWarning ? 'bg-amber-400' : 'bg-emerald-500';
  const width = Math.min(Math.max(stats.percentage, 0), 100);

  const catSpent = EXPENSE_CATS.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = transactions
      .filter((tx) => tx.type === 'expense' && tx.category === cat)
      .reduce((s, tx) => s + tx.amount, 0);
    return acc;
  }, {});

  const assignedTotal = EXPENSE_CATS.reduce((s, c) => s + (categoryLimits[c] ?? 0), 0);
  const restSpent = transactions
    .filter((tx) => tx.type === 'expense' && !categoryLimits[tx.category])
    .reduce((s, tx) => s + tx.amount, 0);
  const restLimit = Math.max(stats.limit - assignedTotal, 0);

  const hasLimits = Object.keys(categoryLimits).length > 0;

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
        <button type="button" onClick={onEditLimit}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-700">
          Editar
        </button>
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${width}%` }} />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
        <span className={stats.isOver ? 'font-medium text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}>
          {Math.round(stats.percentage)}% usado
        </span>
        <span className={stats.remaining < 0 ? 'font-medium text-red-500 dark:text-red-400' : 'font-medium text-emerald-600 dark:text-emerald-400'}>
          {stats.remaining < 0 ? 'Excedido ' : 'Disponible '}{formatCurrency(Math.abs(stats.remaining))}
        </span>
      </div>

      {stats.spent > 0 && (
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          {open ? '▲ Ocultar detalle' : '▼ Ver detalle'}
        </button>
      )}

      {open && (
        <div className="mt-2 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {EXPENSE_CATS.filter((c) => catSpent[c] > 0 || categoryLimits[c]).map((cat) => (
            <CatBar key={cat} name={cat} spent={catSpent[cat] ?? 0} limit={categoryLimits[cat] ?? 0} />
          ))}
          {(!hasLimits || restLimit > 0 || restSpent > 0) && restSpent > 0 && (
            <CatBar name="Resto del presupuesto" spent={restSpent} limit={restLimit} />
          )}
        </div>
      )}
    </section>
  );
}
