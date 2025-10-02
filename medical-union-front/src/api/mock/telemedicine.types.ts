// Shared type definitions for telemedicine mock data and repository
export type TelemedicineMethod = 'video' | 'phone' | 'text';
export type TelemedicineStatus = 'pending' | 'scheduled' | 'completed' | 'rejected';
export type TelemedicineServiceType =
  | 'video_consult'
  | 'imaging_consult'
  | 'joint_clinic'
  | 'ward_round'
  | 'report_review';
export type TelemedicineSupportTag =
  | 'cloud_imaging'
  | 'cloud_lab'
  | 'multidisciplinary'
  | 'education'
  | 'pharmacy';
export type TelemedicineServiceStage =
  | 'applied'
  | 'review'
  | 'scheduled'
  | 'in_consult'
  | 'report_submitted'
  | 'evaluated'
  | 'closed';

export interface TelemedicineSchedule {
  scheduledAt: string; // ISO string
  method: TelemedicineMethod;
  meetingUrl?: string;
  note?: string;
  assignedBy: string;
}

export interface TelemedicineReport {
  conclusion: string;
  advice: string;
  attachments?: string[];
  submittedAt: string;
  submittedBy: string; // expert id
}

export interface TelemedicineServiceEvaluation {
  rating: number;
  comment?: string;
  evaluator: string;
  submittedAt: string;
}

export interface TelemedicineFeedback {
  rating: number;
  comment?: string;
  submittedAt: string;
  submittedBy: string; // patient id
}

export interface TelemedicineHistoryEntry {
  at: string;
  actor: string;
  action: string;
  type: 'status' | 'assignment' | 'report' | 'feedback' | 'note' | 'confirmation';
}

export interface TelemedicineDiagnosisAccess {
  provider: 'external' | 'in_app';
  url?: string;
  accessCode?: string;
  note?: string;
  lastUpdated: string;
}

export interface TelemedicinePatientConfirmation {
  confirmedAt: string;
  confirmedBy: string;
  note?: string;
}

export interface TelemedicineApp {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  attachments: string[];
  preferredMethod: TelemedicineMethod;
  preferredTime?: string;
  serviceType: TelemedicineServiceType;
  supportTags: TelemedicineSupportTag[];
  status: TelemedicineStatus;
  serviceStage: TelemedicineServiceStage;
  createdAt: string;
  createdByDoctorId?: string;
  createdByDoctorName?: string;
  createdByDoctorHospital?: string;
  assignedExpertId?: string;
  assignedExpertName?: string;
  schedule?: TelemedicineSchedule;
  report?: TelemedicineReport;
  feedback?: TelemedicineFeedback;
  serviceEvaluation?: TelemedicineServiceEvaluation;
  diagnosisAccess?: TelemedicineDiagnosisAccess;
  patientConfirmation?: TelemedicinePatientConfirmation;
  history: TelemedicineHistoryEntry[];
}

export interface AssignPayload {
  expertId: string;
  expertName: string;
  scheduledAt: string;
  method: TelemedicineMethod;
  meetingUrl?: string;
  note?: string;
  assignedBy: string;
}

export interface ReportPayload {
  conclusion: string;
  advice: string;
  attachments?: string[];
  expertId: string;
}

export interface FeedbackPayload {
  rating: number;
  comment?: string;
  patientId: string;
}

export interface PatientConfirmPayload {
  patientId: string;
  patientName: string;
  note?: string;
}

export interface TelemedicineFilters {
  status?: TelemedicineStatus;
  patientId?: string;
  doctorId?: string;
}

export interface ExpertSummary {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
}

export interface CreateTelemedicinePayload {
  patientId: string;
  patientName: string;
  description: string;
  attachments?: string[];
  preferredMethod: TelemedicineMethod;
  preferredTime?: string;
  serviceType: TelemedicineServiceType;
  supportTags: TelemedicineSupportTag[];
  doctorId: string;
  doctorName: string;
  doctorHospital?: string;
}
