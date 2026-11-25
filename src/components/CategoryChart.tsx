import type { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#64748b',
];

interface CategoryChartProps {
  transactions: Transaction[];
  type?: 'expense' | 'income';
}

export default function CategoryChart({ transactions, type = 'expense' }: CategoryChartProps) {
  const filtered = transactions.filter((tx) => tx.type === type);
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const groups = Object.values(
    filtered.reduce<Record<string, { category: string; amount: number }>>((acc, tx) => {
      acc[tx.category] = acc[tx.category] ?? { category: tx.category, amount: 0 };
      acc[tx.category].amount += tx.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b.amount - a.amount);

  if (groups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Sin {type === 'expense' ? 'gastos' : 'ingresos'} en este periodo.
      </p>
    );
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="mt-4 flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="16" className="text-zinc-200 dark:text-zinc-800" />
        <g transform="rotate(-90 60 60)">
          {groups.map((group, index) => {
            const dash = (group.amount / total) * circumference;
            const slice = (
              <circle
                key={group.category}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return slice;
          })}
        </g>
        <text x="60" y="63" textAnchor="middle" className="fill-zinc-900 text-[10px] font-semibold dark:fill-zinc-100">
          {formatCurrency(total)}
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-2">
        {groups.map((group, index) => (
          <li key={group.category} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{group.category}</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(group.amount)}</span>
            <span className="w-8 text-right text-zinc-500 dark:text-zinc-400">
              {Math.round((group.amount / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
