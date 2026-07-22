export interface DashboardFilters {
  search: string;
  category: string;
  maxPrice: number;
}

interface FilterBarProps {
  filters: DashboardFilters;
  categories: string[];
  maxPossiblePrice: number;
  onChange: (filters: DashboardFilters) => void;
  onReset: () => void;
}

export function FilterBar({ filters, categories, maxPossiblePrice, onChange, onReset }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search make or model..."
          className="w-full rounded-lg border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted-2 focus:border-accent focus:outline-none"
        />
      </div>

      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none md:w-44"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="flex min-w-[240px] items-center gap-3 md:w-64">
        <span className="label-eyebrow whitespace-nowrap text-muted-2">
          MAX ${filters.maxPrice.toLocaleString()}
        </span>
        <input
          type="range"
          min={0}
          max={maxPossiblePrice}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full"
          aria-label="Maximum price"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="label-eyebrow flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-muted transition hover:border-border-hover hover:text-ink"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        RESET
      </button>
    </div>
  );
}
