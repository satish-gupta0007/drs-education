import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Announcement, ApiResponse, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService extends ApiService {
  getAnnouncements(params?: QueryParams): Observable<ApiResponse<Announcement[]>> {
    return this.get<Announcement[]>('/announcements', params);
  }
  getById(id: string): Observable<ApiResponse<Announcement>> {
    return this.get<Announcement>(`/announcements/${id}`);
  }
  create(data: Partial<Announcement>): Observable<ApiResponse<Announcement>> {
    return this.post<Announcement>('/announcements', data);
  }
  update(id: string, data: Partial<Announcement>): Observable<ApiResponse<Announcement>> {
    return this.put<Announcement>(`/announcements/${id}`, data);
  }
  togglePublish(id: string, isPublished: boolean): Observable<ApiResponse<Announcement>> {
    return this.patch<Announcement>(`/announcements/${id}/publish`, { isPublished });
  }
  deleteAnnouncement(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/announcements/${id}`);
  }
}
