import { lazy, Suspense, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import BottomNav, { type Tab } from './components/BottomNav';
import HomeView from './components/HomeView';
import MonthSelector from './components/MonthSelector';
import TransactionModal from './components/TransactionModal';
import { useAuth } from './hooks/useAuth';
import { useFinance } from './hooks/useFinance';

const AnalysisView = lazy(() => import('./components/AnalysisView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

const TITLES: Record<Tab, string> = { inicio: 'Resumen', analisis: 'Movimientos', ajustes: 'Configuración' };

const Spinner = () => (
  <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500 dark:border-zinc-700 dark:border-t-emerald-400" />
  </div>
);

function LoginScreen({ onLogin }: { onLogin: () => Promise<void> }) {
  const [error, setError] = useState('');
  const handleLogin = async () => {
    setError('');
    try { await onLogin(); } catch { setError('No se pudo iniciar sesión. Intenta de nuevo.'); }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-4xl font-bold text-white shadow-lg shadow-emerald-500/20">$</div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Finanzas</h1>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">Gastos, ingresos y presupuestos semanales y mensuales en USD.</p>
      <button type="button" onClick={() => void handleLogin()}
        className="mt-10 h-14 w-full max-w-xs rounded-2xl bg-zinc-900 text-base font-semibold text-white shadow-sm active:scale-95 dark:bg-white dark:text-zinc-950">
        Continuar con Google
      </button>
      {error && <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </main>
  );
}

interface ShellProps {
  uid: string; name: string; email: string; photoURL: string | null; onLogout: () => Promise<void>;
}

function Shell({ uid, name, email, photoURL, onLogout }: ShellProps) {
  const finance = useFinance(uid);
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');
  const [error, setError] = useState('');

  useEffect(() => {
    const trigger = (type: string) => {
      if (type === 'expense' || type === 'income') { setModalType(type); setModalOpen(true); }
    };
    const w = window as unknown as { __FIIN_QUICK_ACTION__?: string };
    if (w.__FIIN_QUICK_ACTION__) { trigger(w.__FIIN_QUICK_ACTION__); w.__FIIN_QUICK_ACTION__ = undefined; }
    const onQuick = (e: Event) => trigger((e as CustomEvent<string>).detail);
    window.addEventListener('fiin_quick_action', onQuick);

    if (Capacitor.isNativePlatform()) {
      const handle = AppShortcuts.addListener('click', (event) => {
        if (event.shortcutId === 'add-expense') trigger('expense');
        else if (event.shortcutId === 'add-income') trigger('income');
      });
      return () => { window.removeEventListener('fiin_quick_action', onQuick); void handle.then((h) => h.remove()); };
    }
    return () => window.removeEventListener('fiin_quick_action', onQuick);
  }, []);

  const handleRemove = async (id: string) => {
    try { await finance.removeTransaction(id); } catch { setError('No se pudo eliminar el movimiento.'); }
  };

  if (finance.loading) return <Spinner />;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/90 px-4 pb-3 pt-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto max-w-md">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Hola, {name.split(' ')[0]}</p>
          <h1 className="text-lg font-semibold">{TITLES[activeTab]}</h1>
          {activeTab !== 'ajustes' && (
            <MonthSelector selectedDate={finance.selectedDate} isCurrentMonth={finance.isCurrentMonth}
              onPrev={finance.prevMonth} onNext={finance.nextMonth} />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-32 pt-4">
        {error && <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
        {activeTab === 'inicio' && (
          <HomeView weeklyStats={finance.weeklyStats} monthlyStats={finance.monthlyStats}
            monthlyIncome={finance.monthlyIncome} netBalance={finance.netBalance}
            isCurrentMonth={finance.isCurrentMonth} onEditLimits={() => setActiveTab('ajustes')} />
        )}
        {activeTab === 'analisis' && (
          <Suspense fallback={null}>
            <AnalysisView transactions={finance.monthlyTransactions} annualTransactions={finance.annualTransactions}
              year={finance.selectedDate.getFullYear()} onRemove={handleRemove} />
          </Suspense>
        )}
        {activeTab === 'ajustes' && (
          <Suspense fallback={null}>
            <SettingsView uid={uid} name={name} email={email} photoURL={photoURL}
              weeklyLimit={finance.weeklyStats.limit} monthlyLimit={finance.monthlyStats.limit}
              selectedDate={finance.selectedDate} transactions={finance.monthlyTransactions}
              saveBudget={finance.saveBudget} onLogout={onLogout} />
          </Suspense>
        )}
      </main>

      {activeTab !== 'ajustes' && (
        <button type="button" onClick={() => { setModalType('expense'); setModalOpen(true); }} aria-label="Nueva transacción"
          className="fixed bottom-20 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl font-light text-white shadow-lg shadow-emerald-500/25 active:scale-95">
          +
        </button>
      )}

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <TransactionModal open={modalOpen} initialType={modalType} onClose={() => setModalOpen(false)} onSave={finance.createTransaction} />
    </div>
  );
}

export default function App() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  useEffect(() => {
    const theme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  if (loading) return <Spinner />;
  if (!user) return <LoginScreen onLogin={loginWithGoogle} />;

  return (
    <Shell uid={user.uid} name={user.displayName ?? user.email ?? 'Usuario'} email={user.email ?? ''}
      photoURL={user.photoURL} onLogout={logout} />
  );
}
