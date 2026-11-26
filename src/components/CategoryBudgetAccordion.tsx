import { useState } from 'react';
import { formatCurrency } from '../utils/dateUtils';

const EXPENSE_CATS = ['Comida', 'Transporte', 'Hogar', 'Ocio', 'Salud', 'Otros'];
const inputCls = 'h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100';

interface Props {
  label: string;
  totalLimit: number;
  initialLimits?: Record<string, number>;
  onChange: (limits: Record<string, number>) => void;
}

export default function CategoryBudgetAccordion({ label, totalLimit, initialLimits = {}, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(EXPENSE_CATS.map((c) => [c, initialLimits[c] ? String(initialLimits[c]) : ''])),
  );

  const assigned = EXPENSE_CATS.reduce((sum, c) => {
    const v = Number(limits[c]?.replace(',', '.') ?? 0);
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);
  const remaining = totalLimit - assigned;

  const handleChange = (cat: string, raw: string) => {
    const next = { ...limits, [cat]: raw };
    setLimits(next);
    const parsed = Object.fromEntries(
      EXPENSE_CATS.map((c) => {
        const v = Number(next[c]?.replace(',', '.') ?? 0);
        return [c, Number.isFinite(v) && v > 0 ? v : 0];
      }).filter(([, v]) => v > 0),
    );
    onChange(parsed);
  };

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          {totalLimit > 0 && (
            <p className={`mb-3 text-xs ${remaining < 0 ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {formatCurrency(assigned)} asignados de {formatCurrency(totalLimit)}
              {remaining >= 0 ? ` · ${formatCurrency(remaining)} libres` : ' · excedido'}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {EXPENSE_CATS.map((cat) => (
              <label key={cat} className="block">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{cat}</span>
                <input
                  inputMode="decimal"
                  value={limits[cat]}
                  placeholder="0.00"
                  onChange={(e) => handleChange(cat, e.target.value)}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
