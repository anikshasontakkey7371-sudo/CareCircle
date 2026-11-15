export type UserRole = "elderly" | "caregiver" | "family";

export type CirclePermission =
  | "view_meds"
  | "log_meds"
  | "edit_schedule"
  | "view_reports"
  | "receive_alerts";

export interface UserPreferences {
  fontSize: "normal" | "large" | "extra-large";
  highContrast: boolean;
  audioChimes: boolean;
  voicePrompt: boolean;
  emailNotifications: boolean;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface CircleMember {
  userId: string;
  displayName: string;
  email: string;
  relationship: "primary_caregiver" | "family" | "nurse" | "doctor";
  permissions: CirclePermission[];
  status: "active" | "pending" | "revoked";
  joinedAt: string;
}

export interface CareCircle {
  id: string;
  elderlyUserId: string;
  elderlyName: string;
  passcodeHash: string;
  passcodeSalt: string;
  emergencyPhone: string;
  emergencyNotes: string;
  members: CircleMember[];
  createdAt: string;
  updatedAt: string;
}

export type PillShape = "round" | "oval" | "capsule" | "liquid" | "tablet";

export interface Medication {
  id: string;
  elderlyUserId: string;
  name: string;
  dosage: string;
  unit: string;
  instructions: string;
  doctorName?: string;
  times: string[]; // e.g. ["08:00", "20:00"]
  colorCode: string;
  pillShape: PillShape;
  currentStock: number;
  refillAlertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DoseStatus = "pending" | "taken" | "skipped" | "missed";

export interface DoseLog {
  id: string;
  elderlyUserId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // ISO 8601 string or YYYY-MM-DDTHH:mm
  status: DoseStatus;
  loggedAt?: string;
  loggedBy?: {
    userId: string;
    name: string;
    role: "elderly" | "caregiver" | "system";
  };
  notes?: string;
  reminderSent?: boolean;
  missedAlertSent?: boolean;
}

export interface Appointment {
  id: string;
  elderlyUserId: string;
  title: string;
  doctorName: string;
  clinicAddress: string;
  dateTime: string; // ISO 8601
  transportationRequired: boolean;
  accompaniedBy?: string;
  notes?: string;
  status: "upcoming" | "completed" | "cancelled";
  reminderSent: boolean;
  createdAt: string;
}

export type AuditAction =
  | "DOSE_TAKEN"
  | "DOSE_SKIPPED"
  | "DOSE_MISSED_ALERT_SENT"
  | "MEDICATION_ADDED"
  | "MEDICATION_UPDATED"
  | "MEDICATION_DEACTIVATED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_COMPLETED"
  | "CAREGIVER_INVITED"
  | "PERMISSION_UPDATED"
  | "PASSCODE_VERIFIED"
  | "EMERGENCY_ALERT_TRIGGERED";

export interface ActivityAuditLog {
  id: string;
  elderlyUserId: string;
  circleId?: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface AdherenceMetrics {
  totalScheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  pending: number;
  adherencePercentage: number;
}
