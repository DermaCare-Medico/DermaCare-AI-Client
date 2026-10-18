"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarPlus,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";

import {
  useCreateDoctorSlotMutation,
  useDeleteDoctorSlotMutation,
  useUpdateDoctorSlotMutation,
} from "@/redux/api/doctorApi";
import { useDoctorSlots } from "@/src/hooks/useDoctorModule";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "@/lib/doctor/utils";
import type { DoctorSlot } from "@/types/doctor";

/** Converts an ISO string into the `datetime-local` input value. */
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const slotStatusMeta: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  HELD: "bg-amber-100 text-amber-800",
  BOOKED: "bg-slate-100 text-slate-600",
};

export default function DoctorAvailabilityPage() {
  const token = useAppSelector((state) => state.auth.token);
  const decoded = useDecodedToken(token);
  const doctorId = typeof decoded?.id === "string" ? decoded.id : undefined;

  const { slots, isDemo, isLoading, isError, error, refetch } =
    useDoctorSlots(doctorId);

  const [createSlot, createState] = useCreateDoctorSlotMutation();
  const [updateSlot, updateState] = useUpdateDoctorSlotMutation();
  const [deleteSlot, deleteState] = useDeleteDoctorSlotMutation();

  const [draft, setDraft] = useState({ start: "", end: "", fee: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ start: "", end: "" });

  const sorted = useMemo(
    () =>
      [...slots].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [slots]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.start || !draft.end) {
      toast.error("Please choose a start and end time.");
      return;
    }
    if (new Date(draft.end) <= new Date(draft.start)) {
      toast.error("The end time must be after the start time.");
      return;
    }

    try {
      await createSlot({
        startTime: new Date(draft.start).toISOString(),
        endTime: new Date(draft.end).toISOString(),
        fee: draft.fee ? Number(draft.fee) : undefined,
      }).unwrap();
      toast.success("Availability slot added.");
      setDraft({ start: "", end: "", fee: "" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create the slot."));
    }
  }

  async function handleUpdate(slot: DoctorSlot) {
    if (!slot.startTime || !editDraft.start || !editDraft.end) return;
    try {
      await updateSlot({
        id: slot.id,
        startTime: new Date(editDraft.start).toISOString(),
        endTime: new Date(editDraft.end).toISOString(),
      }).unwrap();
      toast.success("Slot updated.");
      setEditingId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update the slot."));
    }
  }

  async function handleDelete(slotId: string) {
    try {
      await deleteSlot(slotId).unwrap();
      toast.success("Slot removed.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not remove the slot."));
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="Availability"
        title="Consultation slots"
        description="Publish the times patients can book. Booked or held slots cannot be edited."
      />

      {isDemo && <DemoNotice className="mb-6" />}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* Add slot */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
              <CalendarPlus size={18} className="text-[#0F888D]" />
              Add a slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="slot-start">Start</Label>
                <Input
                  id="slot-start"
                  type="datetime-local"
                  value={draft.start}
                  onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slot-end">End</Label>
                <Input
                  id="slot-end"
                  type="datetime-local"
                  value={draft.end}
                  onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slot-fee">Fee (USD, optional)</Label>
                <Input
                  id="slot-fee"
                  type="number"
                  min={0}
                  value={draft.fee}
                  onChange={(e) => setDraft((d) => ({ ...d, fee: e.target.value }))}
                  placeholder="75"
                />
              </div>
              <Button
                type="submit"
                disabled={createState.isLoading}
                className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
              >
                {createState.isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CalendarPlus size={16} />
                )}
                Publish slot
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Slot list */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
              <Clock size={18} className="text-[#0F888D]" />
              Published slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataState
              isLoading={isLoading}
              isError={isError}
              error={error}
              isEmpty={sorted.length === 0}
              emptyTitle="No slots published"
              emptyMessage="Add your first availability slot so patients can book a consultation."
              onRetry={refetch}
            >
              <div className="space-y-3">
                {sorted.map((slot) => {
                  const editable = slot.status === undefined || slot.status === "AVAILABLE";
                  const isEditing = editingId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              type="datetime-local"
                              value={editDraft.start}
                              onChange={(e) =>
                                setEditDraft((d) => ({ ...d, start: e.target.value }))
                              }
                            />
                            <Input
                              type="datetime-local"
                              value={editDraft.end}
                              onChange={(e) =>
                                setEditDraft((d) => ({ ...d, end: e.target.value }))
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#0F888D] hover:bg-[#0C7479]"
                              disabled={updateState.isLoading}
                              onClick={() => handleUpdate(slot)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              <X size={14} /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#163A5F]">
                              {formatDateTime(slot.startTime)}
                            </p>
                            <p className="text-xs text-slate-400">
                              to {formatDateTime(slot.endTime)}
                              {slot.fee !== undefined ? ` · ${formatCurrency(slot.fee)}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                slotStatusMeta[slot.status ?? "AVAILABLE"] ??
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {(slot.status ?? "AVAILABLE").replace(/_/g, " ")}
                            </span>
                            {editable && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Edit slot"
                                  onClick={() => {
                                    setEditingId(slot.id);
                                    setEditDraft({
                                      start: toLocalInput(slot.startTime),
                                      end: toLocalInput(slot.endTime),
                                    });
                                  }}
                                >
                                  <Pencil size={15} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Delete slot"
                                  className="text-rose-600 hover:text-rose-700"
                                  disabled={deleteState.isLoading}
                                  onClick={() => handleDelete(slot.id)}
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DataState>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
