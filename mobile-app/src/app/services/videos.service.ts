import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VideosService extends ApiService {

  getVideos(params?: any): Observable<any> {
    return this.get<any>('/videos', params);
  }

  getFeatured(): Observable<any> {
    return this.get<any>('/videos/featured');
  }

  getVideoById(id: string): Observable<any> {
    return this.get<any>(`/videos/${id}`);
  }

  recordWatch(videoId: string, data: { studentId:string; watchedDuration:number; isCompleted:boolean; lastPosition:number }): Observable<any> {
    return this.post<any>(`/videos/${videoId}/watch`, data);
  }

  getWatchProgress(videoId: string, studentId: string): Observable<any> {
    return this.get<any>(`/videos/${videoId}/watch`, { studentId });
  }
}
