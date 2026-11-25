import { useState } from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus';
import type { NewBudget } from '../services/financeService';
import type { Transaction } from '../types/finance';
import { buildCsv } from '../utils/csv';
import { getMonthRange, getWeekRange } from '../utils/dateUtils';

const toIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const titleCls = 'text-sm font-medium text-zinc-500 dark:text-zinc-400';
const inputCls =
  'mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100';

interface SettingsViewProps {
  uid: string; name: string; email: string; photoURL: string | null;
  weeklyLimit: number; monthlyLimit: number; selectedDate: Date;
  transactions: Transaction[];
  saveBudget: (data: NewBudget, id?: string) => Promise<string>;
  onLogout: () => Promise<void>;
}

export default function SettingsView(props: SettingsViewProps) {
  const { uid, name, email, photoURL, weeklyLimit, monthlyLimit, selectedDate, transactions, saveBudget, onLogout } = props;
  const [weekly, setWeekly] = useState(weeklyLimit > 0 ? String(weeklyLimit) : '');
  const [monthly, setMonthly] = useState(monthlyLimit > 0 ? String(monthlyLimit) : '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');
  const { online, fromCache } = useSyncStatus(uid);

  const applyTheme = (next: 'dark' | 'light') => {
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const saveLimits = async () => {
    const wVal = Number(weekly.replace(',', '.')), mVal = Number(monthly.replace(',', '.'));
    if (!Number.isFinite(wVal) || !Number.isFinite(mVal) || wVal < 0 || mVal < 0) {
      setMessage('Ingresa montos válidos.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await saveBudget({ period: 'weekly', limitAmount: wVal, startDate: toIso(getWeekRange().start) });
      await saveBudget({ period: 'monthly', limitAmount: mVal, startDate: toIso(getMonthRange(selectedDate).start) });
      setMessage('Límites guardados.');
    } catch {
      setMessage('No se pudieron guardar los límites.');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([buildCsv(transactions)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movimientos-${toIso(getMonthRange(selectedDate).start).slice(0, 7)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <section className={cardCls}>
        <h2 className={titleCls}>Perfil</h2>
        <div className="mt-3 flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt={name} className="h-12 w-12 rounded-full" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
          </div>
        </div>
        <button type="button" onClick={() => void onLogout()}
          className="mt-4 h-11 w-full rounded-xl bg-red-500/10 text-sm font-medium text-red-600 dark:text-red-400 active:bg-red-500/20">
          Cerrar sesión
        </button>
      </section>

      <section className={cardCls}>
        <h2 className={titleCls}>Apariencia</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(['light', 'dark'] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => applyTheme(mode)}
              className={`h-11 rounded-xl text-sm font-medium transition-colors ${
                theme === mode
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
              {mode === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <h2 className={titleCls}>Metas de presupuesto</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Semanal (USD)</span>
            <input type="text" inputMode="decimal" value={weekly} placeholder="0.00" onChange={(e) => setWeekly(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Mensual (USD)</span>
            <input type="text" inputMode="decimal" value={monthly} placeholder="0.00" onChange={(e) => setMonthly(e.target.value)} className={inputCls} />
          </label>
        </div>
        <button type="button" onClick={() => void saveLimits()} disabled={saving}
          className="mt-4 h-12 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-sm disabled:opacity-40">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        {message && <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{message}</p>}
      </section>

      <section className={cardCls}>
        <h2 className={titleCls}>Exportar datos</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Movimientos del mes en formato CSV.</p>
        <button type="button" onClick={exportCsv}
          className="mt-3 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-800 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:active:bg-zinc-700">
          Descargar CSV ({transactions.length})
        </button>
      </section>

      <section className={cardCls}>
        <h2 className={titleCls}>Estado de sincronización</h2>
        <div className="mt-3 flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${online && !fromCache ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {online && !fromCache ? 'En línea · sincronizado' : 'Caché local · sin conexión'}
          </p>
        </div>
      </section>
    </div>
  );
}
