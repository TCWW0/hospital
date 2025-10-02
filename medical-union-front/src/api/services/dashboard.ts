import {
  fetchReferrals,
  fetchReferralById,
  updateReferralStatus
} from '@/api/mock/referrals';
import { fetchPatients, fetchPatientById } from '@/api/mock/patients';

export async function getDashboardSummary() {
  const all = await fetchReferrals({ page: 1, pageSize: 1000, status: 'all' } as any);
  const items = all.items || [];
  const totalReferrals = items.length;
  const pending = items.filter((i: any) => i.status === 'pending').length;
  const accepted = items.filter((i: any) => i.status === 'accepted').length;
  const rejected = items.filter((i: any) => i.status === 'rejected').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayNew = items.filter((i: any) => (i.createdAt || '').startsWith(today)).length;
  const myPending = pending;

  return { totalReferrals, pending, accepted, rejected, todayNew, myPending };
}

export async function getRecentReferrals(limit = 6) {
  const res = await fetchReferrals({ page: 1, pageSize: limit } as any);
  return res.items || [];
}

export async function getRecentPatients(limit = 6) {
  const patients = await fetchPatients();
  return patients.slice(0, Math.min(limit, patients.length));
}

export async function getSortedPatients(limit = 6) {
  const patients = await fetchPatients();
  const triageOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  patients.sort((a: any, b: any) => {
    if ((a.status === 'ongoing') !== (b.status === 'ongoing')) {
      return a.status === 'ongoing' ? -1 : 1;
    }
    const ta = triageOrder[a.triage] ?? 3;
    const tb = triageOrder[b.triage] ?? 3;
    if (ta !== tb) return ta - tb;
    const da = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
    const db = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
    return db - da;
  });
  return patients.slice(0, Math.min(limit, patients.length));
}

export async function getPatientOverview() {
  const patients = await fetchPatients();
  const totalPatients = patients.length;
  const highTriage = patients.filter((p: any) => p.triage === 'high').length;
  const mediumTriage = patients.filter((p: any) => p.triage === 'medium').length;
  const lowTriage = patients.filter((p: any) => p.triage === 'low').length;
  const ongoing = patients.filter((p: any) => p.status === 'ongoing').length;
  const completed = patients.filter((p: any) => p.status === 'completed').length;
  return { totalPatients, highTriage, mediumTriage, lowTriage, ongoing, completed };
}

export async function getPatientTrend(days = 7) {
  const patients = await fetchPatients();
  const today = new Date();
  const series: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = patients.filter((p: any) => (p.lastVisit || '').startsWith(key)).length;
    series.push({ date: key, count });
  }
  return series;
}

export const mockReferralApi = {
  fetchReferrals,
  fetchReferralById,
  updateReferralStatus
};

export const mockPatientApi = {
  fetchPatients,
  fetchPatientById
};
