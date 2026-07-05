import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('../home/home.page').then(m => m.HomePage) },
      { path: 'courses', loadComponent: () => import('../courses/courses.page').then(m => m.CoursesPage) },
      { path: 'videos', loadComponent: () => import('../videos/videos.page').then(m => m.VideosPage) },
      { path: 'profile', loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage) }
    ]
  }
];