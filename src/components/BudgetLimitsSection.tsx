import { useState } from 'react';
import type { NewBudget } from '../services/financeService';
import { getMonthRange, getWeekRange } from '../utils/dateUtils';
import CategoryBudgetAccordion from './CategoryBudgetAccordion';

const toIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const titleCls = 'text-sm font-medium text-zinc-500 dark:text-zinc-400';
const inputCls =
  'mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100';

interface Props {
  weeklyLimit: number;
  monthlyLimit: number;
  selectedDate: Date;
  weeklyCategoryLimits?: Record<string, number>;
  monthlyCategoryLimits?: Record<string, number>;
  saveBudget: (data: NewBudget, id?: string) => Promise<string>;
}

export default function BudgetLimitsSection({
  weeklyLimit, monthlyLimit, selectedDate,
  weeklyCategoryLimits, monthlyCategoryLimits, saveBudget,
}: Props) {
  const [weekly, setWeekly] = useState(weeklyLimit > 0 ? String(weeklyLimit) : '');
  const [monthly, setMonthly] = useState(monthlyLimit > 0 ? String(monthlyLimit) : '');
  const [weekCatLimits, setWeekCatLimits] = useState<Record<string, number>>(weeklyCategoryLimits ?? {});
  const [monthCatLimits, setMonthCatLimits] = useState<Record<string, number>>(monthlyCategoryLimits ?? {});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const saveLimits = async () => {
    const wVal = Number(weekly.replace(',', '.')), mVal = Number(monthly.replace(',', '.'));
    if (!Number.isFinite(wVal) || !Number.isFinite(mVal) || wVal < 0 || mVal < 0) {
      setMessage('Ingresa montos válidos.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await saveBudget({ period: 'weekly', limitAmount: wVal, startDate: toIso(getWeekRange().start), categoryLimits: weekCatLimits });
      await saveBudget({ period: 'monthly', limitAmount: mVal, startDate: toIso(getMonthRange(selectedDate).start), categoryLimits: monthCatLimits });
      setMessage('Límites guardados.');
    } catch {
      setMessage('No se pudieron guardar los límites.');
    } finally {
      setSaving(false);
    }
  };

  return (
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
      <CategoryBudgetAccordion
        label="Distribuir por categorías · Semanal"
        totalLimit={Number(weekly.replace(',', '.')) || weeklyLimit}
        initialLimits={weeklyCategoryLimits}
        onChange={setWeekCatLimits}
      />
      <CategoryBudgetAccordion
        label="Distribuir por categorías · Mensual"
        totalLimit={Number(monthly.replace(',', '.')) || monthlyLimit}
        initialLimits={monthlyCategoryLimits}
        onChange={setMonthCatLimits}
      />
    </section>
  );
}
