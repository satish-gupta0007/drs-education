import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class QuizzesService extends ApiService {

  getQuizzes(subjectId?: string, studentId?: string): Observable<any> {
    const params: any = { status:'PUBLISHED' };
    if (subjectId) params.subjectId = subjectId;
    if (studentId) params.studentId = studentId;
    return this.get<any>('/quizzes', params);
  }

  getQuizById(id: string): Observable<any> {
    return this.get<any>(`/quizzes/${id}`);
  }

  startQuiz(quizId: string, studentId: string): Observable<any> {
    return this.post<any>(`/quizzes/${quizId}/start`, { studentId });
  }

  saveAnswer(quizId: string, studentId: string, questionId: string, selectedAnswer: number): Observable<any> {
    return this.post<any>(`/quizzes/${quizId}/answer`, { studentId, questionId, selectedAnswer });
  }

  saveProgress(quizId: string, studentId: string, currentIndex: number, timeLeft: number): Observable<any> {
    return this.post<any>(`/quizzes/${quizId}/progress`, { studentId, currentIndex, timeLeft });
  }

  submitAttempt(quizId: string, data: { studentId:string; answers:(number|null)[]; timeTaken:number; score:number }): Observable<any> {
    return this.post<any>(`/quizzes/${quizId}/attempt`, data);
  }

  retakeQuiz(quizId: string, studentId: string): Observable<any> {
    return this.post<any>(`/quizzes/${quizId}/retake`, { studentId });
  }
}
