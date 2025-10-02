export * from './services/dashboard';

export { authApi } from './http/auth';
export { patientApi } from './http/patient';
export { referralApi } from './http/referral';
export { statisticsApi } from './http/statistics';
export { systemApi } from './http/system';

export {
  fetchReferrals as fetchReferralsMock,
  fetchReferralById as fetchReferralByIdMock,
  updateReferralStatus as updateReferralStatusMock
} from './mock/referrals';

export {
  fetchPatients as fetchPatientsMock,
  fetchPatientById as fetchPatientByIdMock
} from './mock/patients';