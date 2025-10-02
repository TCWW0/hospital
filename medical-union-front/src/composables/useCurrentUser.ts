import { computed, ref } from 'vue';
import type { DoctorRole } from '@/utils/doctorRole';

const STORAGE_KEY = 'medical_union_user';

export interface RawUserRecord {
  [key: string]: unknown;
}

export interface NormalizedUser {
  /** 原始后端返回或 Mock 数据，保留以便拓展 */
  raw: RawUserRecord;
  /** 用户主键（后端 userId/relatedId/id 等字段的归一化） */
  id: string | number | null;
  /** 用户名/显示名（按 name -> username -> phone 的顺序兜底） */
  displayName: string;
  /** 登录帐号 */
  username?: string;
  /** 手机或联系方式 */
  phone?: string;
  /** 用户类型，兼容后端 role 字段 */
  userType: string;
  /** 角色（管理员/医生/患者等），可能与 userType 一致 */
  role?: string;
  /** 医生角色（社区/医院），仅医生有效 */
  doctorRole?: DoctorRole;
  /** 专家 ID（远程医疗需要使用） */
  expertId?: string;
  /** 所属机构/医院名称 */
  hospitalName?: string;
  /** 远程教学等模块中的发起人标识 */
  organizerId?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch (_error) {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickStringField(source: Record<string, unknown> | null, keys: string[]): string | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const candidate = source[key];
    if (isNonEmptyString(candidate)) {
      return candidate.trim();
    }
  }
  return undefined;
}

function resolveExpertId(source: Record<string, unknown>): string | undefined {
  const direct = pickStringField(source, ['expertId', 'expertID', 'expert_id', 'expertCode', 'expert_code']);
  if (direct) return direct;

  const nestedSources: Array<Record<string, unknown> | null> = [
    parseObject(source.profileJson),
    parseObject(source.profile),
    parseObject(source.extra),
    parseObject(source.metadata),
    parseObject(source.details)
  ];

  for (const nested of nestedSources) {
    const nestedMatch = pickStringField(nested, [
      'expertId',
      'expertID',
      'expert_id',
      'expertCode',
      'expert_code',
      'id',
      'code'
    ]);
    if (nestedMatch) return nestedMatch;
  }

  return undefined;
}

function resolveOrganizerId(source: Record<string, unknown>): string | undefined {
  const direct = pickStringField(source, ['organizerId', 'organizerID', 'organizer_id']);
  if (direct) return direct;

  const nestedSources: Array<Record<string, unknown> | null> = [
    parseObject(source.profileJson),
    parseObject(source.profile),
    parseObject(source.extra),
    parseObject(source.metadata),
    parseObject(source.details)
  ];

  for (const nested of nestedSources) {
    const nestedMatch = pickStringField(nested, ['organizerId', 'organizerID', 'organizer_id', 'id']);
    if (nestedMatch) return nestedMatch;
  }

  return undefined;
}

function coerceDoctorRole(value: unknown): DoctorRole | undefined {
  return value === 'community' || value === 'hospital' ? value : undefined;
}

function normalizeUser(raw: unknown): NormalizedUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;

  const id = (source.id ?? source.userId ?? source.userID ?? source.relatedId ?? null) as
    | string
    | number
    | null;
  const username = (source.username ?? source.userName ?? source.loginName ?? source.account) as
    | string
    | undefined;
  const name = (source.name ?? source.fullName ?? source.realName ?? username ?? source.phone) as
    | string
    | undefined;
  const phone = (source.phone ?? source.mobile ?? source.contact) as string | undefined;
  const userTypeValue = (source.userType ?? source.role ?? source.user_type ?? '') as string;
  const role = (source.role ?? source.userRole ?? source.user_type ?? '') as string | undefined;
  const doctorRole = coerceDoctorRole(source.doctorRole ?? source.roleTag ?? source.doctor_role);
  const expertId = resolveExpertId(source);
  const organizerId = resolveOrganizerId(source);

  const hospitalName = (source.hospital ?? source.hospitalName ?? source.organization ?? source.orgName) as
    | string
    | undefined;

  return {
    raw: source,
    id,
    displayName: name || username || phone || '未知用户',
    username,
    phone,
    userType: (userTypeValue || '').toString().toUpperCase(),
    role: role?.toString(),
    doctorRole,
    expertId,
    hospitalName,
    organizerId
  };
}

function readUserFromStorage(): NormalizedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RawUserRecord;
    return normalizeUser(parsed);
  } catch (error) {
    console.warn('[useCurrentUser] Failed to parse user from storage:', error);
    return null;
  }
}

const currentUserRef = ref<NormalizedUser | null>(readUserFromStorage());
let storageListenerBound = false;

function bindStorageListener() {
  if (storageListenerBound || typeof window === 'undefined') return;
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      currentUserRef.value = readUserFromStorage();
    }
  });
  storageListenerBound = true;
}

function persistUser(user: RawUserRecord | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn('[useCurrentUser] Failed to persist user to storage:', error);
  }
}

export function setCurrentUser(user: RawUserRecord | null) {
  persistUser(user);
  currentUserRef.value = user ? normalizeUser(user) : null;
}

export function refreshCurrentUser() {
  currentUserRef.value = readUserFromStorage();
}

export function clearCurrentUser() {
  persistUser(null);
  currentUserRef.value = null;
}

export interface DoctorProfile {
  id: string | number | null;
  name: string;
  expertId?: string;
  doctorRole?: DoctorRole;
  organizerId?: string;
  hospital?: string;
  phone?: string;
}

export function useCurrentUser() {
  bindStorageListener();

  const currentUser = currentUserRef;

  const isDoctor = computed(() => currentUser.value?.userType === 'DOCTOR');
  const isPatient = computed(() => currentUser.value?.userType === 'PATIENT');
  const isAdmin = computed(() => currentUser.value?.userType === 'ADMIN');

  const doctorProfile = computed<DoctorProfile | null>(() => {
    if (!currentUser.value || !isDoctor.value) return null;
    return {
      id: currentUser.value.id,
      name: currentUser.value.displayName,
      expertId: currentUser.value.expertId,
      doctorRole: currentUser.value.doctorRole,
      organizerId: currentUser.value.organizerId,
      hospital: currentUser.value.hospitalName,
      phone: currentUser.value.phone
    };
  });

  return {
    currentUser,
    isDoctor,
    isPatient,
    isAdmin,
    doctorProfile,
    refreshCurrentUser,
    setCurrentUser,
    clearCurrentUser
  };
}

