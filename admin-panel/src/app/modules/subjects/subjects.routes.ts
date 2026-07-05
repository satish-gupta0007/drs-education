import { Routes } from '@angular/router';
export const SUBJECTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./subjects-list.component').then(m => m.SubjectsListComponent) }
];
