import { useState } from 'react';
import type { Vehicle } from '../types';

interface ConfirmDeleteDialogProps {
  vehicle: Vehicle | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteDialog({ vehicle, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  if (!vehicle) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-danger/30 bg-surface p-6">
        <div className="label-eyebrow text-danger">DELETE UNIT</div>
        <h2 className="font-display mt-1 text-lg font-bold text-ink">
          Remove {vehicle.make} {vehicle.model}?
        </h2>
        <p className="mt-2 text-sm text-muted">
          This takes the unit off the floor for good. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="label-eyebrow rounded-lg border border-border px-4 py-2.5 text-muted transition hover:text-ink"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="label-eyebrow rounded-lg bg-danger px-5 py-2.5 text-ink transition hover:bg-danger/80 disabled:opacity-60"
          >
            {submitting ? 'REMOVING…' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RestockDialogProps {
  vehicle: Vehicle | null;
  onCancel: () => void;
  onConfirm: (amount: number) => Promise<void>;
}

export function RestockDialog({ vehicle, onCancel, onConfirm }: RestockDialogProps) {
  const [amount, setAmount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  if (!vehicle) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(amount);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-success/30 bg-surface p-6">
        <div className="label-eyebrow text-success">RESTOCK UNIT</div>
        <h2 className="font-display mt-1 text-lg font-bold text-ink">
          {vehicle.make} {vehicle.model}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Currently <span className="font-mono-tab text-ink">{vehicle.quantity}</span> in stock.
        </p>
        <label className="mt-4 block">
          <span className="label-eyebrow mb-1.5 block text-muted-2">Units to add</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="field-input"
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="label-eyebrow rounded-lg border border-border px-4 py-2.5 text-muted transition hover:text-ink"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={submitting || amount < 1}
            onClick={handleConfirm}
            className="label-eyebrow rounded-lg bg-success px-5 py-2.5 text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'ADDING…' : 'CONFIRM RESTOCK'}
          </button>
        </div>
      </div>
    </div>
  );
}
