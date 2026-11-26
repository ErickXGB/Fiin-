import type { Account } from '../types/finance';

const selectClass =
  'mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100';

interface AccountFieldsProps {
  accounts: Account[];
  from: string;
  to: string;
  transfer: boolean;
  onFrom: (id: string) => void;
  onTo: (id: string) => void;
}

export default function AccountFields({ accounts, from, to, transfer, onFrom, onTo }: AccountFieldsProps) {
  if (accounts.length === 0) return null;

  if (!transfer) {
    return (
      <select value={from} onChange={(e) => onFrom(e.target.value)} className={`mt-3 ${selectClass}`}>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <label className="block">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Cuenta origen</span>
        <select value={from} onChange={(e) => onFrom(e.target.value)} className={selectClass}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} disabled={acc.id === to}>{acc.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Cuenta destino</span>
        <select value={to} onChange={(e) => onTo(e.target.value)} className={selectClass}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} disabled={acc.id === from}>{acc.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
