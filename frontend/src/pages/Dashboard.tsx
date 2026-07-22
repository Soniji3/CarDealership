import { useEffect, useMemo, useState } from 'react';
import { Logo } from '../components/Logo';
import { StatCard } from '../components/StatCard';
import { FilterBar } from '../components/FilterBar';
import type { DashboardFilters } from '../components/FilterBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { ConfirmDeleteDialog, RestockDialog } from '../components/ConfirmDialogs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../api/client';
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  purchaseVehicle,
  restockVehicle,
  updateVehicle,
} from '../api/vehicles';
import type { Vehicle, VehicleFormValues } from '../types';

const DEFAULT_FILTERS: DashboardFilters = { search: '', category: '', maxPrice: 150000 };

export function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { notify } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [adminMode, setAdminMode] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Could not load the inventory.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.category))).sort(),
    [vehicles],
  );

  const maxPossiblePrice = useMemo(
    () => Math.max(150000, ...vehicles.map((v) => v.price)),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesQuery =
        !query ||
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query);
      const matchesCategory = !filters.category || v.category === filters.category;
      const matchesPrice = v.price <= filters.maxPrice;
      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [vehicles, filters]);

  const totalUnits = vehicles.length;
  const inStock = vehicles.filter((v) => v.quantity > 0).length;
  const soldOut = vehicles.filter((v) => v.quantity === 0).length;

  const showAdminUI = isAdmin && adminMode;

  const handlePurchase = async (vehicle: Vehicle) => {
    setBusyId(vehicle._id);
    try {
      const updated = await purchaseVehicle(vehicle._id);
      setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
      notify(`Purchased ${vehicle.make} ${vehicle.model}.`);
    } catch (err) {
      notify(getApiErrorMessage(err, 'Purchase failed.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateOrUpdate = async (values: VehicleFormValues) => {
    if (editingVehicle) {
      const updated = await updateVehicle(editingVehicle._id, values);
      setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
      notify(`Updated ${updated.make} ${updated.model}.`);
    } else {
      const created = await createVehicle(values);
      setVehicles((prev) => [created, ...prev]);
      notify(`Added ${created.make} ${created.model} to the floor.`);
    }
    setFormOpen(false);
    setEditingVehicle(null);
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;
    try {
      await deleteVehicle(deletingVehicle._id);
      setVehicles((prev) => prev.filter((v) => v._id !== deletingVehicle._id));
      notify(`Removed ${deletingVehicle.make} ${deletingVehicle.model}.`);
    } catch (err) {
      notify(getApiErrorMessage(err, 'Could not delete this vehicle.'), 'error');
    } finally {
      setDeletingVehicle(null);
    }
  };

  const handleRestock = async (amount: number) => {
    if (!restockingVehicle) return;
    try {
      const updated = await restockVehicle(restockingVehicle._id, amount);
      setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
      notify(`Restocked ${updated.make} ${updated.model} to ${updated.quantity}.`);
    } catch (err) {
      notify(getApiErrorMessage(err, 'Could not restock this vehicle.'), 'error');
    } finally {
      setRestockingVehicle(null);
    }
  };

  return (
    <div className="grid-floor min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={load}
              className="label-eyebrow flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-muted transition hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 4v5h5M20 20v-5h-5M4.6 15A8 8 0 0 0 19 9M19.4 9A8 8 0 0 0 5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              SYNC
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAdminMode((a) => !a)}
                className={`label-eyebrow rounded-lg border px-3 py-2 transition ${
                  adminMode
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-border text-muted hover:text-ink'
                }`}
              >
                ADMIN {adminMode ? 'ON' : 'OFF'}
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="label-eyebrow flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-muted transition hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              SIGN OUT
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="label-eyebrow mb-2 flex items-center gap-1.5 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              INVENTORY / {showAdminUI ? 'ADMIN' : 'SHOWROOM'}
            </div>
            <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">The Floor.</h1>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Everything on the lot, sorted, priced and ready to move. Use the filters to
              narrow the field — {showAdminUI ? 'or add fresh iron.' : 'or make the deal.'}
            </p>
          </div>
          <div className="flex gap-3">
            <StatCard value={totalUnits} label="TOTAL UNITS" />
            <StatCard value={inStock} label="IN STOCK" tone="success" />
            <StatCard value={soldOut} label="SOLD OUT" tone="danger" />
          </div>
        </div>

        <div className="mt-8">
          <FilterBar
            filters={filters}
            categories={categories}
            maxPossiblePrice={maxPossiblePrice}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {showAdminUI && (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 p-4 sm:flex-row sm:items-center">
            <div className="label-eyebrow text-accent">
              ADMIN MODE
              <p className="mt-1 font-mono text-[0.7rem] normal-case tracking-normal text-ink/80">
                Edit, delete, restock — or add a new vehicle to the floor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingVehicle(null);
                setFormOpen(true);
              }}
              className="label-eyebrow flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-accent-ink transition hover:bg-accent-hover"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Vehicle
            </button>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl border border-border bg-surface" />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-center text-danger">
              {loadError}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-10 text-center text-muted">
              No units match those filters. Try widening the search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  index={index}
                  isAdmin={showAdminUI}
                  busy={busyId === vehicle._id}
                  onPurchase={handlePurchase}
                  onEdit={(v) => {
                    setEditingVehicle(v);
                    setFormOpen(true);
                  }}
                  onDelete={setDeletingVehicle}
                  onRestock={setRestockingVehicle}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-muted-2">
          Signed in as {user?.name} · {user?.role.toUpperCase()}
        </p>
      </main>

      <VehicleFormModal
        open={formOpen}
        vehicle={editingVehicle}
        onClose={() => {
          setFormOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />
      <ConfirmDeleteDialog
        vehicle={deletingVehicle}
        onCancel={() => setDeletingVehicle(null)}
        onConfirm={handleDelete}
      />
      <RestockDialog
        vehicle={restockingVehicle}
        onCancel={() => setRestockingVehicle(null)}
        onConfirm={handleRestock}
      />
    </div>
  );
}
