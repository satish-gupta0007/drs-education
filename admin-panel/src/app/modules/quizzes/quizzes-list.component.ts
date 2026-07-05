import { Component, OnInit, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Quiz, QuizQuestion } from '../../core/models';
import { QuizzesService } from '../../core/services/quizzes.service';
import { SubjectsService } from '../../core/services/subjects.service';
import { ClassesService } from '../../core/services/classes.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-quizzes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quizzes-list.component.html',
  styleUrl: './quizzes-list.component.scss'
})
export class QuizzesListComponent implements OnInit {
  quizzes = signal<Quiz[]>([]);
  showModal  = signal(false);
  editMode   = signal(false);
  activeStep = signal(1); // 1=details, 2=questions, 3=settings
  submitting = false;
  loading = false;
  searchQuery = '';
  filterClass = '';
  filterSubject = '';

  classes: any[] = [];
  subjects: any[] = [];

  current: Partial<Quiz> = this.emptyQuiz();
  questions: QuizQuestion[] = [];
  editingQuestion: Partial<QuizQuestion> = this.emptyQuestion();
  showQuestionForm = false;
  editingQIndex = -1;

  // Template references for focus management
  questionTextRef: any;
  marksInputRef: any;
  explanationRef: any;
  @ViewChildren('optionInput') optionInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private quizzesService: QuizzesService,
    private subjectsService: SubjectsService,
    private classesService: ClassesService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadClasses();
    this.loadQuizzes();
  }

  loadSubjects(): void {
    console.log('Loading subjects...');
    this.subjectsService.getSubjects().subscribe({
      next: (response) => {
        console.log('Subjects response:', response);
        if (response.success && response.data) {
          this.subjects = response.data;
          console.log('Subjects loaded:', this.subjects);
        } else {
          console.log('No subjects data in response');
        }
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  loadClasses(): void {
    console.log('Loading classes...');
    this.classesService.getClasses().subscribe({
      next: (response) => {
        console.log('Classes response:', response);
        if (response.success && response.data) {
          this.classes = response.data;
          console.log('Classes loaded:', this.classes);
        } else {
          console.log('No classes data in response');
        }
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  loadQuizzes(): void {
    this.loading = true;
    this.quizzesService.getQuizzes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.quizzes.set(response.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.loading = false;
      }
    });
  }

  get filtered(): Quiz[] {
    let r = this.quizzes();
    if (this.filterClass) r = r.filter(q => q.className === this.filterClass);
    if (this.filterSubject) r = r.filter(q => q.subjectName === this.filterSubject);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(qz => qz.title.toLowerCase().includes(q) || qz.subjectName.toLowerCase().includes(q));
    }
    return r;
  }

  openAdd(): void {
    this.editMode.set(false);
    this.current = this.emptyQuiz();
    this.questions = [];
    this.activeStep.set(1);
    this.showModal.set(true);
  }

  openEdit(quiz: Quiz): void {
    this.editMode.set(true);
    this.current = { ...quiz };
    this.current.subjectName=quiz.subjectId?.id;
    this.current.className=quiz.classId;
    this.questions = [...quiz.questions];
    this.activeStep.set(1);
    this.showModal.set(true);
  }

  close(): void { this.showModal.set(false); this.showQuestionForm = false; }

  nextStep(): void { if (this.activeStep() < 3) this.activeStep.update(s => s + 1); }
  prevStep(): void { if (this.activeStep() > 1) this.activeStep.update(s => s - 1); }

  // Question Builder
  openAddQuestion(): void {
    this.editingQIndex = -1;
    this.editingQuestion = this.emptyQuestion();
    this.showQuestionForm = true;
    setTimeout(() => {
      this.focusQuestionText();
    }, 100);
  }

  openEditQuestion(q: QuizQuestion, idx: number): void {
    this.editingQIndex = idx;
    this.editingQuestion = { ...q, options: [...(q.options || ['','','',''])] };
    this.showQuestionForm = true;
    setTimeout(() => {
      this.focusQuestionText();
    }, 100);
  }

  focusQuestionText(): void {
    setTimeout(() => {
      const el = document.querySelector('textarea[placeholder="Enter the question..."]') as HTMLTextAreaElement;
      if (el) el.focus();
    }, 0);
  }

  focusMarks(): void {
    setTimeout(() => {
      const marks = document.querySelector('input[placeholder="Marks"]') as HTMLInputElement;
      if (marks) marks.focus();
    }, 0);
  }

  focusExplanation(): void {
    setTimeout(() => {
      const expl = document.querySelector('input[placeholder="Why this answer?"]') as HTMLInputElement;
      if (expl) expl.focus();
    }, 0);
  }

  moveToNextInput(currentField: string): void {
    if (currentField === 'question') this.focusMarks();
    if (currentField === 'marks') this.focusExplanation();
  }

  moveToNextOption(currentIndex: number): void {
    const options = this.optionInputs.toArray();
    if (currentIndex < options.length - 1) {
      // Move to next option
      options[currentIndex + 1].nativeElement.focus();
    } else {
      // Last option, move to marks field
      this.focusMarks();
    }
  }
  onEnterOption(index: number, value: string) {
  if (value.trim()) {
    this.moveToNextOption(index);
  }
}

trackByIndex(index: number): number {
  return index;
}
  saveQuestion(): void {
    // Validate required fields
    if (!this.editingQuestion.question || !this.editingQuestion.marks) {
      alert('Please fill in all required fields');
      return;
    }

    const q = {
      ...this.editingQuestion,
      id: this.editingQuestion.id || Date.now().toString(),
      marks: this.editingQuestion.marks || 1
    } as QuizQuestion;
    
    if (this.editingQIndex > -1) {
      this.questions[this.editingQIndex] = q;
    } else {
      this.questions.push(q);
    }
    
    this.showQuestionForm = false;
    this.editingQuestion = this.emptyQuestion();
    this.editingQIndex = -1;
  }

  removeQuestion(idx: number): void { this.questions.splice(idx, 1); }

  get totalQuizMarks(): number { return this.questions.reduce((s, q) => s + (q.marks || 1), 0); }

  onSubmit(): void {
    this.submitting = true;

    console.log('Submitting quiz...');
    console.log('Current form data:', this.current);
    console.log('Available subjects:', this.subjects);
    console.log('Available classes:', this.classes);
    console.log('Questions:', this.questions);

    // Check if subjects are loaded
    if (this.subjects.length === 0) {
      alert('Subjects are still loading. Please wait a moment and try again.');
      this.submitting = false;
      return;
    }

    // Find the selected subject and class IDs
    const selectedSubject = this.subjects.find(s => s.name === this.current.subjectName);
    const selectedClass = this.classes.find(c => c.name === this.current.className);

    console.log('Selected subject:', selectedSubject);
    console.log('Selected class:', selectedClass);

    if (!this.current.subjectName?.trim()) {
      alert('Please select a subject');
      this.submitting = false;
      return;
    }

    if (!selectedSubject) {
      this.toast.error('Invalid Subject', 'Please select a valid subject from list.');
      this.submitting = false;
      return;
    }

    if (!this.current.title?.trim()) {
      this.toast.error('Invalid Quiz Title', 'Please enter a quiz title.');
      this.submitting = false;
      return;
    }

    if (this.questions.length === 0) {
      this.toast.error('No Questions', 'Add at least one question before creating quiz.');
      this.submitting = false;
      return;
    }

    const quizPayload = {
      title: this.current.title,
      subjectId: selectedSubject?.id,
      classId: selectedClass?.id,
      questions: this.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        difficulty: q.difficulty
      })),
      totalMarks: this.totalQuizMarks,
      passingMarks: this.current.passingMarks || Math.ceil(this.totalQuizMarks * 0.4),
      duration: this.current.duration,
      status: this.current.isPublished ? 'PUBLISHED' : 'DRAFT'
    };

    console.log('Quiz payload:', quizPayload);

    const apiCall = this.editMode()
      ? this.quizzesService.update(this.current._id!, quizPayload)
      : this.quizzesService.create(quizPayload);

    apiCall.subscribe({
      next: (response) => {
        console.log('API response:', response);
        if (response.success) {
          this.loadQuizzes(); // Reload the list
          this.close();
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving quiz:', error);
        const message = error?.error?.message || error?.message || 'Unknown error';
        this.toast.error('Error saving quiz', message);
        this.submitting = false;
      }
    });
  }

  togglePublish(q: Quiz): void {
    const newStatus = !q.isPublished;
    this.quizzesService.togglePublish(q._id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          q.isPublished = newStatus;
          this.quizzes.set([...this.quizzes()]); // Trigger change detection
        }
      },
      error: (error) => {
        console.error('Error toggling publish status:', error);
      }
    });
  }

  delete(id: string): void {
    if (confirm('Delete this quiz?')) {
      this.quizzesService.deleteQuiz(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadQuizzes(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
        }
      });
    }
  }

  private emptyQuiz(): Partial<Quiz> {
    return { title:'', subjectName:'', className:'', duration:30, totalMarks:20, passingMarks:8, isPublished:false };
  }

  private emptyQuestion(): Partial<QuizQuestion> {
    return { question:'', type:'mcq', options:['','','',''], correctAnswer:0, marks:1, difficulty:'medium', explanation:'' };
  }
}
