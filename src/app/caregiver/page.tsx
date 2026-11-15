"use client";

import React, { useEffect, useState } from "react";
import {
  Medication,
  DoseLog,
  CareCircle,
  Appointment,
  ActivityAuditLog,
  AdherenceMetrics,
} from "@/types";
import { AdherenceGauge } from "@/components/caregiver/AdherenceGauge";
import { PasscodeManager } from "@/components/caregiver/PasscodeManager";
import { MedicationForm } from "@/components/caregiver/MedicationForm";
import {
  Pill,
  Calendar,
  Users,
  History,
  Plus,
  BellRing,
  AlertTriangle,
  MapPin,
  Clock,
  Trash2,
  Edit,
  CheckCircle,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function CaregiverPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "medications" | "appointments" | "circle" | "history"
  >("overview");

  const [metrics, setMetrics] = useState<AdherenceMetrics>({
    totalScheduled: 4,
    taken: 2,
    skipped: 0,
    missed: 0,
    pending: 2,
    adherencePercentage: 100,
  });

  const [medications, setMedications] = useState<Medication[]>([]);
  const [doses, setDoses] = useState<DoseLog[]>([]);
  const [circle, setCircle] = useState<CareCircle | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);

  // New Appointment Form state
  const [showApptForm, setShowApptForm] = useState(false);
  const [apptTitle, setApptTitle] = useState("");
  const [apptDoctor, setApptDoctor] = useState("");
  const [apptAddress, setApptAddress] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTransport, setApptTransport] = useState(true);
  const [apptEscort, setApptEscort] = useState("Priya Sharma (Daughter)");

  const loadAllData = async () => {
    try {
      const [dosesRes, medsRes, circleRes, apptsRes] = await Promise.all([
        fetch("/api/doses"),
        fetch("/api/medications"),
        fetch("/api/circle"),
        fetch("/api/appointments"),
      ]);

      if (dosesRes.ok) {
        const data = await dosesRes.json();
        setDoses(data.doses || []);
        if (data.metrics) setMetrics(data.metrics);
      }
      if (medsRes.ok) {
        const data = await medsRes.json();
        setMedications(data.medications || []);
      }
      if (circleRes.ok) {
        const data = await circleRes.json();
        setCircle(data.circle || null);
        setAuditLogs(data.auditLogs || []);
      }
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.warn("Failed to fetch caregiver records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveMedication = async (med: Partial<Medication>) => {
    const isEdit = Boolean(med.id);
    const endpoint = isEdit ? `/api/medications/${med.id}` : "/api/medications";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(med),
    });
    if (res.ok) {
      loadAllData();
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!window.confirm("Are you sure you want to discontinue this medication?")) {
      return;
    }
    const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAllData();
    }
  };

  const handleResetPasscode = async (): Promise<string | null> => {
    const res = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_passcode" }),
    });
    if (res.ok) {
      const data = await res.json();
      loadAllData();
      return data.newPin;
    }
    return null;
  };

  const handleInviteMember = async (
    email: string,
    relationship: string
  ): Promise<boolean> => {
    const res = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "invite_member",
        email,
        relationship,
      }),
    });
    if (res.ok) {
      loadAllData();
      return true;
    }
    return false;
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptTitle.trim() || !apptDoctor.trim() || !apptDate) return;

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: apptTitle.trim(),
        doctorName: apptDoctor.trim(),
        clinicAddress: apptAddress.trim(),
        dateTime: apptDate,
        transportationRequired: apptTransport,
        accompaniedBy: apptEscort,
      }),
    });

    if (res.ok) {
      setShowApptForm(false);
      setApptTitle("");
      setApptDoctor("");
      setApptAddress("");
      loadAllData();
    }
  };

  const handleTriggerCronReminders = async () => {
    setCronRunning(true);
    setCronStatus(null);
    try {
      const res = await fetch("/api/cron/reminders", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer carecircle_secure_cron_token_change_in_production",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCronStatus(
          `Idempotent Check Complete: ${data.totalDosesChecked} doses checked. Dispatched ${data.remindersDispatched} upcoming reminders, ${data.missedAlertsDispatched} missed-dose alerts.`
        );
        loadAllData();
      } else {
        setCronStatus(`Error: ${data.error}`);
      }
    } catch {
      setCronStatus("Failed to trigger automated reminder job.");
    } finally {
      setCronRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-terracotta-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Care Circle Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight mt-1">
            Care for {circle?.elderlyName || "Asha Sharma"}
          </h1>
          <p className="text-sm font-semibold text-charcoal-800 mt-1">
            Primary Contact: {circle?.emergencyPhone} &bull; {circle?.emergencyNotes}
          </p>
        </div>

        {/* Quick Action: Trigger Reminder Cron */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={cronRunning}
            onClick={handleTriggerCronReminders}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <BellRing className={`w-4 h-4 ${cronRunning ? "animate-bounce" : ""}`} />
            <span>{cronRunning ? "Processing..." : "Run Reminder Check"}</span>
          </button>
        </div>
      </div>

      {cronStatus && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-300 text-sage-900 font-bold text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-sage-700 shrink-0" />
          <span>{cronStatus}</span>
        </div>
      )}

      {/* Primary Adherence Overview Card */}
      <AdherenceGauge metrics={metrics} />

      {/* Navigation Tabs */}
      <nav
        aria-label="Caregiver dashboard sections"
        className="flex items-center gap-2 border-b border-parchment-300 overflow-x-auto pb-1"
      >
        {[
          { id: "overview", label: "Today's Doses", icon: Clock },
          { id: "medications", label: "Medication Schedules", icon: Pill },
          { id: "appointments", label: "Doctor Appointments", icon: Calendar },
          { id: "circle", label: "Passcode & Family", icon: Users },
          { id: "history", label: "Care Activity History", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "bg-white text-terracotta-700 border-terracotta-600 shadow-sm"
                  : "text-charcoal-800 hover:text-charcoal-900 border-transparent hover:bg-parchment-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab 1: Today's Doses Overview */}
      {activeTab === "overview" && (
        <section aria-label="Today's Dose Timeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-charcoal-900">
              Today&apos;s Medication Timeline
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-parchment-200 text-charcoal-800">
              {doses.length} total doses scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doses.map((dose) => {
              const isTaken = dose.status === "taken";
              const isMissed = dose.status === "missed";
              const isPending = dose.status === "pending";

              return (
                <div
                  key={dose.id}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                    isTaken
                      ? "bg-sage-50/70 border-sage-300"
                      : isMissed
                      ? "bg-terracotta-50/70 border-terracotta-300"
                      : "bg-white border-parchment-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">
                      {dose.scheduledTime.includes("T")
                        ? dose.scheduledTime.split("T")[1].substring(0, 5)
                        : dose.scheduledTime}
                    </span>
                    <h3 className="text-xl font-black text-charcoal-900">
                      {dose.medicationName} ({dose.dosage})
                    </h3>
                    <p className="text-xs text-charcoal-800 font-medium">
                      Status:{" "}
                      <strong className="capitalize text-charcoal-900">
                        {dose.status}
                      </strong>{" "}
                      {dose.loggedAt &&
                        `at ${new Date(dose.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      isTaken
                        ? "bg-sage-600 text-white"
                        : isMissed
                        ? "bg-terracotta-600 text-white"
                        : "bg-ochre-100 text-ochre-800 border border-ochre-300"
                    }`}
                  >
                    {dose.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab 2: Medications Management */}
      {activeTab === "medications" && (
        <section aria-label="Prescriptions and Schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-charcoal-900">
                Prescription Schedules &amp; Refill Inventory
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Configure dosage times and monitor remaining pill counts
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMed(undefined);
                setMedModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-black text-sm shadow-md btn-tactile"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => {
              const isLowStock = med.currentStock <= med.refillAlertThreshold;
              return (
                <div
                  key={med.id}
                  className="bg-white rounded-3xl p-6 border-2 border-parchment-300 shadow-warm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: `${med.colorCode}25` }}
                        >
                          <div
                            className="w-5 h-3 rounded-full"
                            style={{ backgroundColor: med.colorCode }}
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-charcoal-900 leading-snug">
                            {med.name}
                          </h3>
                          <span className="text-xs font-bold text-terracotta-700">
                            {med.dosage} &bull; {med.unit}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedication(med.id)}
                        className="text-parchment-400 hover:text-terracotta-600 p-1"
                        aria-label={`Discontinue ${med.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-charcoal-800 font-medium">
                      <strong>Instructions:</strong> {med.instructions}
                    </div>

                    {med.doctorName && (
                      <div className="text-xs text-charcoal-800">
                        <strong>Doctor:</strong> {med.doctorName}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-charcoal-800">Times:</span>
                      {med.times.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-parchment-200 text-charcoal-900 font-bold text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Refill Stock Indicator */}
                  <div className="pt-3 border-t border-parchment-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-charcoal-800">In Stock: </span>
                      <strong
                        className={`text-sm ${
                          isLowStock ? "text-terracotta-600 font-black" : "text-charcoal-900"
                        }`}
                      >
                        {med.currentStock} {med.unit.toLowerCase()}s
                      </strong>
                    </div>

                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 text-terracotta-700 font-black bg-terracotta-50 px-2 py-0.5 rounded-md border border-terracotta-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Refill Needed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === "appointments" && (
        <section aria-label="Medical Appointments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-charcoal-900">
                Medical Appointments &amp; Transportation
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Coordinate clinic visits, escort drivers, and medical agendas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowApptForm(!showApptForm)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-black text-sm shadow-md btn-tactile"
            >
              <Plus className="w-5 h-5" />
              <span>{showApptForm ? "Cancel" : "New Appointment"}</span>
            </button>
          </div>

          {showApptForm && (
            <form
              onSubmit={handleAddAppointment}
              className="bg-white rounded-3xl p-6 border-2 border-terracotta-300 shadow-warm space-y-4"
            >
              <h3 className="text-lg font-black text-charcoal-900">
                Schedule Doctor Visit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-800 mb-1">
                    Appointment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiologist Checkup"
                    value={apptTitle}
                    onChange={(e) => setApptTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-800 mb-1">
                    Doctor / Specialist Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={apptDoctor}
                    onChange={(e) => setApptDoctor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-800 mb-1">
                    Clinic Address &amp; Suite
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Springfield Memorial Hospital, Suite 402"
                    value={apptAddress}
                    onChange={(e) => setApptAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-800 mb-1">
                    Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 font-semibold bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={apptTransport}
                    onChange={(e) => setApptTransport(e.target.checked)}
                    className="w-5 h-5 rounded text-terracotta-600 focus:ring-terracotta-500"
                  />
                  <span className="text-sm font-bold text-charcoal-900">
                    Transportation &amp; Ride Needed
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal-800">Escort:</span>
                  <input
                    type="text"
                    value={apptEscort}
                    onChange={(e) => setApptEscort(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-parchment-300 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-black text-sm shadow-md btn-tactile"
              >
                Save Appointment
              </button>
            </form>
          )}

          <div className="space-y-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-3xl p-6 border-2 border-parchment-300 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-parchment-200 text-charcoal-900 font-extrabold text-xs">
                      {new Date(appt.dateTime).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {appt.transportationRequired && (
                      <span className="px-3 py-1 rounded-full bg-ochre-100 text-ochre-800 font-extrabold text-xs border border-ochre-200">
                        Ride Needed
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-charcoal-900">
                    {appt.title}
                  </h3>
                  <p className="text-sm font-bold text-terracotta-700">
                    Physician: {appt.doctorName}
                  </p>
                  {appt.clinicAddress && (
                    <p className="text-xs text-charcoal-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{appt.clinicAddress}</span>
                    </p>
                  )}
                  {appt.accompaniedBy && (
                    <p className="text-xs text-charcoal-800">
                      <strong>Accompanied By:</strong> {appt.accompaniedBy}
                    </p>
                  )}
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-50 text-sage-800 font-bold text-xs border border-sage-200">
                    <CheckCircle className="w-4 h-4 text-sage-700" />
                    <span>Confirmed</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 4: Circle & Passcode */}
      {activeTab === "circle" && circle && (
        <PasscodeManager
          circle={circle}
          onResetPasscode={handleResetPasscode}
          onInviteMember={handleInviteMember}
        />
      )}

      {/* Tab 5: History Audit Trail */}
      {activeTab === "history" && (
        <section aria-label="Care Activity History" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-charcoal-900">
                Care Activity History &amp; Audit Trail
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Full immutable record of dose confirmations, appointment updates, and caregiver alerts
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-parchment-200 text-charcoal-800">
              {auditLogs.length} audit entries
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 border border-parchment-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-charcoal-900">
                      {log.actorName}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-parchment-200 text-charcoal-800">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs text-charcoal-800 mt-1">
                    {JSON.stringify(log.details)}
                  </div>
                </div>

                <span className="text-xs font-bold text-charcoal-800 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medication Form Modal */}
      {medModalOpen && (
        <MedicationForm
          initialData={editingMed}
          onSave={handleSaveMedication}
          onClose={() => setMedModalOpen(false)}
        />
      )}
    </div>
  );
}

