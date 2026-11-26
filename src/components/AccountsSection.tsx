import { useState } from 'react';
import type { Account } from '../types/finance';
import { formatCurrency } from '../utils/dateUtils';

const TYPE_LABELS: Record<Account['type'], string> = { cash: 'Efectivo', bank: 'Banco' };
const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const inputCls = 'mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100';

interface Props {
  accounts: Account[];
  totalWalletBalance: number;
  onAdd: (data: Omit<Account, 'id'>) => Promise<string>;
  onDelete: (id: string) => Promise<void>;
}

export default function AccountsSection({ accounts, totalWalletBalance, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAdd = async () => {
    const bal = Number(balance.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(bal)) { setMsg('Nombre y saldo válido requeridos.'); return; }
    setSaving(true); setMsg('');
    try {
      await onAdd({ name: name.trim(), type, balance: bal });
      setName(''); setBalance(''); setMsg('Cuenta añadida.');
    } catch { setMsg('No se pudo guardar.'); }
    finally { setSaving(false); }
  };

  return (
    <section className={cardCls}>
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Billeteras y Cuentas</h2>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Total: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(totalWalletBalance)}</span>
      </p>

      <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
        {accounts.map((acc) => (
          <li key={acc.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{acc.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{TYPE_LABELS[acc.type]} · {formatCurrency(acc.balance)}</p>
            </div>
            <button type="button" onClick={() => void onDelete(acc.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400">
              ×
            </button>
          </li>
        ))}
        {accounts.length === 0 && (
          <li className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">Sin cuentas</li>
        )}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: BBVA" className={inputCls} />
        </div>
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value as Account['type'])}
            className={inputCls}>
            <option value="cash">Efectivo</option>
            <option value="bank">Banco</option>
          </select>
        </div>
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Saldo inicial</span>
          <input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" className={inputCls} />
        </div>
      </div>

      <button type="button" onClick={() => void handleAdd()} disabled={saving}
        className="mt-3 h-11 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white disabled:opacity-40">
        {saving ? 'Guardando…' : '+ Añadir cuenta'}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{msg}</p>}
    </section>
  );
}
