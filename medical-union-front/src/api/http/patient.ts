import { http } from '@/utils/request';
import type { Patient, PaginationParams } from '@/types';

export const patientApi = {
  getPatients: (params: PaginationParams & {
    name?: string;
    gender?: string;
    severityLevel?: string;
  }) => http.get<Patient[]>('/patients', { params }),

  getPatient: (id: number) => http.get<Patient>(`/patients/${id}`),

  createPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'hospitalName'>) =>
    http.post<Patient>('/patients', data),

  updatePatient: (id: number, data: Partial<Patient>) =>
    http.put<Patient>(`/patients/${id}`, data),

  deletePatient: (id: number) => http.delete(`/patients/${id}`)
};

export type PatientApi = typeof patientApi;
