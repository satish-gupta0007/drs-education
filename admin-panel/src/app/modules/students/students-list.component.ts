import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, Class } from '../../core/models';
import { StudentsService } from '../../core/services/students.service';
import { ClassesService } from '../../core/services/classes.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
})  
export class StudentsListComponent implements OnInit {
  private studentsService = inject(StudentsService);
  private classesService = inject(ClassesService);

  students = signal<Student[]>([]);
  classes = signal<Class[]>([]);
  showModal = signal(false);
  editMode = signal(false);
  loading = signal(false);
  searchQuery = signal('');
  filterClass = signal('');
  currentStudent: Partial<Student> = this.emptyStudent();
  submitting = signal(false);
  selectedTab = signal('all');

  ngOnInit(): void {
    this.loadStudents();
    this.loadClasses();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.studentsService.getStudents().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.students.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading students:', error);
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

  get filteredStudents(): Student[] {
    let result = this.students();
    if (this.filterClass()) result = result.filter(s => s.className === this.filterClass());
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
    }
    if (this.selectedTab() === 'active') result = result.filter(s => s.isActive);
    if (this.selectedTab() === 'inactive') result = result.filter(s => !s.isActive);
    return result;
  }

  openAddModal(): void { 
    this.editMode.set(false); 
    this.currentStudent = this.emptyStudent(); 
    this.showModal.set(true); 
  }
  openEditModal(s: Student): void {
     this.editMode.set(true); 
     this.currentStudent = { ...s };
    //  this.currentStudent.classId=s.classId.id;
    //  this.currentStudent.id=s.id;
           this.showModal.set(true);
     }
  closeModal(): void { this.showModal.set(false); }
  
  selectTab(tab: string): void { this.selectedTab.set(tab); }
  updateSearchQuery(value: string): void { this.searchQuery.set(value); }
  updateFilterClass(value: string): void { this.filterClass.set(value); }
  
  getActiveCount(): number { return this.students().filter(s => s.isActive).length; }
  getInactiveCount(): number { return this.students().length - this.getActiveCount(); }

  onSubmit(): void {
    this.submitting.set(true);
    const apiCall = this.editMode()
      ? this.studentsService.update(this.currentStudent.id!, this.currentStudent)
      : this.studentsService.create(this.currentStudent);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadStudents(); // Reload the list
          this.closeModal();
        }
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error saving student:', error);
        this.submitting.set(false);
      }
    });
  }

  deleteStudent(id: string): void {
    if (confirm('Delete this student?')) {
      this.studentsService.deleteStudent(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadStudents(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting student:', error);
        }
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  }

  private emptyStudent(): Partial<Student> {
    return { id: '', name: '', email: '', phone: '', rollNumber: '', classId: '', parentName: '', parentPhone: '' };
  }

  getClassName(classId:string): string {
    const classObj = this.classes().find(c => c.id === classId);
    return classObj ? classObj.name : 'NA';
  }
}
