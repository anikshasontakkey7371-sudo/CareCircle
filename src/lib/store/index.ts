import {
  Medication,
  DoseLog,
  CareCircle,
  Appointment,
  ActivityAuditLog,
  AdherenceMetrics,
} from "@/types";
import { calculateAdherenceMetrics } from "../utils/adherence";
import { hashPasscode, generateSalt } from "../utils/passcode";
import { isFirebaseAdminConfigured, adminDb } from "../firebase/admin";

// Realistic pre-seeded CareCircle data
const DEMO_SENIOR_ID = "eleanor-vance-78";
const DEMO_CIRCLE_ID = "circle-vance-901";
const DEMO_PIN = "482915";
const DEMO_SALT = "a4f89d93e120bc764d8a192837465abc";
const DEMO_PIN_HASH = hashPasscode(DEMO_PIN, DEMO_SALT);

let inMemoryCircle: CareCircle = {
  id: DEMO_CIRCLE_ID,
  elderlyUserId: DEMO_SENIOR_ID,
  elderlyName: "Eleanor Vance",
  passcodeHash: DEMO_PIN_HASH,
  passcodeSalt: DEMO_SALT,
  emergencyPhone: "+1 (555) 234-5678",
  emergencyNotes: "Type 2 Diabetes, Mild Hypertension. Allergic to Penicillin.",
  members: [
    {
      userId: "user-sarah-1",
      displayName: "Sarah Vance",
      email: "sarah.vance@example.com",
      relationship: "primary_caregiver",
      permissions: [
        "view_meds",
        "log_meds",
        "edit_schedule",
        "view_reports",
        "receive_alerts",
      ],
      status: "active",
      joinedAt: "2026-01-10T09:00:00Z",
    },
    {
      userId: "user-david-2",
      displayName: "David Vance",
      email: "david.vance@example.com",
      relationship: "family",
      permissions: ["view_meds", "view_reports", "receive_alerts"],
      status: "active",
      joinedAt: "2026-02-14T11:00:00Z",
    },
    {
      userId: "user-nurse-rachel",
      displayName: "Nurse Rachel Miller, RN",
      email: "rachel.miller@springfieldcare.org",
      relationship: "nurse",
      permissions: ["view_meds", "log_meds", "view_reports"],
      status: "active",
      joinedAt: "2026-03-01T08:30:00Z",
    },
  ],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-11-15T08:00:00Z",
};

let inMemoryMedications: Medication[] = [
  {
    id: "med-metformin-1",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Metformin",
    dosage: "500 mg",
    unit: "Tablet",
    instructions: "Take 1 tablet with water immediately after breakfast and dinner",
    doctorName: "Dr. Gregory House, Endocrinologist",
    times: ["08:00", "20:00"],
    colorCode: "#C85A32",
    pillShape: "tablet",
    currentStock: 42,
    refillAlertThreshold: 10,
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-11-15T08:00:00Z",
  },
  {
    id: "med-lisinopril-2",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Lisinopril",
    dosage: "10 mg",
    unit: "Tablet",
    instructions: "Take 1 tablet in the morning with a full glass of water",
    doctorName: "Dr. Sarah Jenkins, Cardiologist",
    times: ["08:00"],
    colorCode: "#2D5A46",
    pillShape: "round",
    currentStock: 28,
    refillAlertThreshold: 7,
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-11-15T08:00:00Z",
  },
  {
    id: "med-atorvastatin-3",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Atorvastatin",
    dosage: "20 mg",
    unit: "Tablet",
    instructions: "Take 1 tablet in the evening before bed",
    doctorName: "Dr. Sarah Jenkins, Cardiologist",
    times: ["21:00"],
    colorCode: "#D99B26",
    pillShape: "oval",
    currentStock: 18,
    refillAlertThreshold: 7,
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-11-15T08:00:00Z",
  },
];

// Today's date string YYYY-MM-DD
const todayStr = new Date().toISOString().split("T")[0];

