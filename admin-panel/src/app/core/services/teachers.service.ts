import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Teacher, ApiResponse, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class TeachersService extends ApiService {
  private transformTeacher(raw: any): Teacher {
    return {
      id: raw._id,
      userId: raw.userId?._id || '',
      name: raw.userId?.name || '',
      email: raw.userId?.email || '',
      phone: raw.userId?.phone || '',
      employeeId: raw.employeeId || '',
      qualification: raw.qualification || '',
      specialization: raw.specialization || '',
      subjects: raw.subjects || [],
      classes: raw.classes || [],
      avatar: raw.userId?.avatar,
      joinDate: new Date(raw.joinDate),
      isActive: raw.userId?.isActive ?? true,
      videoCount: raw.videoCount || 0,
      totalStudents: raw.totalStudents || 0,
      rating: raw.rating || 0,
      createdAt: new Date(raw.createdAt || new Date())
    };
  }

  getTeachers(params?: QueryParams): Observable<ApiResponse<Teacher[]>> {
    return this.get<any[]>('/teachers', params).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(t => this.transformTeacher(t)) || []
      }))
    );
  }

  getTeacherById(id: string): Observable<ApiResponse<Teacher>> {
    return this.get<any>(`/teachers/${id}`).pipe(
      map(response => ({
        ...response,
        data: this.transformTeacher(response.data)
      }))
    );
  }

  createTeacher(data: any): Observable<ApiResponse<Teacher>> {
    return this.post<any>('/teachers', data).pipe(
      map(response => ({
        ...response,
        data: this.transformTeacher(response.data)
      }))
    );
  }

  updateTeacher(id: string, data: any): Observable<ApiResponse<Teacher>> {
    return this.put<any>(`/teachers/${id}`, data).pipe(
      map(response => ({
        ...response,
        data: this.transformTeacher(response.data)
      }))
    );
  }

  deleteTeacher(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/teachers/${id}`);
  }
}
