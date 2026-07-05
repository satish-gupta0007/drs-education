import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, checkmarkCircleOutline, closeCircleOutline, trophyOutline, arrowForwardOutline, refreshOutline } from 'ionicons/icons';
import { QuizzesService } from '../../services/quizzes.service';

export interface QuizQuestion { id: string; question: string; options: string[]; correctAnswer: number; explanation: string; marks: number; difficulty: 'easy' | 'medium' | 'hard'; }

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonIcon],
  templateUrl: './quiz.page.html',
  styleUrl: './quiz.page.scss'
})
export class QuizPage implements OnInit, OnDestroy {
  quizState = signal<'intro' | 'active' | 'result'>('intro');
  currentIndex = signal(0);
  selectedAnswer = signal<number | null>(null);
  showExplanation = signal(false);
  score = signal(0);
  timeLeft = signal(0);
  timerInterval: any;
  answers: (number | null)[] = [];
  studentId: string = ''; // Add student ID for tracking
  quizId = signal('');

  quiz = signal<any>(null);
  questions = signal<QuizQuestion[]>([]);

  constructor(private route: ActivatedRoute, private router: Router, private quizzesService: QuizzesService) {
    addIcons({ timeOutline, checkmarkCircleOutline, closeCircleOutline, trophyOutline, arrowForwardOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.quizId.set(this.route.snapshot.params['id'] || '');
    this.studentId = sessionStorage.getItem('studentId') || 'unknown';
    this.loadQuizData();
  }

  private initializeAnswers(): void {
    const qs = this.questions();
    this.answers = new Array(qs.length).fill(null);
    this.timeLeft.set((this.quiz()?.duration || 0) * 60);
  }

  loadQuizData(): void {
    const id = this.quizId();
    if (!id) {
      console.error('Quiz id is missing');
      return;
    }

    this.quizzesService.getQuizById(id).subscribe({
      next: (response) => {
        console.log('response::', response);

        if (response.success && response.data) {
          this.quiz.set(response.data);
          this.questions.set(response.data.questions || []);
          this.initializeAnswers();
        }
      },
      error: (error) => console.error('Error loading quiz:', error)
    });
  }

  ngOnDestroy(): void { this.clearTimer(); }

  startQuiz(): void {
    const quiz = this.quiz();
    if (!quiz || !quiz.id) {
      console.error('Quiz not loaded yet');
      return;
    }

    this.quizzesService.startQuiz(quiz.id, this.studentId).subscribe({
      next: () => {
        this.quizState.set('active');
        this.startTimer();
      },
      error: (error) => console.error('Error starting quiz:', error)
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft() > 0) {
        this.timeLeft.update(t => t - 1);
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  clearTimer(): void { if (this.timerInterval) clearInterval(this.timerInterval); }

  selectAnswer(idx: number): void {
    if (this.selectedAnswer() !== null) return;
    this.selectedAnswer.set(idx);
    this.answers[this.currentIndex()] = idx;
    const currentQuestion = this.questions()[this.currentIndex()];
    const quiz = this.quiz();

    if (!quiz || !quiz.id || !currentQuestion) return;

    this.quizzesService.saveAnswer(quiz.id, this.studentId, currentQuestion.id, idx).subscribe({
      next: () => {
        if (idx === currentQuestion.correctAnswer) {
          this.score.update(s => s + currentQuestion.marks);
        }
        setTimeout(() => this.showExplanation.set(true), 300);
      },
      error: (error) => console.error('Error saving answer:', error)
    });
  }

  nextQuestion(): void {
    this.showExplanation.set(false);
    this.selectedAnswer.set(null);

    const quiz = this.quiz();
    if (!quiz || !quiz.id) return;

    this.quizzesService.saveProgress(quiz.id, this.studentId, this.currentIndex(), this.timeLeft()).subscribe({
      next: () => {
        if (this.currentIndex() < this.questions().length - 1) {
          this.currentIndex.update(i => i + 1);
        } else {
          this.submitQuiz();
        }
      },
      error: (error) => console.error('Error saving progress:', error)
    });
  }

  submitQuiz(): void {
    this.clearTimer();
    const quiz = this.quiz();
    if (!quiz || !quiz.duration || !quiz.id) return;

    const timeTaken = quiz.duration * 60 - this.timeLeft();

    this.quizzesService.submitAttempt(quiz.id, {
      studentId: this.studentId,
      answers: this.answers,
      timeTaken: timeTaken,
      score: this.score()
    }).subscribe({
      next: () => {
        this.quizState.set('result');
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        this.quizState.set('result');
      }
    });
  }

  retakeQuiz(): void {
    const quiz = this.quiz();
    if (!quiz || !quiz.id) return;

    this.quizzesService.retakeQuiz(quiz.id, this.studentId).subscribe({
      next: () => {
        this.currentIndex.set(0);
        this.selectedAnswer.set(null);
        this.showExplanation.set(false);
        this.score.set(0);
        this.timeLeft.set((quiz.duration || 0) * 60);
        this.answers = new Array(this.questions().length).fill(null);
        this.quizState.set('active');
        this.startTimer();
      },
      error: (error) => console.error('Error retaking quiz:', error)
    });
  }

  // get scorePercent(): number {
  //   const quiz = this.quiz();
  //   return quiz?.totalMarks ? Math.round(this.score() / quiz.totalMarks * 100) : 0;
  // }

  // get isPassed(): boolean {
  //   const quiz = this.quiz();
  //   return !!quiz && this.score() >= (quiz.passingMarks || 0);
  // }

  // get correctCount(): number {
  //   const qs = this.questions();
  //   return this.answers.filter((a, i) => a === qs[i]?.correctAnswer).length;
  // }

  // get timerWarning(): boolean { return this.timeLeft() < 300; }

  // getOptionClass(i: number, optIdx: number): string {
  //   if (this.selectedAnswer() === null) return '';
  //   const qs = this.questions();
  //   const question = qs[i];
  //   if (!question) return '';
  //   if (optIdx === question.correctAnswer) return 'correct';
  //   if (this.answers[i] === optIdx && optIdx !== question.correctAnswer) return 'wrong';
  //   return 'dimmed';
  // }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get scorePercent(): number { 
    return Math.round(this.score() / this.quiz().totalMarks * 100);
   }
  get isPassed(): boolean { return this.score() >= this.quiz().passingMarks; }
get correctCount(): number {
  const questions = this.questions(); 
  // 👈 get value
  return this.answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
}
  get timerWarning(): boolean { return this.timeLeft() < 300; }

  getOptionClass(i: number, optIdx: number): string {
    if (this.selectedAnswer() === null) return '';

    const questions = this.questions(); // 👈 get current value

    if (optIdx === questions[i].correctAnswer) return 'correct';

    if (this.answers[i] === optIdx && optIdx !== questions[i].correctAnswer) {
      return 'wrong';
    }

    return 'dimmed';
  }
  goHome() {
  this.router.navigate(['/tabs/home']);
}
}
