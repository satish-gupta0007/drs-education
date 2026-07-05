import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Video, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class VideosService extends ApiService {

  getVideos(params?: QueryParams): Observable<ApiResponse<Video[]>> {
    return this.get<Video[]>('/videos', params);
  }

  getVideoById(id: string): Observable<ApiResponse<Video>> {
    return this.get<Video>(`/videos/${id}`);
  }

  createVideo(data: Partial<Video>): Observable<ApiResponse<Video>> {
    return this.post<Video>('/videos', data);
  }

  updateVideo(id: string, data: Partial<Video>): Observable<ApiResponse<Video>> {
    return this.put<Video>(`/videos/${id}`, data);
  }

  uploadVideo(formData: FormData): Observable<any> {
    return this.uploadFile('/videos/upload', formData);
  }

  deleteVideo(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/videos/${id}`);
  }

  togglePublish(id: string, isPublished: boolean): Observable<ApiResponse<Video>> {
    return this.patch<Video>(`/videos/${id}/publish`, { isPublished });
  }
}
