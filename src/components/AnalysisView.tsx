import { useMemo, useState } from 'react';
import CategoryChart from './CategoryChart';
import TransactionList from './TransactionList';
import type { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

type Filter = 'all' | 'expense' | 'income';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'expense', label: 'Gastos' }, { id: 'income', label: 'Ingresos' },
];

const formatMonth = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

interface AnalysisViewProps {
  transactions: Transaction[];
  annualTransactions?: Transaction[];
  year?: number;
  onRemove: (id: string) => Promise<void>;
}

export default function AnalysisView({
  transactions, annualTransactions = [], year = new Date().getFullYear(), onRemove,
}: AnalysisViewProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [annualOpen, setAnnualOpen] = useState(false);
  const [annualType, setAnnualType] = useState<'expense' | 'income'>('expense');

  const visible = transactions.filter((tx) => filter === 'all' || tx.type === filter);
  const annTxs = annualTransactions.length > 0 ? annualTransactions : transactions;
  const annIncome = annTxs.reduce((sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum), 0);
  const annExpense = annTxs.reduce((sum, tx) => (tx.type === 'expense' ? sum + tx.amount : sum), 0);
  const annBalance = annIncome - annExpense;

  const monthlyBreakdown = useMemo(() => {
    const map = new Map<string, { inc: number; exp: number }>();
    for (const tx of annTxs) {
      const k = tx.date.slice(0, 7), cur = map.get(k) ?? { inc: 0, exp: 0 };
      if (tx.type === 'income') cur.inc += tx.amount; else cur.exp += tx.amount;
      map.set(k, cur);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([k, v]) => ({ key: k, label: formatMonth(k), income: v.inc, expense: v.exp, balance: v.inc - v.exp }));
  }, [annTxs]);

  const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';

  return (
    <div className="space-y-4">
      <section className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Gastos del mes por categoría</h2>
        <CategoryChart transactions={visible} type="expense" />
      </section>

      <section className={cardCls}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Movimientos</h2>
          <div className="flex rounded-xl bg-zinc-100 p-1 text-xs font-medium dark:bg-zinc-800">
            {FILTERS.map((opt) => (
              <button key={opt.id} type="button" onClick={() => setFilter(opt.id)}
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  filter === opt.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <TransactionList transactions={visible} onRemove={onRemove} />
      </section>

      <section className={cardCls}>
        <button type="button" onClick={() => setAnnualOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left">
          <div>
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Balance Anual ({year})</h2>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(annIncome)}</span>
              <span className="font-semibold text-red-500 dark:text-red-400">-{formatCurrency(annExpense)}</span>
              <span className={`font-semibold ${annBalance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500 dark:text-red-400'}`}>
                Neto: {formatCurrency(annBalance)}
              </span>
            </div>
          </div>
          <span className="text-sm text-zinc-400">{annualOpen ? '▲' : '▼'}</span>
        </button>

        {annualOpen && (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="flex rounded-xl bg-zinc-100 p-1 text-xs font-medium dark:bg-zinc-800">
              {(['expense', 'income'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setAnnualType(t)}
                  className={`flex-1 rounded-lg py-1.5 transition-colors ${
                    annualType === t ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                  {t === 'expense' ? 'Gastos' : 'Ingresos'}
                </button>
              ))}
            </div>

            <CategoryChart transactions={annTxs} type={annualType} />

            <div className="mt-5 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Desglose mensual ({year})</h3>
              {monthlyBreakdown.length === 0 ? (
                <p className="py-2 text-center text-xs text-zinc-400">Sin datos este año.</p>
              ) : (
                monthlyBreakdown.map((m) => (
                  <div key={m.key} className="flex items-center justify-between rounded-xl bg-zinc-50 p-2.5 text-xs dark:bg-zinc-800/40">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{m.label}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(m.income)}</span>
                      <span className="text-red-500 dark:text-red-400">-{formatCurrency(m.expense)}</span>
                      <span className={`font-semibold ${m.balance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500 dark:text-red-400'}`}>
                        {formatCurrency(m.balance)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
