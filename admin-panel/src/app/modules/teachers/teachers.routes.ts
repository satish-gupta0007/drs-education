import { Routes } from '@angular/router';
export const TEACHERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./teachers-list.component').then(m => m.TeachersListComponent) }
];
