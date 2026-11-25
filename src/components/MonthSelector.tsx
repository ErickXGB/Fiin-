import { formatMonthYear } from '../utils/dateUtils';

interface MonthSelectorProps {
  selectedDate: Date;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthSelector({
  selectedDate,
  isCurrentMonth,
  onPrev,
  onNext,
}: MonthSelectorProps) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Mes anterior"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-zinc-700 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-800"
      >
        ‹
      </button>
      <p className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
        {formatMonthYear(selectedDate)}
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={isCurrentMonth}
        aria-label="Mes siguiente"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-zinc-700 active:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:active:bg-zinc-800"
      >
        ›
      </button>
    </div>
  );
}
