import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Class, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ClassesService extends ApiService {

  getClasses(params?: QueryParams): Observable<ApiResponse<Class[]>> {
    return this.get<Class[]>('/classes', params);
  }

  getClassById(id: string): Observable<ApiResponse<Class>> {
    return this.get<Class>(`/classes/${id}`);
  }

  createClass(data: Partial<Class>): Observable<ApiResponse<Class>> {
    return this.post<Class>('/classes', data);
  }

  updateClass(id: string, data: Partial<Class>): Observable<ApiResponse<Class>> {
    return this.put<Class>(`/classes/${id}`, data);
  }

  deleteClass(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/classes/${id}`);
  }

  toggleStatus(id: string, isActive: boolean): Observable<ApiResponse<Class>> {
    return this.patch<Class>(`/classes/${id}/status`, { isActive });
  }
}
