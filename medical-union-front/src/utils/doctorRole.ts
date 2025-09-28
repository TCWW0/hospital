import { computed, ref } from 'vue';

export type DoctorRole = 'community' | 'hospital';

const STORAGE_KEY = 'medical_union_doctor_role';
const DEFAULT_ROLE: DoctorRole = 'hospital';

function readInitialRole(): DoctorRole {
  if (typeof window === 'undefined') {
    return DEFAULT_ROLE;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'community' || stored === 'hospital') {
      return stored;
    }

    const rawUser = window.localStorage.getItem('medical_union_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.userType === 'DOCTOR' && (user?.doctorRole === 'community' || user?.doctorRole === 'hospital')) {
        window.localStorage.setItem(STORAGE_KEY, user.doctorRole);
        return user.doctorRole;
      }
    }
  } catch (error) {
    console.warn('[doctorRole] Failed to read role from storage:', error);
  }
  return DEFAULT_ROLE;
}

const roleRef = ref<DoctorRole>(readInitialRole());

function persistRole(role: DoctorRole) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, role);
  } catch (error) {
    console.warn('[doctorRole] Failed to persist role to storage:', error);
  }
}

export function setDoctorRole(role: DoctorRole) {
  if (roleRef.value === role) return;
  roleRef.value = role;
  persistRole(role);
}

export function getDoctorRole(): DoctorRole {
  return roleRef.value;
}

export function useDoctorRole() {
  const role = roleRef;
  const isCommunityDoctor = computed(() => role.value === 'community');
  const isHospitalDoctor = computed(() => role.value === 'hospital');

  return {
    role,
    isCommunityDoctor,
    isHospitalDoctor,
    setDoctorRole
  };
}

export function resetDoctorRole() {
  roleRef.value = DEFAULT_ROLE;
  persistRole(DEFAULT_ROLE);
}
