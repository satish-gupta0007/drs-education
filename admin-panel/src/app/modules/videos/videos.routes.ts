import { Routes } from '@angular/router';
export const VIDEOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./videos-list.component').then(m => m.VideosListComponent) }
];
