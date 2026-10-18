"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CheckCircle2, Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState([
    { id: 1, day: "Monday", start: "09:00", end: "17:00" },
    { id: 2, day: "Tuesday", start: "09:00", end: "17:00" },
    { id: 3, day: "Wednesday", start: "09:00", end: "12:00" },
    { id: 4, day: "Thursday", start: "09:00", end: "17:00" },
    { id: 5, day: "Friday", start: "09:00", end: "17:00" },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ day: "", start: "", end: "" });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.start || !newSlot.end) {
      alert("Please fill all fields");
      return;
    }
    const slot = {
      id: Date.now(),
      day: newSlot.day,
      start: newSlot.start,
      end: newSlot.end,
    };
    setAvailability([...availability, slot]);
    setNewSlot({ day: "", start: "", end: "" });
    alert("Availability added");
  };

  const handleUpdateSlot = (id: number, day: string, start: string, end: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, day, start, end } : slot
      )
    );
    setEditingId(null);
    alert("Availability updated");
  };

  const handleDeleteSlot = (id: number) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
    alert("Availability removed");
  };

  const handleStartEdit = (id: number) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Availability Manager</h1>
        <p className="text-white/60 mt-1">
          Manage your working hours and appointment slots
        </p>
      </div>

      {/* Add New Slot Form */}
      <Card className="bg-background mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-white">Add Availability Slot</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="daySelect" className="mb-2 block text-white/60">
                Day
              </label>
              <select
                id="daySelect"
                value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                className="block w-full rounded bg-background/50 border border-white/20 px-3 py-2 text-white"
              >
                <option value="">Select a day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startTime" className="mb-2 block text-white/60">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={newSlot.start}
                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                className="block w-full rounded bg-background/50 border border-white/20 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="mb-2 block text-white/60">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={newSlot.end}
                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                className="block w-full rounded bg-background/50 border border-white/20 px-3 py-2 text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleAddSlot}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Slot
          </Button>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card className="bg-background">
        <CardHeader>
          <h2 className="text-lg font-bold text-white">Current Availability</h2>
        </CardHeader>
        <CardContent>
          {availability.length > 0 ? (
            <div className="space-y-4">
              {availability.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-between justify-between p-4 bg-background/50 rounded-lg"
                >
                  <div className="flex-1 space-x-3">
                    <div className="flex items-center space-x-3">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                      <div>
                        <h3 className="font-medium text-white">{slot.day}</h3>
                        <p className="text-white/60 text-sm">
                          {slot.start} - {slot.end}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingId === slot.id ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const start = prompt("Enter start time (HH:MM)", slot.start);
                            const end = prompt("Enter end time (HH:MM)", slot.end);
                            if (start && end) {
                              handleUpdateSlot(slot.id, slot.day, start, end);
                            }
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelEdit}
                          className="h-8 w-8"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleStartEdit(slot.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-white/60">
              No availability set. Add your first slot above.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
