import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonBadge,
  IonProgressBar, IonSegment, IonSegmentButton, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playCircleOutline, documentOutline, helpCircleOutline,
  starOutline, starSharp, timeOutline, schoolOutline,
  checkmarkCircleOutline, lockClosedOutline, downloadOutline,
  trophyOutline, peopleOutline, bookmarkOutline, bookmarkSharp,
  arrowForwardOutline, chevronForwardOutline
} from 'ionicons/icons';
import { CoursesService } from '../../services/courses.service';
import { VideosService } from '../../services/videos.service';
import { PdfsService } from '../../services/pdfs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { AuthService } from '../../services/auth.service';

interface VideoItem { id:string; title:string; duration:string; isWatched:boolean; isLocked:boolean; chapter:string; }
interface PdfItem { id:string; title:string; type:string; size:string; isDownloaded:boolean; chapter:string; }
interface QuizItem { id:string; title:string; questions:number; duration:number; bestScore?:number; status:'not_started'|'completed'|'in_progress'; }

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons, IonIcon, IonBadge,
    IonProgressBar, IonSegment, IonSegmentButton, IonLabel
  ],
  templateUrl: './course-detail.page.html',
  styleUrl: './course-detail.page.scss'
})
export class CourseDetailPage implements OnInit {
  coursesService = inject(CoursesService);
  videosService = inject(VideosService);
  pdfsService = inject(PdfsService);
  quizzesService = inject(QuizzesService);
  authService = inject(AuthService);

  courseId = signal('1');
  // activeSegment = signal<'videos'|'materials'|'quizzes'>('videos');
  activeSegment: string = 'videos';
 isBookmarked: boolean = false;
  loading = signal(true);

  course = signal<any>(null);
  videos = signal<VideoItem[]>([]);
  pdfs = signal<PdfItem[]>([]);
  quizzes = signal<QuizItem[]>([]);

  chapters = signal<string[]>([]);

  get watchedCount(): number { return this.videos().filter(v => v.isWatched).length; }
  get groupedVideos(): Record<string, VideoItem[]> {
    return this.videos().reduce((acc, v) => {
      if (!acc[v.chapter]) acc[v.chapter] = [];
      acc[v.chapter].push(v);
      return acc;
    }, {} as Record<string, VideoItem[]>);
  }
  get videoChapters(): string[] { return [...new Set(this.videos().map(v => v.chapter))]; }

  constructor(private route: ActivatedRoute, private router: Router) {
    addIcons({ playCircleOutline, documentOutline, helpCircleOutline, starOutline, starSharp, timeOutline, schoolOutline, checkmarkCircleOutline, lockClosedOutline, downloadOutline, trophyOutline, peopleOutline, bookmarkOutline, bookmarkSharp, arrowForwardOutline, chevronForwardOutline });
  }

  ngOnInit(): void {
    this.courseId.set(this.route.snapshot.params['id'] || '1');
    this.loadCourseData();
  }

  loadCourseData(): void {
    this.loading.set(true);

    // Load course details
    this.coursesService.getCourseById(this.courseId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.course.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading course:', error);
      }
    });

    // Load videos for this course
    const currentUser = this.authService.currentUser();
    this.videosService.getVideos({ subjectId: this.courseId(), studentId: currentUser?.id }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const videoItems: VideoItem[] = response.data.map((video: any) => ({
            id: video.id,
            title: video.title,
            duration: this.formatDuration(video.duration),
            isWatched: video.watchProgress?.isCompleted || false,
            isLocked: false, // TODO: Implement locking logic
            chapter: video.chapter || 'General'
          }));
          this.videos.set(videoItems);
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
      }
    });

    // Load PDFs for this course
    this.pdfsService.getPdfs({ subjectId: this.courseId() }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const pdfItems: PdfItem[] = response.data.map((pdf: any) => ({
            id: pdf.id,
            title: pdf.title,
            type: pdf.type || 'notes',
            size: this.formatFileSize(pdf.size),
            isDownloaded: false, // TODO: Check download status
            chapter: pdf.chapter || 'General'
          }));
          this.pdfs.set(pdfItems);
        }
      },
      error: (error) => {
        console.error('Error loading PDFs:', error);
      }
    });

    // Load quizzes for this course
    this.quizzesService.getQuizzes(this.courseId(), currentUser?.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const quizItems: QuizItem[] = response.data.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            questions: quiz.questions?.length || 0,
            duration: quiz.duration || 30,
            bestScore: quiz.studentAttempt?.score,
            status: quiz.studentAttempt ? (quiz.studentAttempt.isPassed ? 'completed' : 'in_progress') : 'not_started'
          }));
          this.quizzes.set(quizItems);
        }
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      }
    });

    this.loading.set(false);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openVideo(video: VideoItem): void {
    if (video.isLocked) return;
    this.router.navigate(['/video-player', video.id]);
  }

  openQuiz(quiz: QuizItem): void {
    this.router.navigate(['/quiz-detail', quiz.id]);
  }

  openPdf(pdf: PdfItem): void {
    // TODO: Implement PDF viewer
    console.log('Open PDF:', pdf.id);
  }

  // toggleBookmark(): void {
  //   this.isBookmarked.set(!this.isBookmarked());
  //   // TODO: Implement bookmark API call
  // }

  // getPdfTypeColor(type: string): string {
  //   const colors: Record<string, string> = {
  //     'notes': '#4e73df',
  //     'reference': '#1cc88a',
  //     'assignment': '#f6c23e',
  //     'question_paper': '#e74a3b',
  //     'solution': '#36b9cc'
  //   };
  //   return colors[type] || '#6c757d';
  // }

  // getPdfTypeLabel(type: string): string {
  //   const labels: Record<string, string> = {
  //     'notes': 'Notes',
  //     'reference': 'Reference',
  //     'assignment': 'Assignment',
  //     'question_paper': 'Question Paper',
  //     'solution': 'Solution'
  //   };
  //   return labels[type] || 'Document';
  // }

  // getQuizStatusColor(status: string): string {
  //   const colors: Record<string, string> = {
  //     'completed': '#1cc88a',
  //     'in_progress': '#f6c23e',
  //     'not_started': '#6c757d'
  //   };
  //   return colors[status] || '#6c757d';
  // }

  startQuiz(quiz: QuizItem): void {
    this.router.navigate(['/quiz', quiz.id]);
  }

toggleBookmark(): void {
  this.isBookmarked = !this.isBookmarked;
}
  getPdfTypeColor(type: string): string {
    const m: any = { notes:'#4e73df', reference:'#36b9cc', assignment:'#f6c23e', question_paper:'#f1416c', solution:'#1cc88a' };
    return m[type] || '#a1a5b7';
  }

  getPdfTypeLabel(type: string): string {
    const m: any = { notes:'Notes', reference:'Ref', assignment:'Assignment', question_paper:'Q.Paper', solution:'Solution' };
    return m[type] || type;
  }

  getQuizStatusColor(status: string): string {
    const m: any = { completed:'#1cc88a', in_progress:'#f6c23e', not_started:'#a1a5b7' };
    return m[status] || '#a1a5b7';
  }
  get videosCount() { return this.videos().length; }
get pdfsCount() { return this.pdfs().length; }
get quizzesCount() { return this.quizzes().length; }
}
