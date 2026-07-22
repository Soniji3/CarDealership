import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Vehicle, VehicleFormValues } from '../types';

interface VehicleFormModalProps {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
}

const EMPTY_FORM: VehicleFormValues = {
  make: '',
  model: '',
  category: '',
  price: 0,
  quantity: 0,
  year: undefined,
  imageUrl: '',
};

export function VehicleFormModal({ open, vehicle, onClose, onSubmit }: VehicleFormModalProps) {
  const [values, setValues] = useState<VehicleFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(
        vehicle
          ? {
              make: vehicle.make,
              model: vehicle.model,
              category: vehicle.category,
              price: vehicle.price,
              quantity: vehicle.quantity,
              year: vehicle.year,
              imageUrl: vehicle.imageUrl || '',
            }
          : EMPTY_FORM,
      );
      setError(null);
    }
  }, [open, vehicle]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="label-eyebrow text-accent">
              {vehicle ? 'EDIT UNIT' : 'ADD UNIT'}
            </div>
            <h2 className="font-display text-xl font-bold text-ink">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'New vehicle'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Make">
              <input
                required
                value={values.make}
                onChange={(e) => setValues({ ...values, make: e.target.value })}
                className="field-input"
              />
            </Field>
            <Field label="Model">
              <input
                required
                value={values.model}
                onChange={(e) => setValues({ ...values, model: e.target.value })}
                className="field-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                required
                value={values.category}
                onChange={(e) => setValues({ ...values, category: e.target.value })}
                placeholder="Sedan, SUV, Coupe…"
                className="field-input"
              />
            </Field>
            <Field label="Year">
              <input
                type="number"
                value={values.year ?? ''}
                onChange={(e) =>
                  setValues({ ...values, year: e.target.value ? Number(e.target.value) : undefined })
                }
                className="field-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD)">
              <input
                required
                type="number"
                min={0}
                value={values.price}
                onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
                className="field-input"
              />
            </Field>
            <Field label="Quantity">
              <input
                required
                type="number"
                min={0}
                value={values.quantity}
                onChange={(e) => setValues({ ...values, quantity: Number(e.target.value) })}
                className="field-input"
              />
            </Field>
          </div>

          <Field label="Image URL (optional)">
            <input
              value={values.imageUrl}
              onChange={(e) => setValues({ ...values, imageUrl: e.target.value })}
              placeholder="https://…"
              className="field-input"
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="label-eyebrow rounded-lg border border-border px-4 py-2.5 text-muted transition hover:text-ink"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="label-eyebrow rounded-lg bg-accent px-5 py-2.5 text-accent-ink transition hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? 'SAVING…' : vehicle ? 'SAVE CHANGES' : 'ADD VEHICLE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label-eyebrow mb-1.5 block text-muted-2">{label}</span>
      {children}
    </label>
  );
}
