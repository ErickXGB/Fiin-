import type { Transaction } from '../types/finance';

export function buildCsv(transactions: Transaction[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = transactions.map((tx) =>
    [
      tx.date,
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      escape(tx.category),
      tx.amount.toFixed(2),
      escape(tx.note),
    ].join(','),
  );
  return ['Fecha,Tipo,Categoria,Monto,Nota', ...rows].join('\n');
}
