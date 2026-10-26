"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Search, ShieldOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import {
  useGetAdminMedicinesQuery,
  useCreateAdminMedicineMutation,
  useUpdateAdminMedicineMutation,
  useDeactivateAdminMedicineMutation,
} from "@/redux/api/adminApi";
import { toast } from "sonner";

export default function AdminMedicinesPage() {
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState("ALL");
  const [rx, setRx] = useState("ALL");
  const [editing, setEditing] = useState<Record<string, unknown> | "NEW" | null>(null);
  const [deactivating, setDeactivating] = useState<Record<string, unknown> | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formGeneric, setFormGeneric] = useState("");
  const [formStrength, setFormStrength] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formRx, setFormRx] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAdminMedicinesQuery();
  const [createMedicine, { isLoading: isCreating }] = useCreateAdminMedicineMutation();
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateAdminMedicineMutation();
  const [deactivateMedicine, { isLoading: isDeactivating }] = useDeactivateAdminMedicineMutation();

  const rawMedicines = data?.data ?? data;
  const medicineList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawMedicines)) {
      return rawMedicines.filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null);
    }
    if (rawMedicines && typeof rawMedicines === "object") {
      const medProp = (rawMedicines as Record<string, unknown>).medicines;
      if (Array.isArray(medProp)) {
        return medProp.filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null);
      }
      const itemProp = (rawMedicines as Record<string, unknown>).items;
      if (Array.isArray(itemProp)) {
        return itemProp.filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null);
      }
    }
    return [];
  }, [rawMedicines]);

  const medicines = useMemo(() => {
    return medicineList.filter((med) => {
      const name = String(med.name ?? "");
      const generic = String(med.genericName ?? med.description ?? "");
      const category = String(med.category ?? med.dosageForm ?? "");
      const stockQty = Number(med.stockQuantity ?? med.stock ?? 0);
      const requiresRx = Boolean(med.requiresPrescription);

      const searchable = `${name} ${generic} ${category}`.toLowerCase().includes(search.toLowerCase());
      const stockMatch =
        stock === "ALL" ||
        (stock === "OUT" ? stockQty === 0 : stock === "LOW" ? stockQty > 0 && stockQty <= 10 : stockQty > 10);
      const rxMatch = rx === "ALL" || (rx === "REQUIRED" ? requiresRx : !requiresRx);

      return searchable && stockMatch && rxMatch;
    });
  }, [medicineList, search, stock, rx]);

  const openModal = (med: Record<string, unknown> | "NEW") => {
    if (med === "NEW") {
      setFormName("");
      setFormGeneric("");
      setFormStrength("");
      setFormCategory("");
      setFormManufacturer("");
      setFormPrice("");
      setFormStock("");
      setFormRx(false);
      setEditing("NEW");
    } else {
      setFormName(String(med.name ?? ""));
      setFormGeneric(String(med.genericName ?? med.description ?? ""));
      setFormStrength(String(med.strength ?? ""));
      setFormCategory(String(med.category ?? med.dosageForm ?? ""));
      setFormManufacturer(String(med.manufacturer ?? ""));
      setFormPrice(String(med.price ?? ""));
      setFormStock(String(med.stockQuantity ?? med.stock ?? ""));
      setFormRx(Boolean(med.requiresPrescription));
      setEditing(med);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      toast.error("Please fill in medicine name and price.");
      return;
    }

    try {
      if (editing === "NEW") {
        await createMedicine({
          name: formName.trim(),
          strength: formStrength.trim() || undefined,
          description: formGeneric.trim() || undefined,
          price: Number(formPrice),
          stockQuantity: Number(formStock) || 0,
          requiresPrescription: formRx,
          dosageForm: formCategory.trim() || undefined,
          manufacturer: formManufacturer.trim() || undefined,
        }).unwrap();
        toast.success("Medicine catalog item created successfully.");
      } else if (editing) {
        const id = String(editing.id ?? editing._id);
        await updateMedicine({
          id,
          name: formName.trim(),
          strength: formStrength.trim() || undefined,
          description: formGeneric.trim() || undefined,
          price: Number(formPrice),
          stockQuantity: Number(formStock) || 0,
          requiresPrescription: formRx,
          dosageForm: formCategory.trim() || undefined,
          manufacturer: formManufacturer.trim() || undefined,
          isAvailable: true,
        }).unwrap();
        toast.success("Medicine item updated successfully.");
      }
      setEditing(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to save medicine item.");
      toast.error(message);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivating) return;
    const id = String(deactivating.id ?? deactivating._id);
    try {
      await deactivateMedicine(id).unwrap();
      toast.success("Medicine deactivated from store.");
      setDeactivating(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to deactivate medicine.");
      toast.error(message);
    }
  };

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Store management"
        title="Medicine inventory"
        description="Review catalog availability, stock health, prescription rules, and medicine details."
        action={
          <Button onClick={() => openModal("NEW")}>
            <Plus className="size-4" /> Add medicine
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load medicines from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_210px]">
          <label className="relative">
            <span className="sr-only">Search medicines</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search medicine or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Stock status</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            >
              <option value="ALL">All stock levels</option>
              <option value="HEALTHY">Healthy stock (&gt;10)</option>
              <option value="LOW">Low stock (1-10)</option>
              <option value="OUT">Out of stock (0)</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Prescription rule</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={rx}
              onChange={(event) => setRx(event.target.value)}
            >
              <option value="ALL">All prescription rules</option>
              <option value="REQUIRED">Prescription required</option>
              <option value="OTC">No prescription (OTC)</option>
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading medicine catalog...
          </div>
        </div>
      ) : medicines.length === 0 ? (
        <AdminEmptyState title="No medicines found" description="Try adjusting the current search or filter." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Prescription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => {
                const id = String(medicine.id ?? medicine._id);
                const stockQty = Number(medicine.stockQuantity ?? medicine.stock ?? 0);
                const isAvail = medicine.isAvailable !== false;
                const strength = medicine.strength ? String(medicine.strength) : "";
                const generic = String(medicine.description ?? medicine.genericName ?? "-");
                const manufacturer = medicine.manufacturer ? ` · ${String(medicine.manufacturer)}` : "";

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <p className="font-semibold text-[#163A5F]">
                        {String(medicine.name ?? "")} {strength ? `(${strength})` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {generic}
                        {manufacturer}
                      </p>
                    </TableCell>
                    <TableCell>{String(medicine.category ?? medicine.dosageForm ?? "General")}</TableCell>
                    <TableCell>BDT {Number(medicine.price ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          stockQty === 0
                            ? "text-rose-600"
                            : stockQty <= 10
                              ? "text-amber-700"
                              : "text-emerald-700"
                        }`}
                      >
                        {stockQty === 0 ? "Out of stock" : stockQty <= 10 ? `${stockQty} · Low` : stockQty}
                      </span>
                    </TableCell>
                    <TableCell>
                      {medicine.requiresPrescription ? (
                        <StatusBadge value="REQUIRED" />
                      ) : (
                        <span className="text-sm text-slate-500">OTC</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={isAvail ? "ACTIVE" : "INACTIVE"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(medicine)}
                          aria-label={`Edit ${String(medicine.name)}`}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeactivating(medicine)}
                          disabled={!isAvail}
                          aria-label={`Deactivate ${String(medicine.name)}`}
                        >
                          <ShieldOff className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing === "NEW" ? "Add New Medicine" : "Edit Medicine"}</DialogTitle>
            <DialogDescription>
              {editing === "NEW"
                ? "Enter product details to add to catalog."
                : "Update pricing, inventory, and prescription requirements."}
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="medicine-name">Medicine Name *</Label>
              <Input
                id="medicine-name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Hydrocortisone 1% Cream"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generic-name">Description / Generic</Label>
              <Input
                id="generic-name"
                value={formGeneric}
                onChange={(e) => setFormGeneric(e.target.value)}
                placeholder="e.g. Hydrocortisone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strength">Strength / Unit</Label>
              <Input
                id="strength"
                value={formStrength}
                onChange={(e) => setFormStrength(e.target.value)}
                placeholder="e.g. 15g or 500mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category / Dosage Form</Label>
              <Input
                id="category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Cream, Tablet, Gel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formManufacturer}
                onChange={(e) => setFormManufacturer(e.target.value)}
                placeholder="e.g. Square Pharmaceuticals"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (BDT) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="any"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={formRx}
                onChange={(e) => setFormRx(e.target.checked)}
                className="size-4 rounded border-slate-300 accent-[#0F888D]"
              />
              Prescription required
            </label>
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Saving..." : "Save Medicine"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation dialog */}
      <Dialog open={Boolean(deactivating)} onOpenChange={(open) => !open && setDeactivating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate medicine?</DialogTitle>
            <DialogDescription>
              {String(deactivating?.name ?? "This medicine")} will be deactivated and no longer available in the store catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeactivating(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeactivating} onClick={handleDeactivate}>
              {isDeactivating ? "Deactivating..." : "Deactivate Medicine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
