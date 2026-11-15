"use client";

import React, { useState } from "react";
import { Pill, X, Plus, AlertCircle } from "lucide-react";
import { Medication, PillShape } from "@/types";

interface MedicationFormProps {
  onSave: (med: Partial<Medication>) => Promise<void>;
  onClose: () => void;
  initialData?: Medication;
}

export function MedicationForm({
  onSave,
  onClose,
  initialData,
}: MedicationFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [dosage, setDosage] = useState(initialData?.dosage || "");
  const [unit, setUnit] = useState(initialData?.unit || "Tablet");
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [doctorName, setDoctorName] = useState(initialData?.doctorName || "");
  const [times, setTimes] = useState<string[]>(
    initialData?.times || ["08:00", "20:00"]
  );
  const [newTime, setNewTime] = useState("12:00");
  const [colorCode, setColorCode] = useState(initialData?.colorCode || "#C85A32");
  const [pillShape, setPillShape] = useState<PillShape>(
    initialData?.pillShape || "tablet"
  );
  const [currentStock, setCurrentStock] = useState<number>(
    initialData?.currentStock ?? 30
  );
  const [refillAlertThreshold, setRefillAlertThreshold] = useState<number>(
    initialData?.refillAlertThreshold ?? 7
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorPalette = [
    { label: "Terracotta", value: "#C85A32" },
    { label: "Forest Sage", value: "#2D5A46" },
    { label: "Warm Ochre", value: "#D99B26" },
    { label: "Ocean Teal", value: "#2A7B88" },
    { label: "Plum Berry", value: "#8A3B68" },
    { label: "Charcoal", value: "#3A4740" },
  ];

  const handleAddTime = () => {
    if (times.includes(newTime)) return;
    setTimes([...times, newTime].sort());
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (times.length <= 1) {
      alert("A medication must have at least one scheduled daily time.");
      return;
    }
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please specify the medication name.");
      return;
    }
    if (!dosage.trim()) {
      setError("Please specify the dosage (e.g. 500mg).");
      return;
    }
    if (times.length === 0) {
      setError("Please add at least one schedule time.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        dosage: dosage.trim(),
        unit,
        instructions: instructions.trim(),
        doctorName: doctorName.trim(),
        times,
        colorCode,
        pillShape,
        currentStock: Number(currentStock),
        refillAlertThreshold: Number(refillAlertThreshold),
        isActive: true,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save medication";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="med-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-parchment-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-parchment-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center">
              <Pill className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 id="med-form-title" className="text-2xl font-black text-charcoal-900">
              {initialData ? "Edit Prescription" : "Add New Medication"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-800 hover:bg-parchment-100"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 text-terracotta-800 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-semibold text-charcoal-900 focus:ring-2 focus:ring-terracotta-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                Dosage &amp; Unit *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-parchment-300 font-semibold text-charcoal-900 focus:ring-2 focus:ring-terracotta-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-3 rounded-xl border border-parchment-300 font-bold text-sm bg-white"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Drops">Drops</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
              Instructions for Senior
            </label>
            <input
              type="text"
              placeholder="e.g. Take with a glass of water after breakfast"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-medium text-charcoal-900 focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
              Prescribing Physician (डॉक्टर का नाम)
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Rajesh Kulkarni (Cardiology, Nagpur)"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-medium text-charcoal-900 focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          {/* Daily Schedule Times */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
              Daily Schedule Times
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-200 border border-parchment-300 font-bold text-sm text-charcoal-900"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(t)}
                    className="text-terracotta-700 hover:text-terracotta-900 p-0.5 rounded-full"
                    aria-label={`Remove time ${t}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-3 py-2 rounded-xl border border-parchment-300 font-bold text-sm bg-white"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-charcoal-900 font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time</span>
              </button>
            </div>
          </div>

          {/* Pill Visual Cue */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2">
              Visual Color Cue (For Senior Recognition)
            </label>
            <div className="flex items-center gap-3">
              {colorPalette.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColorCode(c.value)}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${colorCode === c.value
                      ? "scale-110 border-charcoal-900 shadow-md ring-2 ring-terracotta-400"
                      : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Color cue ${c.label}`}
                />
              ))}
            </div>
          </div>

          {/* Pill Inventory & Refill Alert */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                Current Stock (Pills)
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-bold text-charcoal-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                Refill Alert At
              </label>
              <input
                type="number"
                min="1"
                value={refillAlertThreshold}
                onChange={(e) =>
                  setRefillAlertThreshold(parseInt(e.target.value, 10) || 0)
                }
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-bold text-charcoal-900"
              />
            </div>
          </div>

          <p className="text-xs text-charcoal-800 italic pt-2">
            Notice: Medication schedules are configured strictly under doctor oversight. CareCircle does not recommend dosages.
          </p>

          <div className="pt-4 border-t border-parchment-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-parchment-200 hover:bg-parchment-300 font-bold text-sm text-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-black text-sm shadow-md btn-tactile"
            >
              {saving ? "Saving..." : "Save Medication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

