import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  isAdmin: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
  busy?: boolean;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=60';

export function VehicleCard({
  vehicle,
  index,
  isAdmin,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  busy,
}: VehicleCardProps) {
  const outOfStock = vehicle.quantity <= 0;
  const lowStock = !outOfStock && vehicle.quantity <= 2;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:border-border-hover">
      <div className="relative h-48 w-full overflow-hidden bg-surface-2">
        <img
          src={vehicle.imageUrl || FALLBACK_IMAGE}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="label-eyebrow absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-border bg-black/70 px-2 py-1 text-ink backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {vehicle.category}
        </span>
        <span className="label-eyebrow absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-muted-2 backdrop-blur">
          #V{index + 1}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="label-eyebrow text-muted-2">
              {vehicle.make}
              {vehicle.year ? ` · ${vehicle.year}` : ''}
            </div>
            <div className="font-display text-lg font-bold text-ink">{vehicle.model}</div>
          </div>
          <div className="text-right">
            <div className="font-mono-tab text-lg font-bold text-accent">
              ${vehicle.price.toLocaleString()}
            </div>
            <div
              className={`label-eyebrow rounded px-1.5 py-0.5 ${
                outOfStock
                  ? 'text-danger'
                  : lowStock
                    ? 'bg-info/20 text-info'
                    : 'text-muted-2'
              }`}
            >
              STOCK · {String(vehicle.quantity).padStart(2, '0')}
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-auto grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              className="label-eyebrow flex items-center justify-center gap-1 rounded-lg border border-border py-2 text-ink transition hover:border-border-hover"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              EDIT
            </button>
            <button
              type="button"
              onClick={() => onRestock(vehicle)}
              className="label-eyebrow flex items-center justify-center gap-1 rounded-lg border border-success/30 py-2 text-success transition hover:bg-success/10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              RESTOCK
            </button>
            <button
              type="button"
              onClick={() => onDelete(vehicle)}
              className="label-eyebrow flex items-center justify-center gap-1 rounded-lg border border-danger/30 py-2 text-danger transition hover:bg-danger/10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              DELETE
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={outOfStock || busy}
            onClick={() => onPurchase(vehicle)}
            className="label-eyebrow mt-auto flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-accent-ink transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="9" cy="21" r="1.4" fill="currentColor" />
              <circle cx="19" cy="21" r="1.4" fill="currentColor" />
              <path
                d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {outOfStock ? 'SOLD OUT' : busy ? 'PROCESSING…' : 'PURCHASE'}
          </button>
        )}
      </div>
    </div>
  );
}
