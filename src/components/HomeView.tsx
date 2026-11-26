import BalanceCard from './BalanceCard';
import BudgetCard from './BudgetCard';
import type { PeriodStats } from '../hooks/useFinance';
import type { Account, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

interface HomeViewProps {
  weeklyStats: PeriodStats;
  monthlyStats: PeriodStats;
  monthlyIncome: number;
  netBalance: number;
  isCurrentMonth: boolean;
  accounts: Account[];
  totalWalletBalance: number;
  weeklyTransactions: Transaction[];
  monthlyTransactions: Transaction[];
  weeklyBudget?: { categoryLimits?: Record<string, number> };
  monthlyBudget?: { categoryLimits?: Record<string, number> };
  onEditLimits: () => void;
}

export default function HomeView({
  weeklyStats, monthlyStats, monthlyIncome, netBalance, isCurrentMonth,
  accounts, totalWalletBalance, weeklyTransactions, monthlyTransactions,
  weeklyBudget, monthlyBudget, onEditLimits,
}: HomeViewProps) {
  return (
    <div className="space-y-4">
      {/* Tarjeta de Billeteras */}
      {accounts.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Billeteras</h2>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalWalletBalance)}</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {accounts.map((acc) => (
              <div key={acc.id}
                className="flex shrink-0 flex-col rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[88px]">{acc.name}</span>
                <span className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isCurrentMonth && (
        <BudgetCard
          title="Presupuesto Semanal"
          stats={weeklyStats}
          transactions={weeklyTransactions}
          categoryLimits={weeklyBudget?.categoryLimits}
          onEditLimit={onEditLimits}
        />
      )}
      <BudgetCard
        title="Presupuesto Mensual"
        stats={monthlyStats}
        transactions={monthlyTransactions}
        categoryLimits={monthlyBudget?.categoryLimits}
        onEditLimit={onEditLimits}
      />
      <BalanceCard income={monthlyIncome} expenses={monthlyStats.spent} balance={netBalance} />
    </div>
  );
}
