import {
  Medication,
  DoseLog,
  CareCircle,
  Appointment,
  ActivityAuditLog,
  AdherenceMetrics,
} from "@/types";
import { calculateAdherenceMetrics, getLocalDateString } from "../utils/adherence";
import { hashPasscode, generateSalt } from "../utils/passcode";
import { isFirebaseAdminConfigured, adminDb } from "../firebase/admin";

// Realistic Indian Demo Data for CareCircle
export const DEMO_SENIOR_ID = "asha-sharma-76";
export const DEMO_CIRCLE_ID = "circle-sharma-901";
export const DEMO_PIN = "482915";
export const DEMO_SALT = "a4f89d93e120bc764d8a192837465abc";
export const DEMO_PIN_HASH = hashPasscode(DEMO_PIN, DEMO_SALT);

// Default Indian Demonstration Location: Nagpur, Maharashtra
export const DEMO_HOME_ADDRESS =
  "Flat 402, Shanti Heights, Ramdaspeth, Nagpur, Maharashtra 440010";

let inMemoryCircle: CareCircle = {
  id: DEMO_CIRCLE_ID,
  elderlyUserId: DEMO_SENIOR_ID,
  elderlyName: "Asha Sharma",
  passcodeHash: DEMO_PIN_HASH,
  passcodeSalt: DEMO_SALT,
  emergencyPhone: "+91 98220 12345",
  emergencyNotes:
    "Type 2 Diabetes, Mild Hypertension. Allergic to Penicillin. Address: " +
    DEMO_HOME_ADDRESS,
  members: [
    {
      userId: "user-priya-1",
      displayName: "Priya Sharma",
      email: "priya.sharma@example.com",
      relationship: "primary_caregiver",
      permissions: [
        "view_meds",
        "log_meds",
        "edit_schedule",
        "view_reports",
        "receive_alerts",
      ],
      status: "active",
      joinedAt: "2026-01-10T09:00:00+05:30",
    },
    {
      userId: "user-rahul-2",
      displayName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      relationship: "family",
      permissions: ["view_meds", "view_reports", "receive_alerts"],
      status: "active",
      joinedAt: "2026-02-14T11:00:00+05:30",
    },
    {
      userId: "user-nurse-ananya",
      displayName: "Ananya Deshmukh, RN",
      email: "ananya.deshmukh@nagpurcare.example.com",
      relationship: "nurse",
      permissions: ["view_meds", "log_meds", "view_reports"],
      status: "active",
      joinedAt: "2026-03-01T08:30:00+05:30",
    },
  ],
  createdAt: "2026-01-01T00:00:00+05:30",
  updatedAt: "2026-11-15T08:00:00+05:30",
};

let inMemoryMedications: Medication[] = [
  {
    id: "med-metformin-1",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Metformin",
    dosage: "500 mg",
    unit: "Tablet",
    instructions:
      "Take 1 tablet with water immediately after breakfast and dinner",
    doctorName: "Dr. Sunita Rao, Endocrinologist",
    times: ["08:00", "20:00"],
    colorCode: "#C85A32",
    pillShape: "tablet",
    currentStock: 42,
    refillAlertThreshold: 10,
    isActive: true,
    createdAt: "2026-01-10T10:00:00+05:30",
    updatedAt: "2026-11-15T08:00:00+05:30",
  },
  {
    id: "med-lisinopril-2",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Lisinopril",
    dosage: "10 mg",
    unit: "Tablet",
    instructions: "Take 1 tablet in the morning with a full glass of water",
    doctorName: "Dr. Rajesh Kulkarni, Cardiologist",
    times: ["08:00"],
    colorCode: "#2D5A46",
    pillShape: "round",
    currentStock: 28,
    refillAlertThreshold: 7,
    isActive: true,
    createdAt: "2026-01-10T10:00:00+05:30",
    updatedAt: "2026-11-15T08:00:00+05:30",
  },
  {
    id: "med-atorvastatin-3",
    elderlyUserId: DEMO_SENIOR_ID,
    name: "Atorvastatin",
    dosage: "20 mg",
    unit: "Tablet",
    instructions: "Take 1 tablet at bedtime with water",
    doctorName: "Dr. Rajesh Kulkarni, Cardiologist",
    times: ["21:00"],
    colorCode: "#D99B26",
    pillShape: "oval",
    currentStock: 18,
    refillAlertThreshold: 7,
    isActive: true,
    createdAt: "2026-01-10T10:00:00+05:30",
    updatedAt: "2026-11-15T08:00:00+05:30",
  },
];

// Local calendar day in Asia/Kolkata
const todayLocalStr = getLocalDateString(new Date());

