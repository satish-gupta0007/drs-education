import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Class } from '../../core/models';
import { SubjectsService } from '../../core/services/subjects.service';
import { ClassesService } from '../../core/services/classes.service';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.scss'
})
export class SubjectsListComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  private classesService = inject(ClassesService);

  subjects = signal<Partial<Subject>[]>([]);
  classes = signal<Class[]>([]);
  showModal = signal(false);
  editMode = signal(false);
  loading = signal(false);
  searchQuery = '';
  filterClass = '';
  submitting = false;
  currentSubject: Partial<Subject> = this.emptySubject();
  subjectColors = ['#4e73df','#f1416c','#1cc88a','#f6c23e','#36b9cc','#fd7e14','#6e56cf','#e83e8c'];

  ngOnInit(): void {
    this.loadSubjects();
    this.loadClasses();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.subjectsService.getSubjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects.set((response.data as any[]).map((subject: any) => this.normalizeSubject(subject)));
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.loading.set(false);
      }
    });
  }

  loadClasses(): void {
    this.classesService.getClasses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.classes.set(response.data);
        }
      },
      error: (error) => console.error('Error loading classes:', error)
    });
  }

  get filteredSubjects(): Partial<Subject>[] {
    let r = this.subjects();
    if (this.filterClass) r = r.filter(s => s.className === this.filterClass);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(s => (s.name || '').toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q));
    }
    return r;
  }

  openAddModal(): void {
    this.editMode.set(false);
    this.currentSubject = this.emptySubject();
    this.showModal.set(true);
  }

  openEditModal(s: any): void {
    this.editMode.set(true);
    this.currentSubject = this.normalizeSubject(s);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  canSubmit(): boolean {
    const name = (this.currentSubject.name || '').trim();
    const code = (this.currentSubject.code || '').trim();
    const classId = this.currentSubject.classId;
    return Boolean(name && code && classId && !this.submitting);
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.submitting = true;
    const payload = {
      name: (this.currentSubject.name || '').trim(),
      code: (this.currentSubject.code || '').trim(),
      classId: this.currentSubject.classId || '',
      description: (this.currentSubject.description || '').trim(),
      color: this.currentSubject.color || '#4e73df',
      isActive: this.currentSubject.isActive ?? true
    };

    const apiCall = this.editMode()
      ? this.subjectsService.updateSubject(this.currentSubject.id!, payload)
      : this.subjectsService.createSubject(payload);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadSubjects(); // Reload the list
          this.closeModal();
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving subject:', error);
        this.submitting = false;
      }
    });
  }

  toggleStatus(s: Partial<Subject>): void {
    this.subjectsService.toggleStatus(s.id!, !s.isActive).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadSubjects(); // Reload to get updated data
        }
      },
      error: (error) => {
        console.error('Error toggling subject status:', error);
      }
    });
  }
  deleteSubject(id?: string): void {
    if (!id) {
      return;
    }

    if (confirm('Delete this subject?')) {
      this.subjectsService.deleteSubject(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubjects(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting subject:', error);
        }
      });
    }
  }
  private normalizeSubject(subject: Partial<Subject> | any): Partial<Subject> {
    const classId = this.resolveClassId(subject);
    const className = subject?.className || this.classes().find(c => c.id === classId)?.name || '';

    return {
      ...subject,
      id: subject?.id ?? subject?._id,
      name: subject?.name ?? '',
      code: subject?.code ?? '',
      classId: classId || '',
      className,
      description: subject?.description ?? '',
      teacherName: subject?.teacherName ?? '',
      teacherId: subject?.teacherId ?? '',
      color: subject?.color ?? '#4e73df',
      isActive: subject?.isActive ?? true,
      videoCount: subject?.videoCount ?? 0,
      pdfCount: subject?.pdfCount ?? 0,
      quizCount: subject?.quizCount ?? 0
    };
  }

  private resolveClassId(subject: any): string | undefined {
    if (typeof subject?.classId === 'string' && subject.classId) {
      return subject.classId;
    }

    if (subject?.classId && typeof subject.classId === 'object') {
      return subject.classId.id || subject.classId._id || '';
    }

    const matchingClass = this.classes().find(c => c.name === subject?.className);
    return matchingClass?.id;
  }

  private emptySubject(): Partial<Subject> {
    return { name:'', code:'', classId:'', className:'', teacherName:'', description:'', color:'#4e73df', isActive:true };
  }
}
