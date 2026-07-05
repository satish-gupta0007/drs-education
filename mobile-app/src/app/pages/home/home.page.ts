import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonRefresher, IonRefresherContent,
  IonSearchbar, IonIcon
} from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { CoursesService } from '../../services/courses.service';
import { VideosService } from '../../services/videos.service';
import { AnnouncementsService } from '../../services/announcements.service';
import { Course, Video, Announcement, User } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonRefresher, IonRefresherContent,
    IonSearchbar, IonIcon
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {

  authService = inject(AuthService);
  router = inject(Router);
  coursesService = inject(CoursesService);
  videosService = inject(VideosService);
  announcementsService = inject(AnnouncementsService);

  loading = signal(true);
  unreadNotifications = signal(3);
  currentStreak = signal(7);

  courses = signal<Course[]>([]);
  videos = signal<Video[]>([]);
  announcements = signal<Announcement[]>([]);

  weeklyActivity = signal<number[]>([40, 65, 30, 80, 55, 90, 70]);
  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  featuredCourses = computed(() => this.courses().slice(0, 5));
  recentVideos = computed(() => this.videos().slice(0, 3));

  constructor() {
    // ✅ FIX: allow signal writes inside effect
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadHomeData(user);
      }
    }, { allowSignalWrites: true });
  }

  private buildHomeRequests(user: any) {
    console.log('user::',user);
    return forkJoin({
      courses: this.coursesService.getCourses(user.classId),
      videos: this.videosService.getVideos({ limit: 5, sort: '-createdAt' }),
      announcements: this.announcementsService.getAnnouncements()
    });
  }

  private applyHomeData({ courses, videos, announcements }: any): void {
    if (courses.success) this.courses.set(courses.data || []);
    if (videos.success) this.videos.set(videos.data || []);
    if (announcements.success) this.announcements.set(announcements.data || []);
  }

  loadHomeData(user: User): void {
    this.loading.set(true);

    this.buildHomeRequests(user).subscribe({
      next: (data) => {
        this.applyHomeData(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Home load error:', err);
        this.loading.set(false);
      }
    });
  }

  handleRefresh(event: any): void {
    const user = this.authService.currentUser();

    if (!user) {
      event.target.complete();
      return;
    }

    this.buildHomeRequests(user).subscribe({
      next: (data) => {
        this.applyHomeData(data);
        event.target.complete();
      },
      error: (err) => {
        console.error('Refresh error:', err);
        event.target.complete();
      }
    });
  }

  goToCourse(id: string): void {
    this.router.navigate(['/course', id]);
  }

  goToVideo(id: string): void {
    this.router.navigate(['/video-player', id]);
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  formatDuration(s: number): string {
    const m = Math.floor(s / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  }

  getProgressColor(p: number): string {
    if (p >= 70) return '#1cc88a';
    if (p >= 40) return '#f6c23e';
    return '#4e73df';
  }
}