export interface DateRange {
  start: Date;
  end: Date;
}

const endOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Ciclo semanal local: lunes 00:00:00 a domingo 23:59:59. */
export function getWeekRange(referenceDate: Date = new Date()): DateRange {
  const start = startOfDay(referenceDate);
  const weekday = start.getDay(); // 0 = domingo
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end: endOfDay(end) };
}

/** Ciclo mensual local: día 1 a último día del mes. */
export function getMonthRange(referenceDate: Date = new Date()): DateRange {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  return { start, end: endOfDay(end) };
}

/** Interpreta `YYYY-MM-DD` como fecha local y comprueba si cae dentro del rango. */
export function isDateInRange(isoDate: string, start: Date, end: Date): boolean {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return date >= startOfDay(start) && date <= end;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