// Seeded today's doses using the EXACT deterministic ID format to prevent duplication
let inMemoryDoses: DoseLog[] = [
  {
    id: `dose-med-metformin-1-${todayLocalStr}-08-00`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-metformin-1",
    medicationName: "Metformin",
    dosage: "500 mg",
    scheduledTime: `${todayLocalStr}T08:00:00`,
    status: "taken",
    loggedAt: `${todayLocalStr}T08:15:00+05:30`,
    loggedBy: {
      userId: DEMO_SENIOR_ID,
      name: "Asha Sharma",
      role: "elderly",
    },
    reminderSent: true,
    missedAlertSent: false,
  },
  {
    id: `dose-med-lisinopril-2-${todayLocalStr}-08-00`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-lisinopril-2",
    medicationName: "Lisinopril",
    dosage: "10 mg",
    scheduledTime: `${todayLocalStr}T08:00:00`,
    status: "taken",
    loggedAt: `${todayLocalStr}T08:18:00+05:30`,
    loggedBy: {
      userId: DEMO_SENIOR_ID,
      name: "Asha Sharma",
      role: "elderly",
    },
    reminderSent: true,
    missedAlertSent: false,
  },
  {
    id: `dose-med-metformin-1-${todayLocalStr}-20-00`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-metformin-1",
    medicationName: "Metformin",
    dosage: "500 mg",
    scheduledTime: `${todayLocalStr}T20:00:00`,
    status: "pending",
    reminderSent: false,
    missedAlertSent: false,
  },
  {
    id: `dose-med-atorvastatin-3-${todayLocalStr}-21-00`,
    elderlyUserId: DEMO_SENIOR_ID,
    medicationId: "med-atorvastatin-3",
    medicationName: "Atorvastatin",
    dosage: "20 mg",
    scheduledTime: `${todayLocalStr}T21:00:00`,
    status: "pending",
    reminderSent: false,
    missedAlertSent: false,
  },
];

let inMemoryAppointments: Appointment[] = [
  {
    id: "appt-cardiology-1",
    elderlyUserId: DEMO_SENIOR_ID,
    title: "Cardiologist Blood Pressure & ECG Follow-up",
    doctorName: "Dr. Rajesh Kulkarni",
    clinicAddress: "Nagpur City Care Hospital, Medical Square, Nagpur 440003",
    dateTime: "2026-11-20T10:30:00",
    transportationRequired: true,
    accompaniedBy: "Priya Sharma (Daughter)",
    notes:
      "Bring current medication adherence chart and last 2 weeks BP readings.",
    status: "upcoming",
    reminderSent: false,
    createdAt: "2026-11-01T12:00:00+05:30",
  },
  {
    id: "appt-eye-2",
    elderlyUserId: DEMO_SENIOR_ID,
    title: "Annual Diabetic Retinopathy Eye Checkup",
    doctorName: "Dr. Amit Joshi, MS (Ophthalmology)",
    clinicAddress: "Drishti Eye & Retina Center, Dharampeth, Nagpur 440010",
    dateTime: "2026-12-05T14:00:00",
    transportationRequired: true,
    accompaniedBy: "Rahul Sharma (Son)",
    notes: "Eye drops will be administered; driver required for return trip.",
    status: "upcoming",
    reminderSent: false,
    createdAt: "2026-11-05T15:00:00+05:30",
  },
];

let inMemoryAuditLogs: ActivityAuditLog[] = [
  {
    id: "audit-1",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: DEMO_SENIOR_ID,
    actorName: "Asha Sharma",
    action: "DOSE_TAKEN",
    details: {
      medicationName: "Metformin",
      dosage: "500 mg",
      period: "Morning Routine",
    },
    timestamp: `${todayLocalStr}T08:15:00+05:30`,
  },
  {
    id: "audit-2",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: DEMO_SENIOR_ID,
    actorName: "Asha Sharma",
    action: "DOSE_TAKEN",
    details: {
      medicationName: "Lisinopril",
      dosage: "10 mg",
      period: "Morning Routine",
    },
    timestamp: `${todayLocalStr}T08:18:00+05:30`,
  },
  {
    id: "audit-3",
    elderlyUserId: DEMO_SENIOR_ID,
    circleId: DEMO_CIRCLE_ID,
    actorId: "user-priya-1",
    actorName: "Priya Sharma",
    action: "PASSCODE_VERIFIED",
    details: { channel: "Senior Tablet Sign-in" },
    timestamp: `${todayLocalStr}T07:45:00+05:30`,
  },
];

/**
 * CareCircle Repository with Full Firestore + In-Memory Fallback
 */
