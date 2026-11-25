import { Home, PieChart, Settings } from 'lucide-react';

export type Tab = 'inicio' | 'analisis' | 'ajustes';

const ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Resumen', icon: Home },
  { id: 'analisis', label: 'Movimientos', icon: PieChart },
  { id: 'ajustes', label: 'Configuración', icon: Settings },
];

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto grid max-w-md grid-cols-3 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] ${
              activeTab === id ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Icon size={22} strokeWidth={activeTab === id ? 2.4 : 1.8} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
