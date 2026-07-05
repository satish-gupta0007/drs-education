import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getStats(): Observable<any> {
    return this.get<any>('/reports/dashboard');
  }
  getTopVideos(limit = 10): Observable<any> {
    return this.get<any>(`/reports/top-videos?limit=${limit}`);
  }
  getTopStudents(limit = 10): Observable<any> {
    return this.get<any>(`/reports/top-students?limit=${limit}`);
  }
  getSubjectEngagement(): Observable<any> {
    return this.get<any>('/reports/subject-engagement');
  }
  getEnrollmentTrend(months = 12): Observable<any> {
    return this.get<any>(`/reports/enrollment-trend?months=${months}`);
  }
}
