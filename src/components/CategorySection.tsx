import { useEffect, useState } from 'react';
import CategoryChart from './CategoryChart';
import type { Transaction } from '../types/finance';

interface CategorySectionProps {
  weeklyTransactions: Transaction[];
  monthlyTransactions: Transaction[];
  showWeek: boolean;
}

export default function CategorySection({
  weeklyTransactions,
  monthlyTransactions,
  showWeek,
}: CategorySectionProps) {
  const [range, setRange] = useState<'week' | 'month'>(showWeek ? 'week' : 'month');

  useEffect(() => {
    if (!showWeek) setRange('month');
  }, [showWeek]);

  return (
    <section className="rounded-2xl bg-neutral-900 p-5 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-400">Gastos por categoría</h2>
        <div className="flex rounded-xl bg-neutral-800 p-1 text-xs font-medium">
          {(['week', 'month'] as const).map((option) => (
            <button
              key={option}
              type="button"
              disabled={option === 'week' && !showWeek}
              onClick={() => setRange(option)}
              className={`rounded-lg px-3 py-1.5 disabled:opacity-30 ${
                range === option ? 'bg-white/10 text-white' : 'text-neutral-400'
              }`}
            >
              {option === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      <CategoryChart
        transactions={range === 'week' ? weeklyTransactions : monthlyTransactions}
      />
    </section>
  );
}
