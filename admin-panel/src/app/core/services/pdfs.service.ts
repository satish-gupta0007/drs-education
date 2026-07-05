import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PDF, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class PdfsService extends ApiService {

  getPdfs(params?: QueryParams): Observable<ApiResponse<PDF[]>> {
    return this.get<PDF[]>('/pdfs', params);
  }

  getPdfById(id: string): Observable<ApiResponse<PDF>> {
    return this.get<PDF>(`/pdfs/${id}`);
  }

  createPdf(data: Partial<PDF>): Observable<ApiResponse<PDF>> {
    return this.post<PDF>('/pdfs', data);
  }

  updatePdf(id: string, data: Partial<PDF>): Observable<ApiResponse<PDF>> {
    return this.put<PDF>(`/pdfs/${id}`, data);
  }

  uploadPdf(formData: FormData): Observable<any> {
    return this.uploadFile('/pdfs/upload', formData);
  }

  deletePdf(id: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/pdfs/${id}`);
  }
}
