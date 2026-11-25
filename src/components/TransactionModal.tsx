import { useEffect, useState, type FormEvent } from 'react';
import type { Transaction, TransactionType } from '../types/finance';

const TYPES: { id: TransactionType; label: string; active: string }[] = [
  { id: 'expense', label: 'Gasto', active: 'bg-red-500 text-white font-semibold shadow-sm' },
  { id: 'income', label: 'Ingreso', active: 'bg-emerald-500 text-white font-semibold shadow-sm' },
];

const CATEGORIES: Record<TransactionType, string[]> = {
  expense: ['Comida', 'Transporte', 'Hogar', 'Ocio', 'Salud', 'Otros'],
  income: ['Salario', 'Extra', 'Ventas', 'Regalo', 'Otros'],
};

const pad = (v: number) => String(v).padStart(2, '0');
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

interface TransactionModalProps {
  open: boolean;
  initialType?: 'expense' | 'income';
  onClose: () => void;
  onSave: (data: NewTransaction) => Promise<void> | void;
}

export default function TransactionModal({ open, initialType = 'expense', onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setAmount('');
    setCategory('');
    setDate(todayIso());
    setNote('');
    setSaving(false);
    setError('');
  }, [open, initialType]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const val = Number(amount.replace(',', '.'));
    if (!Number.isFinite(val) || val <= 0 || !category) return;
    setSaving(true);
    setError('');
    try {
      await onSave({ type, amount: val, category, date, note: note.trim() });
      onClose();
    } catch {
      setError('No se pudo guardar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  const selCat = type === 'expense'
    ? 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
    : 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose} role="presentation">
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-zinc-200 bg-white p-5 pb-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-3xl sm:pb-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Nuevo movimiento</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-zinc-400 active:bg-zinc-100 dark:text-zinc-500 dark:active:bg-zinc-800">
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {TYPES.map((opt) => (
            <button key={opt.id} type="button" onClick={() => { setType(opt.id); setCategory(''); }}
              className={`h-11 rounded-lg text-sm font-medium transition-colors ${type === opt.id ? opt.active : 'text-zinc-500 dark:text-zinc-400'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-3xl font-semibold text-zinc-400 dark:text-zinc-500">$</span>
          <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" aria-label="Monto"
            className="w-full bg-transparent text-center text-4xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-700" />
        </label>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Categoría</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {CATEGORIES[type].map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)}
              className={`h-11 rounded-xl border text-sm font-medium transition-colors ${category === item ? selCat : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300'}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Fecha</span>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Nota</span>
            <input maxLength={40} value={note} placeholder="Opcional" onChange={(e) => setNote(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600" />
          </label>
        </div>

        {error && <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={saving || !category || !amount}
          className="mt-5 h-14 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-white shadow-sm active:scale-[0.99] disabled:opacity-40">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
