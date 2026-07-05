import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService extends ApiService {
  getAnnouncements(): Observable<any> {
    return this.get<any>('/announcements', { isPublished: 'true' });
  }
}
