import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { Course } from '../../models';
import { CoursesService } from '../../services/courses.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './courses.page.html',
  styleUrl: './courses.page.scss'
})
export class CoursesPage implements OnInit {

  router = inject(Router);
  coursesService = inject(CoursesService);
  authService = inject(AuthService);

  selectedSegment = signal<'enrolled' | 'available'>('enrolled');
  searchQuery = signal('');
  loading = signal(false);
  courses = signal<Course[]>([]);

  // ✅ computed instead of getter
  filteredCourses = computed(() => {
    const segment = this.selectedSegment();
    const query = this.searchQuery().toLowerCase();

    return this.courses().filter(c => {
      const matchSegment =
        segment === 'enrolled' ? c.isEnrolled : !c.isEnrolled;

      const matchSearch =
        !query || c.name.toLowerCase().includes(query);

      return matchSegment && matchSearch;
    });
  });

  enrolledCount = computed(() =>
    this.courses().filter(c => c.isEnrolled).length
  );

   ionViewWillEnter() {
    this.loadCourses();
  }

  ngOnInit(): void {
    // this.loadCourses();
  }

  loadCourses(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.loadCoursesForUser(currentUser);
      return;
    }

    this.authService.getCurrentUserProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.authService.currentUser.set(res.data);
          this.loadCoursesForUser(res.data);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  private loadCoursesForUser(currentUser: any): void {
    this.loading.set(true);

    const classContext = currentUser.classId || currentUser.className || '';
    if (!classContext) {
      this.loading.set(false);
      return;
    }

    this.coursesService.getCourses(classContext, currentUser.studentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.courses.set((res.data || []).map((course: any) => ({ ...course, isEnrolled: course.isEnrolled ?? false })));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ✅ Better input handling
  onSearch(event: any) {
    this.searchQuery.set(event.target.value || '');
  }

  setSegment(value: 'enrolled' | 'available') {
    this.selectedSegment.set(value);
  }

  goToCourse(id: string) {
    this.router.navigate(['/course', id]);
  }

  trackByCourse(index: number, course: Course) {
    return course.id;
  }

  toggleFavorite(course: Course, event: Event) {
    event.stopPropagation();
    course.isFavorite = !course.isFavorite;
  }

  toggleEnrollment(course: Course, event: Event, enrolled: boolean) {
    event.stopPropagation();
    const currentUser: any = this.authService.currentUser();
    if (!currentUser?.studentId) {
      return;
    }

    this.loading.set(true);
    this.coursesService.enrolledCourses(course.id, currentUser['_id']).subscribe({
      next: (res) => {
        if (res.success) {
          this.courses.update(courses =>
            courses.map(c =>
              c.id === course.id
                ? {
                    ...c,
                    isEnrolled: enrolled,
                    progress: enrolled ? c.progress : 0,
                  }
                : c
            )
          );

          this.selectedSegment.set(enrolled ? 'enrolled' : 'available');
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDuration(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  getProgressColor(p: number): string {
    if (p >= 70) return '#1cc88a';
    if (p >= 40) return '#f6c23e';
    return '#4e73df';
  }
  enrollCourse(course: Course, event: Event) {
    this.toggleEnrollment(course, event, true);
  }
}