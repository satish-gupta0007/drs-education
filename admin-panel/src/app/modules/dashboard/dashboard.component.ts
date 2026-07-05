import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);

  stats = signal<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalVideos: 0,
    totalPDFs: 0,
    totalQuizzes: 0,
    activeStudentsToday: 0,
    videoViewsToday: 0,
    newEnrollmentsThisMonth: 0,
    averageQuizScore: 0,
    totalWatchTimeHours: 0
  });

  recentActivities = signal<any[]>([]);
  topVideos = signal<any[]>([]);
  chartLabels = signal<string[]>(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']);
  enrollmentData = signal<number[]>([0, 0, 0, 0, 0, 0, 0]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load top videos
    this.dashboardService.getTopVideos(5).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.topVideos.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading top videos:', error);
      }
    });

    // Load enrollment trend
    this.dashboardService.getEnrollmentTrend(7).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.enrollmentData.set(response.data.values || []);
          this.chartLabels.set(response.data.labels || this.chartLabels());
        }
      },
      error: (error) => {
        console.error('Error loading enrollment trend:', error);
      }
    });

    // For now, keep recent activities as mock data
    // TODO: Implement recent activities API endpoint
    this.recentActivities.set([
      { icon: 'bi-person-plus', text: 'New student enrolled: Priya Sharma (Class 10-A)', time: '2 mins ago', type: 'success' },
      { icon: 'bi-play-circle', text: 'Video uploaded: "Quadratic Equations" by Mr. Patel', time: '18 mins ago', type: 'primary' },
      { icon: 'bi-file-earmark-pdf', text: 'Study material added: Physics Chapter 5 Notes', time: '45 mins ago', type: 'info' },
      { icon: 'bi-patch-question', text: 'Quiz published: Chemistry Unit Test - Class 12', time: '1h ago', type: 'warning' },
      { icon: 'bi-megaphone', text: 'Announcement: Diwali holiday schedule posted', time: '3h ago', type: 'secondary' }
    ]);

    this.loading.set(false);
  }

  getProgressWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }
}
