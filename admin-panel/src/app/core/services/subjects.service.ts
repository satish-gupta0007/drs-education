import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Subject, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class SubjectsService extends ApiService {

  getSubjects(params?: QueryParams): Observable<ApiResponse<Subject[]>> {
    return this.get<Subject[]>('/subjects', params);
  }

  getSubjectById(id: string): Observable<ApiResponse<Subject>> {
    return this.get<Subject>(`/subjects/${id}`);
  }

  createSubject(data: Partial<Subject>): Observable<ApiResponse<Subject>> {
    return this.post<Subject>('/subjects', data);
  }

  updateSubject(id: string, data: Partial<Subject>): Observable<ApiResponse<Subject>> {
    return this.put<Subject>(`/subjects/${id}`, data);
  }

  deleteSubject(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/subjects/${id}`);
  }

  toggleStatus(id: string, isActive: boolean): Observable<ApiResponse<Subject>> {
    return this.patch<Subject>(`/subjects/${id}/status`, { isActive });
  }
}
