import { Routes } from '@angular/router';
export const STUDENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./students-list.component').then(m => m.StudentsListComponent) }
];
