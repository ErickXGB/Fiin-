import { useState } from 'react';
import BalanceCard from './BalanceCard';
import BudgetCard from './BudgetCard';
import CategorySection from './CategorySection';
import TransactionList from './TransactionList';
import TransactionModal from './TransactionModal';
import { useFinance } from '../hooks/useFinance';
import { getMonthRange, getWeekRange, formatMonthYear } from '../utils/dateUtils';

const toIso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

interface DashboardProps {
  uid: string;
  name: string;
  photoURL: string | null;
  onLogout: () => Promise<void>;
}

export default function Dashboard({ uid, name, photoURL, onLogout }: DashboardProps) {
  const {
    loading,
    weeklyStats,
    monthlyStats,
    monthlyIncome,
    netBalance,
    selectedDate,
    isCurrentMonth,
    prevMonth,
    nextMonth,
    weeklyTransactions,
    monthlyTransactions,
    createTransaction,
    removeTransaction,
    saveBudget,
  } = useFinance(uid);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const editLimit = async (period: 'weekly' | 'monthly') => {
    const startDate = toIso((period === 'weekly' ? getWeekRange() : getMonthRange()).start);
    const current = period === 'weekly' ? weeklyStats.limit : monthlyStats.limit;
    const label = period === 'weekly' ? 'semanal' : 'mensual';
    const answer = window.prompt(`Límite ${label} (USD)`, current > 0 ? String(current) : '');
    if (answer === null) return;
    const value = Number(answer.replace(',', '.'));
    if (!Number.isFinite(value) || value < 0) {
      setError('Ingresa un límite válido.');
      return;
    }
    setError('');
    try {
      await saveBudget({ period, limitAmount: value, startDate });
    } catch {
      setError('No se pudo guardar el presupuesto. Revisa tu conexión o permisos.');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeTransaction(id);
    } catch {
      setError('No se pudo eliminar la transacción.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-950 pb-28 text-neutral-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-neutral-950/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt={name} className="h-10 w-10 rounded-full" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-xs text-neutral-500">Hola,</p>
            <p className="text-sm font-semibold">{name.split(' ')[0]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="rounded-xl px-3 py-2 text-sm text-neutral-400 active:bg-white/5"
        >
          Salir
        </button>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-neutral-900 p-2 ring-1 ring-white/10">
          <button type="button" onClick={prevMonth} aria-label="Mes anterior" className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-neutral-300 active:bg-white/5">‹</button>
          <p className="text-sm font-semibold">{formatMonthYear(selectedDate)}</p>
          <button type="button" onClick={nextMonth} disabled={isCurrentMonth} aria-label="Mes siguiente" className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-neutral-300 active:bg-white/5 disabled:opacity-30">›</button>
        </div>

        {isCurrentMonth && (
          <BudgetCard title="Presupuesto Semanal" stats={weeklyStats} onEditLimit={() => void editLimit('weekly')} />
        )}
        <BudgetCard
          title="Presupuesto Mensual"
          stats={monthlyStats}
          onEditLimit={() => void editLimit('monthly')}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}

        <BalanceCard income={monthlyIncome} expenses={monthlyStats.spent} balance={netBalance} />

        <CategorySection
          weeklyTransactions={weeklyTransactions}
          monthlyTransactions={monthlyTransactions}
          showWeek={isCurrentMonth}
        />

        <section className="rounded-2xl bg-neutral-900 p-5 ring-1 ring-white/10">
          <h2 className="text-sm font-medium text-neutral-400">Movimientos de {formatMonthYear(selectedDate)}</h2>
          <TransactionList transactions={monthlyTransactions} onRemove={handleRemove} />
        </section>
      </main>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Nueva transacción"
        className="fixed bottom-6 right-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl font-light text-neutral-950 shadow-lg shadow-emerald-500/25 active:scale-95"
      >
        +
      </button>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (data) => {
          await createTransaction(data);
        }}
      />
    </div>
  );
}
