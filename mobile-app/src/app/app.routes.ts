import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'courses', loadComponent: () => import('./pages/courses/courses.page').then(m => m.CoursesPage) },
      { path: 'videos', loadComponent: () => import('./pages/videos/videos.page').then(m => m.VideosPage) },
      { path: 'quizzes', loadComponent: () => import('./pages/quizzes/quizzes.page').then(m => m.QuizzesPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) }
    ]
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./pages/course-detail/course-detail.page').then(m => m.CourseDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'video-player/:id',
    loadComponent: () => import('./pages/video-player/video-player.page').then(m => m.VideoPlayerPage),
    canActivate: [authGuard]
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./pages/quiz/quiz.page').then(m => m.QuizPage),
    canActivate: [authGuard]
  },
  {
    path: 'materials',
    loadComponent: () => import('./pages/pdfs/pdfs.page').then(m => m.PdfsPage),
    canActivate: [authGuard]
  }
];
