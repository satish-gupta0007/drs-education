import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CoursesService extends ApiService {

  /** Get all subjects for the student's class */
  getCourses(classId: string, studentId?: string): Observable<any> {
    return this.get<any>('/subjects', { classId, studentId });
  }
 
  getCourseById(id: string): Observable<any> {
    return this.get<any>(`/subjects/${id}`);
  }

  enrolledCourses(id: string, studentId?: string): Observable<any> {
    return this.post<any>(`/students/${studentId}/enroll/${id}`, {});
  }

  getEnrolledSubjects(studentId: string): Observable<any> {
    return this.get<any>(`/students/${studentId}/enrolled-subjects`);
  }
}
 