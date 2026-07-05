import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Quiz, ApiResponse, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class QuizzesService extends ApiService {
  getQuizzes(params?: QueryParams): Observable<ApiResponse<Quiz[]>> {
    return this.get<Quiz[]>('/quizzes', params);
  }
  getById(id: string): Observable<ApiResponse<Quiz>> {
    return this.get<Quiz>(`/quizzes/${id}`);
  }
  create(data: Partial<Quiz>): Observable<ApiResponse<Quiz>> {
    return this.post<Quiz>('/quizzes', data);
  }
  update(id: string, data: Partial<Quiz>): Observable<ApiResponse<Quiz>> {
    return this.put<Quiz>(`/quizzes/${id}`, data);
  }
  togglePublish(id: string, isPublished: boolean): Observable<ApiResponse<Quiz>> {
    return this.patch<Quiz>(`/quizzes/${id}/publish`, { isPublished });
  }
  deleteQuiz(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/quizzes/${id}`);
  }
}
