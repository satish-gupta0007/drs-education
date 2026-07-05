import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonSearchbar, IonChip, IonIcon, IonRefresher, IonRefresherContent,
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline, timeOutline, checkmarkCircleOutline,
  playCircleOutline, trophyOutline, searchOutline,
  gridOutline, listOutline, refreshOutline
} from 'ionicons/icons';
import { QuizzesService } from '../../services/quizzes.service';

interface QuizItem {
  id: string;
  title: string;
  subjectName: string;
  subjectId?: any;
  className: string;
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: 'DRAFT' | 'PUBLISHED';
  attemptCount?: number;
  bestScore?: number;
  lastAttempted?: Date;
}

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonSearchbar, IonChip, IonIcon, IonRefresher, IonRefresherContent,
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonLabel
  ],
  templateUrl: './quizzes.page.html',
  styleUrl: './quizzes.page.scss'
})
export class QuizzesPage implements OnInit {
  quizzes = signal<QuizItem[]>([]);
  filteredQuizzes = signal<QuizItem[]>([]);
  searchQuery = signal('');
  selectedSubject = signal('');
  selectedStatus = signal<'all' | 'attempted' | 'not_attempted'>('all');
  viewMode = signal<'grid' | 'list'>('grid');
  loading = signal(false);

  subjects: string[] = [];
  statuses = [
    { id: 'all', label: 'All Quizzes' },
    { id: 'attempted', label: 'Attempted' },
    { id: 'not_attempted', label: 'Not Attempted' }
  ];

  constructor(
    private router: Router,
    private quizzesService: QuizzesService
  ) {
    addIcons({
      helpCircleOutline, timeOutline, checkmarkCircleOutline,
      playCircleOutline, trophyOutline, searchOutline,
      gridOutline, listOutline, refreshOutline
    });
  }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.quizzesService.getQuizzes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const quizzes = response.data as any[];
          this.quizzes.set(quizzes);
          this.subjects = Array.from(new Set(quizzes.map((quiz: any) => quiz.subjectName || quiz.subjectId?.name || ''))).filter(Boolean) as string[];
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.loading.set(false);
        this.quizzes.set([]);
        this.subjects = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = this.quizzes();

    // Search filter
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(quiz => {
        const subjectLabel = quiz.subjectName || quiz.subjectId?.name || '';
        return quiz.title.toLowerCase().includes(query) ||
          subjectLabel.toLowerCase().includes(query);
      });
    }

    // Subject filter
    if (this.selectedSubject()) {
      filtered = filtered.filter((quiz: any) => {
        const subjectName = quiz.subjectName || quiz.subjectId?.name || '';
        return subjectName === this.selectedSubject();
      });
    }

    // Status filter
    if (this.selectedStatus() === 'attempted') {
      filtered = filtered.filter(quiz => quiz.attemptCount && quiz.attemptCount > 0);
    } else if (this.selectedStatus() === 'not_attempted') {
      filtered = filtered.filter(quiz => !quiz.attemptCount || quiz.attemptCount === 0);
    }
    this.filteredQuizzes.set(filtered);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  selectSubject(subject: string): void {
    this.selectedSubject.set(subject === this.selectedSubject() ? '' : subject);
    this.applyFilters();
  }

  selectStatus(status: 'all' | 'attempted' | 'not_attempted'): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  startQuiz(quiz: QuizItem): void {
    this.router.navigate(['/quiz', quiz.id]);
  }

  handleRefresh(event: any): void {
    this.loadQuizzes();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getQuizStatusColor(quiz: QuizItem): string {
    if (quiz.attemptCount && quiz.attemptCount > 0) {
      return quiz.bestScore && quiz.bestScore >= quiz.passingMarks ? '#1cc88a' : '#f6c23e';
    }
    return '#a1a5b7';
  }

  getQuizStatusText(quiz: QuizItem): string {
    if (quiz.attemptCount && quiz.attemptCount > 0) {
      return quiz.bestScore && quiz.bestScore >= quiz.passingMarks ? 'Passed' : 'Attempted';
    }
    return 'Not Attempted';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  getSubjectColor(subject:any){
// console.log('subjectName::',subjectName);
// return subject.color

  }
  toggleViewMode(): void {
  this.viewMode.set(this.viewMode() === 'list' ? 'grid' : 'list');
}
}