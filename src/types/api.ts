export type ContentFormat = 'plain' | 'rich-html-v1';

export interface QuestionSection {
  id: string;
  type: string;
  subject: string;
  weight?: number;
}

export interface Question {
  id?: string;
  q: string;
  options: string[];
  answer?: number;
  contentFormat?: ContentFormat;
  section?: QuestionSection;
  archived?: boolean;
}

export interface ClassStudent {
  id: string;
  name: string;
  surname: string;
  accessCode?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  kind?: 'class' | 'group';
  direction?: string;
  students?: ClassStudent[];
  studentCount?: number;
}

export interface TestCodeMeta {
  state: 'inactive' | 'active' | 'revoked';
  value?: string;
  version: number;
  createdAt?: string;
  activatedAt?: string;
  revokedAt?: string;
}

export interface TestSettings {
  timeLimitMin: number;
  maxAttempts: number;
  violationLimit?: number;
  questionsPerAttempt?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswers?: boolean;
  hideResults?: boolean;
  scoringMode?: 'normal' | 'dtm';
}

export interface TestSchedule {
  start?: string | null;
  end?: string | null;
}

export interface TestItem {
  id: string;
  title: string;
  subject?: string;
  direction?: string;
  testType?: 'ordinary' | 'block';
  classIds: string[];
  questions: Question[];
  questionCount?: number;
  count?: number;
  bankCount?: number;
  libraryQuarters?: number[];
  origin?: { type?: string; id?: string };
  composition?: { topics: { id?: string; name: string; count: number }[] };
  settings: TestSettings;
  schedule?: TestSchedule;
  status: 'active' | 'paused' | 'scheduled' | 'ended';
  active?: boolean;
  createdAt?: string;
  created?: string;
  testCode?: TestCodeMeta | null;
}

export interface SectionResult {
  id?: string;
  type: string;
  subject: string;
  score: number;
  maxScore?: number;
  total: number;
  correctCount?: number;
  weight?: number;
}

export interface ReviewItem {
  q: string;
  options: string[];
  selected: number | null;
  answer: number;
  contentFormat?: ContentFormat;
}

export interface ViolationEvent {
  type: string;
  at: string;
}

export interface ResultRow {
  id: string;
  testId: string;
  testTitle: string;
  classId?: string;
  grade: string;
  studentId?: string;
  name: string;
  surname: string;
  score: number;
  total: number;
  dtmScore?: number;
  maxScore?: number;
  scoringMode?: 'normal' | 'dtm';
  sections?: SectionResult[];
  results?: boolean[];
  review?: ReviewItem[];
  questions?: Question[];
  answers?: (number | null)[];
  time: string;
  durationSec: number | null;
  timedOut?: boolean;
  hidden?: boolean;
  violationCount?: number;
  terminatedViolation?: boolean;
  violationLog?: ViolationEvent[];
}

export interface AttemptIdentity {
  name: string;
  surname: string;
  grade: string;
  classId?: string;
  studentId?: string;
}

export interface AttemptState {
  attemptId?: string;
  attemptToken: string;
  testId: string;
  title: string;
  questions: Question[];
  answers: (number | null)[];
  flags: number[];
  current: number;
  draftVersion: number;
  dirty: boolean;
  pendingSubmit?: boolean;
  deadline: string | null;
  serverNow?: string;
  clockReceivedAt?: number;
  violationCount?: number;
  violationLimit?: number;
  identity: AttemptIdentity;
}

export interface StoredResult {
  result: {
    score: number;
    total: number;
    dtmScore?: number;
    maxScore?: number;
    scoringMode?: 'normal' | 'dtm';
    sections?: SectionResult[];
    results: boolean[];
    review?: ReviewItem[];
    timedOut?: boolean;
    hidden?: boolean;
    terminatedViolation?: boolean;
  };
  title: string;
  identity: AttemptIdentity;
  attemptToken: string;
}

export interface AdminSession {
  authenticated: boolean;
  role: 'super_admin' | 'school_admin' | 'legacy_admin';
  schoolId: string | null;
  public_school_id: string | null;
  schoolName: string | null;
  login: string | null;
  passwordMinLength: number;
  passwordMaxLength: number;
}

export interface School {
  id: string;
  public_school_id?: string;
  name: string;
  region?: string;
  status: 'active' | 'blocked' | 'archived';
  adminLogin?: string;
  createdAt?: string;
  subscription?: {
    status: 'active' | 'expired';
    endsAt?: string;
  } | null;
  subscriptionActive?: boolean;
}

export interface SchoolStats {
  updatedAt: string;
  totalSchools: number;
  activeSchools: number;
  activeSubscriptions: number;
  totalTests: number;
  totalAttempts: number;
  bySchool: {
    schoolId: string;
    classes: number;
    tests: number;
    attempts: number;
    results: number;
  }[];
  unassigned: {
    tests: number;
    attempts: number;
  };
}

export interface Topic {
  id: string;
  grade: string;
  subject: string;
  quarter: number;
  name: string;
  count: number;
  version: number;
  lastUploadedAt?: string;
  questions?: Question[];
}

export interface QuarterDraft {
  title: string;
  subject: string;
  questions: Question[];
  topics: { id: string; count: number }[];
  sources: { topicId: string; questionId: string }[];
}

export interface BankPermissions {
  view?: boolean;
  take?: boolean;
  docx?: boolean;
  pdf?: boolean;
  key?: boolean;
  rerunExpired?: boolean;
}

export interface BankAccess {
  permissions: BankPermissions;
}

export interface SharedTest {
  id: string;
  title: string;
  subject: string;
  count?: number;
  status: 'pending' | 'approved' | 'rejected';
  tariffIds: string[];
  schoolIds: string[];
  questions: Question[];
}

export interface BankPolicy {
  id: string;
  type: 'school' | 'tariff';
  target: string;
  tariffId: string;
  rules: Record<string, boolean>;
}

export interface BackupArchiveItem {
  id: string;
  createdAt: string;
  source: string;
}

export interface BackupStatus {
  status: 'not_started' | 'running' | 'partial' | 'success';
  created?: number;
  failed?: number;
}

export interface TestAnalysis {
  title: string;
  attempts: number;
  hardest: { index: number; q: string; contentFormat?: ContentFormat; percent: number }[];
  questions: {
    index: number;
    q: string;
    contentFormat?: ContentFormat;
    percent: number;
    count: number;
    distribution: number[];
    unanswered: number;
  }[];
}

