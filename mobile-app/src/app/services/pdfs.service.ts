import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PdfsService extends ApiService {

  getPdfs(params?: any): Observable<any> {
    return this.get<any>('/pdfs', params);
  }

  getPdfById(id: string): Observable<any> {
    return this.get<any>(`/pdfs/${id}`);
  }
}