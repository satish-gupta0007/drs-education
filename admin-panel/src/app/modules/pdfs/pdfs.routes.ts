import { Routes } from '@angular/router';
export const PDFS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pdfs-list.component').then(m => m.PdfsListComponent) }
];