let inMemoryDoses: DoseLog[] = [
  {
    id: `dose-metformin-morning-${todayStr}`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-metformin-1",
    medicationName: "Metformin",
    dosage: "500 mg",
    scheduledTime: `${todayStr}T08:00:00`,
    status: "taken",
    loggedAt: `${todayStr}T08:12:00Z`,
    loggedBy: {
      userId: DEMO_SENIOR_ID,
      name: "Eleanor Vance",
      role: "elderly",
    },
    reminderSent: true,
  },
  {
    id: `dose-lisinopril-morning-${todayStr}`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-lisinopril-2",
    medicationName: "Lisinopril",
    dosage: "10 mg",
    scheduledTime: `${todayStr}T08:00:00`,
    status: "taken",
    loggedAt: `${todayStr}T08:14:00Z`,
    loggedBy: {
      userId: DEMO_SENIOR_ID,
      name: "Eleanor Vance",
      role: "elderly",
    },
    reminderSent: true,
  },
  {
    id: `dose-metformin-evening-${todayStr}`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-metformin-1",
    medicationName: "Metformin",
    dosage: "500 mg",
    scheduledTime: `${todayStr}T20:00:00`,
    status: "pending",
    reminderSent: false,
    missedAlertSent: false,
  },
  {
    id: `dose-atorvastatin-night-${todayStr}`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-atorvastatin-3",
    medicationName: "Atorvastatin",
    dosage: "20 mg",
    scheduledTime: `${todayStr}T21:00:00`,
    status: "pending",
    reminderSent: false,
    missedAlertSent: false,
  },
];

let inMemoryAppointments: Appointment[] = [
  {
    id: "appt-cardiology-1",
    elderlyUserId: DEMO_SENIOR_ID,
    title: "Cardiologist Blood Pressure & EKG Follow-up",
    doctorName: "Dr. Sarah Jenkins",
    clinicAddress: "Springfield General Hospital, Suite 402, Medical Wing",
    dateTime: "2026-11-20T10:30:00",
    transportationRequired: true,
    accompaniedBy: "Sarah Vance (Daughter)",
    notes: "Bring current medication log and recent BP readings.",
    status: "upcoming",
    reminderSent: false,
    createdAt: "2026-11-01T12:00:00Z",
  },
  {
    id: "appt-eye-2",
    elderlyUserId: DEMO_SENIOR_ID,
    title: "Annual Diabetic Retinopathy Eye Exam",
    doctorName: "Dr. Robert Chen, OD",
    clinicAddress: "Evergreen Eye Institute, 120 Oak Lane",
    dateTime: "2026-12-05T14:00:00",
    transportationRequired: true,
    accompaniedBy: "David Vance (Son)",
    notes: "Eyes will be dilated; driver required for return trip.",
    status: "upcoming",
    reminderSent: false,
    createdAt: "2026-11-05T15:00:00Z",
  },
];

let inMemoryAuditLogs: ActivityAuditLog[] = [
  {
    id: "audit-1",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: DEMO_SENIOR_ID,
    actorName: "Eleanor Vance",
    action: "DOSE_TAKEN",
    details: { medicationName: "Metformin", dosage: "500 mg", period: "Morning" },
    timestamp: `${todayStr}T08:12:00Z`,
  },
  {
    id: "audit-2",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: DEMO_SENIOR_ID,
    actorName: "Eleanor Vance",
    action: "DOSE_TAKEN",
    details: { medicationName: "Lisinopril", dosage: "10 mg", period: "Morning" },
    timestamp: `${todayStr}T08:14:00Z`,
  },
  {
    id: "audit-3",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: "user-sarah-1",
    actorName: "Sarah Vance",
    action: "PASSCODE_VERIFIED",
    details: { channel: "Senior Tablet Login" },
    timestamp: `${todayStr}T07:45:00Z`,
  },
];

/**
 * CareCircle Repository
 */
