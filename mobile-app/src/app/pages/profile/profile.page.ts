import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, settingsOutline, logOutOutline, bookOutline, trophyOutline, timeOutline, flameOutline, checkmarkCircleOutline, chevronForwardOutline, notificationsOutline, helpCircleOutline, starOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss'
})
export class ProfilePage implements OnInit {
  authService = inject(AuthService);

  student = signal<any>(null);
  stats = signal({ videosWatched:0, watchHours:0, quizScore:0, streak:0, badges:0, rank:0 });
  weeklyActivity = signal<number[]>([]);
  weekDays = ['M','T','W','T','F','S','S'];
  badges = signal<any[]>([]);
  menuItems = [
    { icon:'notifications-outline', label:'Notifications', route:'/notifications' },
    { icon:'book-outline', label:'Downloaded Content', route:'/downloads' },
    { icon:'trophy-outline', label:'My Achievements', route:'/achievements' },
    { icon:'star-outline', label:'Favourite Courses', route:'/favourites' },
    { icon:'shield-checkmark-outline', label:'Privacy & Security', route:'/security' },
    { icon:'help-circle-outline', label:'Help & Support', route:'/help' },
  ];

  constructor(private router: Router) {
    addIcons({ personOutline, settingsOutline, logOutOutline, bookOutline, trophyOutline, timeOutline, flameOutline, checkmarkCircleOutline, chevronForwardOutline, notificationsOutline, helpCircleOutline, starOutline, shieldCheckmarkOutline });
  }
  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      this.applyProfile(currentUser);
      if (currentUser.studentId) {
        this.loadProgress(currentUser.studentId);
      }
      return;
    }

    this.authService.getCurrentUserProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.authService.currentUser.set(res.data);
          this.applyProfile(res.data);
          if (res.data.studentId) {
            this.loadProgress(res.data.studentId);
          }
        }
      },
      error: () => {
        this.stats.set({ videosWatched:0, watchHours:0, quizScore:0, streak:0, badges:0, rank:0 });
        this.weeklyActivity.set([]);
      }
    });
  }

  private applyProfile(user: any): void {
    this.student.set({
      name: user?.name || 'Student',
      email: user?.email || '',
      className: user?.className || 'Class Not Assigned',
      rollNumber: user?.rollNumber || 'N/A',
      avatar: user?.avatar || null,
      studentId: user?.studentId || null
    });
  }

  private loadProgress(studentId: string): void {
    this.authService.getStudentProgress(studentId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set({
            videosWatched: res.data.totalVideosWatched || 0,
            watchHours: res.data.totalWatchTimeMinutes ? Math.round(res.data.totalWatchTimeMinutes / 60) : 0,
            quizScore: res.data.averageScore || 0,
            streak: 0,
            badges: 0,
            rank: 0
          });
          this.weeklyActivity.set([]);
        }
      },
      error: () => {
        this.stats.set({ videosWatched:0, watchHours:0, quizScore:0, streak:0, badges:0, rank:0 });
        this.weeklyActivity.set([]);
      }
    });
  }
  logout(): void { this.router.navigate(['/login']); }
  getInitials(name: string): string { return name.split(' ').map(n=>n[0]).join('').toUpperCase(); }
  getBarHeight(v: number): string { return Math.round(v) + '%'; }
}
