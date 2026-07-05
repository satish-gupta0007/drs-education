import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - DRS Education'
      },
      {
        path: 'classes',
        loadChildren: () => import('./modules/classes/classes.routes').then(m => m.CLASSES_ROUTES),
        title: 'Classes - DRS Education'
      },
      {
        path: 'subjects',
        loadChildren: () => import('./modules/subjects/subjects.routes').then(m => m.SUBJECTS_ROUTES),
        title: 'Subjects - DRS Education'
      },
      {
        path: 'videos',
        loadChildren: () => import('./modules/videos/videos.routes').then(m => m.VIDEOS_ROUTES),
        title: 'Videos - DRS Education'
      },
      {
        path: 'pdfs',
        loadChildren: () => import('./modules/pdfs/pdfs.routes').then(m => m.PDFS_ROUTES),
        title: 'Study Materials - DRS Education'
      },
      {
        path: 'students',
        loadChildren: () => import('./modules/students/students.routes').then(m => m.STUDENTS_ROUTES),
        title: 'Students - DRS Education'
      },
      {
        path: 'teachers',
        loadChildren: () => import('./modules/teachers/teachers.routes').then(m => m.TEACHERS_ROUTES),
        title: 'Teachers - DRS Education'
      },
      {
        path: 'announcements',
        loadChildren: () => import('./modules/announcements/announcements.routes').then(m => m.ANNOUNCEMENTS_ROUTES),
        title: 'Announcements - DRS Education'
      },
      {
        path: 'quizzes',
        loadChildren: () => import('./modules/quizzes/quizzes.routes').then(m => m.QUIZZES_ROUTES),
        title: 'Quizzes - DRS Education'
      },
      {
        path: 'reports',
        loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reports - DRS Education'
      },
      {
        path: 'settings',
        loadComponent: () => import('./modules/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings - DRS Education'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
