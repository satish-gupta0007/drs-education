import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Student, ApiResponse, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentsService extends ApiService {
  private transformStudent(raw: any): Student {
    return {
      id: raw._id,
      userId: raw.userId?._id || '',
      name: raw.userId?.name || '',
      email: raw.userId?.email || '',
      phone: raw.userId?.phone || '',
      rollNumber: raw.rollNumber || '',
      classId: raw.classId?._id || '',
      className: raw.className || '',
      parentName: raw.parentName || '',
      parentPhone: raw.parentPhone || '',
      avatar: raw.userId?.avatar,
      enrollmentDate: new Date(raw.enrollmentDate),
      isActive: raw.userId?.isActive ?? true,
      totalWatchTime: raw.totalWatchTime || 0,
      quizScore: raw.quizScore || 0,
      lastActive: new Date(raw.lastActive || new Date()),
      createdAt: new Date(raw.createdAt || new Date())
    };
  }

  getStudents(params?: QueryParams): Observable<ApiResponse<Student[]>> {
    return this.get<any[]>('/students', params).pipe(
      map(response => ({
        ...response,
        data: response.data?.map(s => this.transformStudent(s)) || []
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<Student>> {
    return this.get<any>(`/students/${id}`).pipe(
      map(response => ({
        ...response,
        data: this.transformStudent(response.data)
      }))
    );
  }

  getProgress(id: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/students/${id}/progress`);
  }

  create(data: any): Observable<ApiResponse<Student>> {
    return this.post<any>('/students', data).pipe(
      map(response => ({
        ...response,
        data: this.transformStudent(response.data)
      }))
    );
  }

  update(id: string, data: Partial<Student>): Observable<ApiResponse<Student>> {
    return this.put<any>(`/students/${id}`, data).pipe(
      map(response => ({
        ...response,
        data: this.transformStudent(response.data)
      }))
    );
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/students/${id}`);
  }
}