export const CareCircleRepository = {
  getCircle: async (circleId: string = DEMO_CIRCLE_ID): Promise<CareCircle> => {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb.collection("care_circles").doc(circleId).get();
        if (snap.exists) return snap.data() as CareCircle;
      } catch (err) {
        console.warn("Firestore getCircle error:", err);
      }
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
        await adminDb.collection("care_circles").doc(circleId).set(
          {
            passcodeHash: hash,
            passcodeSalt: salt,
            updatedAt: inMemoryCircle.updatedAt,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore updatePasscode error:", err);
      }
    }

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
      permissions: [
        "view_meds",
        "view_reports",
        "receive_alerts",
      ] as any,
      status: "active" as const,
      joinedAt: new Date().toISOString(),
    };
    inMemoryCircle.members.push(newMember);

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb
          .collection("care_circles")
          .doc(inMemoryCircle.id)
          .set({ members: inMemoryCircle.members }, { merge: true });
      } catch (err) {
        console.warn("Firestore addMember error:", err);
      }
    }

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
      } catch (err) {
        console.warn("Firestore getMedications error:", err);
      }
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
      isActive: med.isActive ?? true,
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
        await adminDb.collection("medications").doc(id).set(fullMed, { merge: true });
      } catch (err) {
        console.warn("Firestore saveMedication error:", err);
      }
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

      if (isFirebaseAdminConfigured() && adminDb) {
        try {
          await adminDb
            .collection("medications")
            .doc(medId)
            .update({ isActive: false, updatedAt: med.updatedAt });
        } catch (err) {
          console.warn("Firestore deleteMedication error:", err);
        }
      }

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

  /**
   * Generates and returns scheduled doses for today with ZERO DUPLICATION.
   * Ensures deterministic matching by medId and time.
   */
  getDosesForToday: async (
    elderlyUserId: string = DEMO_SENIOR_ID
  ): Promise<DoseLog[]> => {
    const today = getLocalDateString(new Date());

    // 1. Try reading live Firestore doses if configured
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb
          .collection("dose_logs")
          .where("elderlyUserId", "==", elderlyUserId)
          .where("scheduledTime", ">=", `${today}T00:00:00`)
          .where("scheduledTime", "<=", `${today}T23:59:59`)
          .get();

        if (!snap.empty) {
          return snap.docs.map((doc) => doc.data() as DoseLog);
        }
      } catch (err) {
        console.warn("Firestore getDosesForToday error:", err);
      }
    }

    // 2. Generate and ensure each scheduled medication occurrence exists exactly once
    const meds = await CareCircleRepository.getMedications(elderlyUserId);
    const existingDoseMap = new Map<string, DoseLog>();

    // Index all existing doses for today
    for (const dose of inMemoryDoses) {
      if (dose.elderlyUserId === elderlyUserId && dose.scheduledTime.startsWith(today)) {
        const key = `${dose.medicationId}_${dose.scheduledTime.substring(0, 16)}`;
        existingDoseMap.set(key, dose);
      }
    }

    for (const med of meds) {
      for (const time of med.times) {
        const scheduledTimeStr = `${today}T${time}:00`;
        const key = `${med.id}_${today}T${time}`;

        if (!existingDoseMap.has(key)) {
          const doseId = `dose-${med.id}-${today}-${time.replace(":", "-")}`;
          // Also double-check doseId doesn't exist
          const existingById = inMemoryDoses.find((d) => d.id === doseId);
          if (existingById) {
            existingDoseMap.set(key, existingById);
          } else {
            const newDose: DoseLog = {
              id: doseId,
              elderlyUserId,
              medicationId: med.id,
              medicationName: med.name,
              dosage: med.dosage,
              scheduledTime: scheduledTimeStr,
              status: "pending",
              reminderSent: false,
              missedAlertSent: false,
            };
            inMemoryDoses.push(newDose);
            existingDoseMap.set(key, newDose);
          }
        }
      }
    }

    // Return deduplicated list sorted by scheduled time
    return Array.from(existingDoseMap.values()).sort((a, b) =>
      a.scheduledTime.localeCompare(b.scheduledTime)
    );
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

    // Decrement stock upon successful dose taken
    if (status === "taken") {
      const med = inMemoryMedications.find((m) => m.id === dose.medicationId);
      if (med && med.currentStock > 0) {
        med.currentStock -= 1;
      }
    }

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("dose_logs").doc(logId).set(dose, { merge: true });
      } catch (err) {
        console.warn("Firestore updateDoseStatus error:", err);
      }
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
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb
          .collection("appointments")
          .where("elderlyUserId", "==", elderlyUserId)
          .get();
        if (!snap.empty) {
          return snap.docs.map((doc) => doc.data() as Appointment);
        }
      } catch (err) {
        console.warn("Firestore getAppointments error:", err);
      }
    }
    return inMemoryAppointments.filter((a) => a.elderlyUserId === elderlyUserId);
  },

  saveAppointment: async (
    appt: Partial<Appointment>
  ): Promise<Appointment> => {
    const id = appt.id || `appt-${Date.now()}`;
    const fullAppt: Appointment = {
      id,
      elderlyUserId: appt.elderlyUserId || DEMO_SENIOR_ID,
      title: appt.title || "Doctor Appointment",
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

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("appointments").doc(id).set(fullAppt, { merge: true });
      } catch (err) {
        console.warn("Firestore saveAppointment error:", err);
      }
    }

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
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snap = await adminDb
          .collection("activity_audit_logs")
          .where("elderlyUserId", "==", elderlyUserId)
          .orderBy("timestamp", "desc")
          .limit(50)
          .get();
        if (!snap.empty) {
          return snap.docs.map((doc) => doc.data() as ActivityAuditLog);
        }
      } catch (err) {
        console.warn("Firestore getAuditLogs error:", err);
      }
    }
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

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection("activity_audit_logs").doc(entry.id).set(entry);
      } catch (err) {
        console.warn("Firestore addAuditLog error:", err);
      }
    }

    return entry;
  },
};
