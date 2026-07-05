import { Routes } from '@angular/router';
export const QUIZZES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./quizzes-list.component').then(m => m.QuizzesListComponent) }
];
