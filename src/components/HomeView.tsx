import BalanceCard from './BalanceCard';
import BudgetCard from './BudgetCard';
import type { PeriodStats } from '../hooks/useFinance';

interface HomeViewProps {
  weeklyStats: PeriodStats;
  monthlyStats: PeriodStats;
  monthlyIncome: number;
  netBalance: number;
  isCurrentMonth: boolean;
  onEditLimits: () => void;
}

export default function HomeView({
  weeklyStats,
  monthlyStats,
  monthlyIncome,
  netBalance,
  isCurrentMonth,
  onEditLimits,
}: HomeViewProps) {
  return (
    <div className="space-y-4">
      {isCurrentMonth && (
        <BudgetCard
          title="Presupuesto Semanal"
          stats={weeklyStats}
          onEditLimit={onEditLimits}
        />
      )}
      <BudgetCard
        title="Presupuesto Mensual"
        stats={monthlyStats}
        onEditLimit={onEditLimits}
      />
      <BalanceCard income={monthlyIncome} expenses={monthlyStats.spent} balance={netBalance} />
    </div>
  );
}
