"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pill, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePrescriptionMutation,
  useFinalizePrescriptionMutation,
} from "@/redux/api/doctorApi";
import { getApiErrorMessage } from "@/lib/doctor/utils";
import type { PrescriptionItem } from "@/types/doctor";

interface PrescriptionDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditableItem {
  key: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  instructions: string;
}

function emptyItem(): EditableItem {
  return {
    key: Math.random().toString(36).slice(2),
    medicineName: "",
    dosage: "",
    frequency: "",
    durationDays: "7",
    instructions: "",
  };
}

function extractPrescriptionId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const envelope = data as { data?: unknown };
  const body =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : (data as Record<string, unknown>);
  const id =
    body.id ?? body.prescriptionId ?? (body.prescription as Record<string, unknown> | undefined)?.id;
  return typeof id === "string" ? id : undefined;
}

/**
 * Creates a prescription through the real backend contract:
 *  - `POST /appointments/{id}/prescriptions` (draft)
 *  - optional `POST /prescriptions/{id}/finalize` (immutable submission)
 */
export function PrescriptionDialog({
  appointmentId,
  open,
  onOpenChange,
}: PrescriptionDialogProps) {
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [items, setItems] = useState<EditableItem[]>([emptyItem()]);
  const [alsoFinalize, setAlsoFinalize] = useState(true);

  const [createPrescription, createState] = useCreatePrescriptionMutation();
  const [finalizePrescription] = useFinalizePrescriptionMutation();

  const isSubmitting = createState.isLoading;

  function updateItem(key: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function reset() {
    setDiagnosis("");
    setDoctorNotes("");
    setItems([emptyItem()]);
    setAlsoFinalize(true);
  }

  async function handleSubmit() {
    const cleanItems: PrescriptionItem[] = items
      .filter((it) => it.medicineName.trim())
      .map((it) => ({
        medicineName: it.medicineName.trim(),
        dosage: it.dosage.trim() || "As directed",
        frequency: it.frequency.trim() || "As directed",
        durationDays: Number(it.durationDays) || 1,
        instructions: it.instructions.trim() || undefined,
      }));

    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis before saving the prescription.");
      return;
    }
    if (cleanItems.length === 0) {
      toast.error("Add at least one medication item.");
      return;
    }

    try {
      const created = await createPrescription({
        appointmentId,
        diagnosis: diagnosis.trim(),
        doctorNotes: doctorNotes.trim() || undefined,
        items: cleanItems,
      }).unwrap();

      const prescriptionId = extractPrescriptionId(created);

      if (alsoFinalize && prescriptionId) {
        await finalizePrescription(prescriptionId).unwrap();
        toast.success("Prescription finalized and submitted.");
      } else if (alsoFinalize && !prescriptionId) {
        toast.success("Prescription draft saved.");
        toast.message("Finalize it from the prescriptions list once the id is available.");
      } else {
        toast.success("Prescription draft saved.");
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      // A failed real request must never look like success.
      toast.error(getApiErrorMessage(error, "Could not save the prescription."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#163A5F]">
            <Pill size={18} className="text-[#0F888D]" /> New prescription
          </DialogTitle>
          <DialogDescription>
            Create a digital prescription for this consultation. Finalizing locks
            the version and unlocks medicine ordering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rx-diagnosis">Diagnosis *</Label>
            <Input
              id="rx-diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Atopic dermatitis (mild)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rx-notes">Doctor notes</Label>
            <Textarea
              id="rx-notes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Advice, cautions, follow-up…"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medication items *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((prev) => [...prev, emptyItem()])}
              >
                <Plus size={14} /> Add item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={item.key}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2"
              >
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Medicine name</Label>
                  <Input
                    value={item.medicineName}
                    onChange={(e) => updateItem(item.key, { medicineName: e.target.value })}
                    placeholder="e.g. Hydrocortisone 1% Cream"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dosage</Label>
                  <Input
                    value={item.dosage}
                    onChange={(e) => updateItem(item.key, { dosage: e.target.value })}
                    placeholder="e.g. Thin layer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Input
                    value={item.frequency}
                    onChange={(e) => updateItem(item.key, { frequency: e.target.value })}
                    placeholder="e.g. Twice daily"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.durationDays}
                    onChange={(e) => updateItem(item.key, { durationDays: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instructions</Label>
                  <Input
                    value={item.instructions}
                    onChange={(e) => updateItem(item.key, { instructions: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                {items.length > 1 && (
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() =>
                        setItems((prev) => prev.filter((it) => it.key !== item.key))
                      }
                    >
                      <Trash2 size={14} /> Remove item {index + 1}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={alsoFinalize}
              onChange={(e) => setAlsoFinalize(e.target.checked)}
              className="size-4 rounded border-slate-300 accent-[#0F888D]"
            />
            Finalize immediately (makes the prescription immutable)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#0F888D] hover:bg-[#0C7479]"
          >
            {isSubmitting ? "Saving…" : alsoFinalize ? "Create & finalize" : "Save draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
