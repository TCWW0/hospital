export type LectureStage =
  | 'applied'
  | 'under_review'
  | 'approved'
  | 'notice_published'
  | 'enrollment_closed'
  | 'in_session'
  | 'post_verification'
  | 'report_ready'
  | 'archived'
  | 'rejected';

export type LectureStatus = 'pending' | 'active' | 'completed' | 'rejected';

export type LectureCategory =
  | 'teaching_discussion'
  | 'ward_round'
  | 'knowledge_share'
  | 'lecture_training'
  | 'surgery_live';

export type LectureAudience = 'medical_staff' | 'patients' | 'mixed';

export type LectureVisibility = 'private' | 'internal' | 'network' | 'public';

export interface LectureVisibilityMatrix {
  /** 是否对发起人可见 */
  organizer: boolean;
  /** 是否对同机构医护可见 */
  sameOrganization: boolean;
  /** 是否对医联体内其他机构医护可见 */
  networkDoctors: boolean;
  /** 是否对医联体外部公众/患者可见 */
  public: boolean;
}

export type VerificationPhase = 'pre_check' | 'live_check' | 'post_check';

export type VerificationOutcome = 'pending' | 'passed' | 'failed';

export interface LectureHistoryEntry {
  id: string;
  actor: string;
  action: string;
  type: 'status' | 'notice' | 'verification' | 'material' | 'report' | 'system';
  at: string;
}

export interface LectureParticipant {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'patient' | 'student' | 'other';
  organization?: string;
  department?: string;
  verifiedPhases: VerificationPhase[];
  verificationStatus: VerificationOutcome;
  note?: string;
}

export type LectureViewerRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'guest';

export interface LectureViewerContext {
  role: LectureViewerRole;
  userId?: string | number;
  organization?: string | null;
  participantId?: string;
}

export interface LectureVerificationRecord {
  id: string;
  phase: VerificationPhase;
  performedBy: string;
  status: VerificationOutcome;
  note?: string;
  createdAt: string;
  attachments?: string[];
  targetParticipantIds?: string[];
}

export interface LectureNotice {
  publishedAt: string;
  publishedBy: string;
  channel: 'platform' | 'email' | 'sms' | 'mixed';
  summary: string;
  audience: LectureAudience;
  enrollmentClosesAt?: string;
  enrollmentFormUrl?: string;
  attachments?: string[];
}

export interface LectureSession {
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  onsiteLocation?: string;
  accessCode?: string;
  livestreamProvider?: 'platform' | 'external' | 'hybrid';
  host?: string;
  techSupportContact?: string;
}

export interface TeachingMaterial {
  id: string;
  name: string;
  type: 'slides' | 'video' | 'document' | 'other';
  uploader: string;
  uploadedAt: string;
  url?: string;
  audience: LectureAudience;
}

export interface LectureReport {
  generatedAt: string;
  generatedBy: string;
  summary: string;
  attendanceRate: number;
  satisfactionScore?: number;
  recommendations?: string[];
  attachments?: string[];
}

export interface TeachingLecture {
  id: string;
  title: string;
  category: LectureCategory;
  targetAudience: LectureAudience;
  visibility: LectureVisibility;
  tags: string[];
  summary: string;
  objectives: string[];
  organizerId: string;
  organizerName: string;
  organizerHospital: string;
  organizerDepartment?: string;
  lecturer: {
    id: string;
    name: string;
    title?: string;
    specialty?: string;
    hospital?: string;
  };
  stage: LectureStage;
  status: LectureStatus;
  createdAt: string;
  updatedAt: string;
  plannedAt?: string;
  durationMinutes?: number;
  notice?: LectureNotice;
  session?: LectureSession;
  materials: TeachingMaterial[];
  participants: LectureParticipant[];
  verificationRecords: LectureVerificationRecord[];
  report?: LectureReport;
  history: LectureHistoryEntry[];
}

export interface TeachingLectureFilters {
  stage?: LectureStage;
  status?: LectureStatus;
  organizerId?: string;
  participantId?: string;
  visibility?: LectureVisibility;
  search?: string;
  viewer?: LectureViewerContext;
}

export interface CreateTeachingLecturePayload {
  title: string;
  category: LectureCategory;
  targetAudience: LectureAudience;
  visibility: LectureVisibility;
  tags?: string[];
  summary: string;
  objectives?: string[];
  plannedAt?: string;
  durationMinutes?: number;
  organizerId: string;
  organizerName: string;
  organizerHospital: string;
  organizerDepartment?: string;
  lecturer: {
    id: string;
    name: string;
    title?: string;
    specialty?: string;
    hospital?: string;
  };
}

export interface ReviewTeachingLecturePayload {
  reviewerId: string;
  reviewerName: string;
  decision: 'approved' | 'rejected';
  comment?: string;
}

export interface PublishLectureNoticePayload {
  publishedBy: string;
  publishedByName: string;
  channel: LectureNotice['channel'];
  summary: string;
  audience: LectureAudience;
  enrollmentClosesAt?: string;
  enrollmentFormUrl?: string;
  attachments?: string[];
}

export interface MarkLectureLivePayload {
  host: string;
  meetingUrl?: string;
  accessCode?: string;
  livestreamProvider?: LectureSession['livestreamProvider'];
  techSupportContact?: string;
}

export interface CloseEnrollmentPayload {
  closedBy: string;
  closedByName: string;
  note?: string;
}

export interface RecordLectureVerificationPayload {
  phase: VerificationPhase;
  performedBy: string;
  performerName: string;
  status: VerificationOutcome;
  note?: string;
  attachments?: string[];
  targetParticipantIds?: string[];
}

export interface UploadLectureMaterialPayload {
  name: string;
  type: TeachingMaterial['type'];
  url?: string;
  uploader: string;
  uploaderName: string;
  audience: LectureAudience;
}

export interface CompileLectureReportPayload {
  generatedBy: string;
  generatedByName: string;
  summary: string;
  attendanceRate: number;
  satisfactionScore?: number;
  recommendations?: string[];
  attachments?: string[];
}