export const CareCircleRepository = {
  getCircle: async (circleId: string = DEMO_CIRCLE_ID): Promise<CareCircle> => {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb.collection("care_circles").doc(circleId).get();
        if (snap.exists) return snap.data() as CareCircle;
      } catch {}
    }
    return inMemoryCircle;
  },

  updateCirclePasscode: async (
    circleId: string,
    newPin: string
  ): Promise<{ pin: string; hash: string }> => {
    const salt = generateSalt();
    const hash = hashPasscode(newPin, salt);
    inMemoryCircle.passcodeHash = hash;
    inMemoryCircle.passcodeSalt = salt;
    inMemoryCircle.updatedAt = new Date().toISOString();

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("care_circles").doc(circleId).update({
          passcodeHash: hash,
          passcodeSalt: salt,
          updatedAt: inMemoryCircle.updatedAt,
        });
      } catch {}
    }

    // Add audit log
    await CareCircleRepository.addAuditLog({
      elderlyUserId: inMemoryCircle.elderlyUserId,
      circleId,
      actorId: "caregiver-admin",
      actorName: "Caregiver Admin",
      action: "PERMISSION_UPDATED",
      details: { action: "Regenerated 6-digit access code" },
    });

    return { pin: newPin, hash };
  },

  addCircleMember: async (
    email: string,
    relationship: "family" | "nurse" | "doctor"
  ): Promise<boolean> => {
    const newMember = {
      userId: `member-${Date.now()}`,
      displayName: email.split("@")[0],
      email,
      relationship: relationship as any,
      permissions: ["view_meds", "view_reports", "receive_alerts"] as any,
      status: "active" as const,
      joinedAt: new Date().toISOString(),
    };
    inMemoryCircle.members.push(newMember);

    await CareCircleRepository.addAuditLog({
      elderlyUserId: inMemoryCircle.elderlyUserId,
      circleId: inMemoryCircle.id,
      actorId: "caregiver-admin",
      actorName: "Caregiver Admin",
      action: "CAREGIVER_INVITED",
      details: { email, relationship },
    });

    return true;
  },

  getMedications: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<Medication[]> => {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb
          .collection("medications")
          .where("elderlyUserId", "==", elderlyUserId)
          .where("isActive", "==", true)
          .get();
        if (!snap.empty) {
          return snap.docs.map((doc) => doc.data() as Medication);
        }
      } catch {}
    }
    return inMemoryMedications.filter((m) => m.isActive);
  },

  saveMedication: async (med: Partial<Medication>): Promise<Medication> => {
    const id = med.id || `med-${Date.now()}`;
    const now = new Date().toISOString();
    const fullMed: Medication = {
      id,
      elderlyUserId: med.elderlyUserId || DEMO_SENIOR_ID,
      name: med.name || "Medication",
      dosage: med.dosage || "",
      unit: med.unit || "Tablet",
      instructions: med.instructions || "",
      doctorName: med.doctorName,
      times: med.times || ["08:00"],
      colorCode: med.colorCode || "#C85A32",
      pillShape: med.pillShape || "tablet",
      currentStock: med.currentStock ?? 30,
      refillAlertThreshold: med.refillAlertThreshold ?? 7,
      isActive: true,
      createdAt: med.createdAt || now,
      updatedAt: now,
    };

    const existingIndex = inMemoryMedications.findIndex((m) => m.id === id);
    if (existingIndex >= 0) {
      inMemoryMedications[existingIndex] = fullMed;
    } else {
      inMemoryMedications.push(fullMed);
    }

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("medications").doc(id).set(fullMed);
      } catch {}
    }

    await CareCircleRepository.addAuditLog({
      elderlyUserId: fullMed.elderlyUserId,
      actorId: "caregiver-admin",
      actorName: "Caregiver Admin",
      action: existingIndex >= 0 ? "MEDICATION_UPDATED" : "MEDICATION_ADDED",
      details: { name: fullMed.name, dosage: fullMed.dosage },
    });

    return fullMed;
  },

  deleteMedication: async (medId: string): Promise<boolean> => {
    const med = inMemoryMedications.find((m) => m.id === medId);
    if (med) {
      med.isActive = false;
      med.updatedAt = new Date().toISOString();
      await CareCircleRepository.addAuditLog({
        elderlyUserId: med.elderlyUserId,
        actorId: "caregiver-admin",
        actorName: "Caregiver Admin",
        action: "MEDICATION_DEACTIVATED",
        details: { medicationName: med.name },
      });
      return true;
    }
    return false;
  },

  getDosesForToday: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<DoseLog[]> => {
    // Generate any missing scheduled doses for today deterministically
    const meds = await CareCircleRepository.getMedications(elderlyUserId);
    for (const med of meds) {
      for (const time of med.times) {
        const doseId = `dose-${med.id}-${todayStr}-${time.replace(":", "-")}`;
        const existing = inMemoryDoses.find((d) => d.id === doseId);
        if (!existing) {
          inMemoryDoses.push({
            id: doseId,
            elderlyUserId,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            scheduledTime: `${todayStr}T${time}:00`,
            status: "pending",
            reminderSent: false,
            missedAlertSent: false,
          });
        }
      }
    }
    return inMemoryDoses.filter((d) => d.elderlyUserId === elderlyUserId);
  },

  updateDoseStatus: async (
    logId: string,
    status: "taken" | "skipped" | "missed",
    loggedByRole: "elderly" | "caregiver" = "elderly"
  ): Promise<DoseLog | null> => {
    const dose = inMemoryDoses.find((d) => d.id === logId);
    if (!dose) return null;

    const now = new Date().toISOString();
    dose.status = status;
    dose.loggedAt = now;
    dose.loggedBy = {
      userId: DEMO_SENIOR_ID,
      name: inMemoryCircle.elderlyName,
      role: loggedByRole,
    };

    // If dose was taken, decrement pill stock
    if (status === "taken") {
      const med = inMemoryMedications.find((m) => m.id === dose.medicationId);
      if (med && med.currentStock > 0) {
        med.currentStock -= 1;
      }
    }

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("dose_logs").doc(logId).set(dose, { merge: true });
      } catch {}
    }

    await CareCircleRepository.addAuditLog({
      elderlyUserId: dose.elderlyUserId,
      actorId: DEMO_SENIOR_ID,
      actorName: inMemoryCircle.elderlyName,
      action: status === "taken" ? "DOSE_TAKEN" : "DOSE_SKIPPED",
      details: {
        medicationName: dose.medicationName,
        dosage: dose.dosage,
        scheduledTime: dose.scheduledTime,
      },
    });

    return dose;
  },

  getAdherenceMetrics: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<AdherenceMetrics> => {
    const doses = await CareCircleRepository.getDosesForToday(elderlyUserId);
    return calculateAdherenceMetrics(doses);
  },

  getAppointments: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<Appointment[]> => {
    return inMemoryAppointments.filter((a) => a.elderlyUserId === elderlyUserId);
  },

  saveAppointment: async (
    appt: Partial<Appointment>
  ): Promise<Appointment> => {
    const id = appt.id || `appt-${Date.now()}`;
    const fullAppt: Appointment = {
      id,
      elderlyUserId: appt.elderlyUserId || DEMO_SENIOR_ID,
      title: appt.title || "Medical Appointment",
      doctorName: appt.doctorName || "",
      clinicAddress: appt.clinicAddress || "",
      dateTime: appt.dateTime || new Date().toISOString(),
      transportationRequired: Boolean(appt.transportationRequired),
      accompaniedBy: appt.accompaniedBy,
      notes: appt.notes,
      status: "upcoming",
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    inMemoryAppointments.push(fullAppt);

    await CareCircleRepository.addAuditLog({
      elderlyUserId: fullAppt.elderlyUserId,
      actorId: "caregiver-admin",
      actorName: "Caregiver Admin",
      action: "APPOINTMENT_SCHEDULED",
      details: { title: fullAppt.title, doctor: fullAppt.doctorName },
    });

    return fullAppt;
  },

  getAuditLogs: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<ActivityAuditLog[]> => {
    return [...inMemoryAuditLogs].reverse();
  },

  addAuditLog: async (
    log: Omit<ActivityAuditLog, "id" | "timestamp">
  ): Promise<ActivityAuditLog> => {
    const entry: ActivityAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    };
    inMemoryAuditLogs.push(entry);
    return entry;
  },
};
