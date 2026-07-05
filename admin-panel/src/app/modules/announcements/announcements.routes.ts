import { Routes } from '@angular/router';
export const ANNOUNCEMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./announcements-list.component').then(m => m.AnnouncementsListComponent) }
];
