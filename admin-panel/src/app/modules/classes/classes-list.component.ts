import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassesService } from '../../core/services/classes.service';
import { Class } from '../../core/models';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss'
})
export class ClassesListComponent implements OnInit {
  private classesService = inject(ClassesService);

  classes = signal<Class[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editMode = signal(false);
  searchQuery = '';

  currentClass: Partial<Class> = this.emptyClass();
  submitting = false;

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading.set(true);
    this.classesService.getClasses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.classes.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.loading.set(false);
      }
    });
  }

  get filteredClasses(): Class[] {
    if (!this.searchQuery) return this.classes();
    const q = this.searchQuery.toLowerCase();
    return this.classes().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.section?.toLowerCase().includes(q) ||
      c.academicYear.toLowerCase().includes(q)
    );
  }

  openAddModal(): void {
    this.editMode.set(false);
    this.currentClass = this.emptyClass();
    this.showModal.set(true);
  }

  openEditModal(cls: Class): void {
    this.editMode.set(true);
    this.currentClass = { ...cls };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.currentClass = this.emptyClass();
  }

  onSubmit(): void {
    this.submitting = true;
    const apiCall = this.editMode()
      ? this.classesService.updateClass(this.currentClass.id!, this.currentClass)
      : this.classesService.createClass(this.currentClass);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadClasses(); // Reload the list
          this.closeModal();
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving class:', error);
        this.submitting = false;
      }
    });
  }

  toggleStatus(cls: Class): void {
    this.classesService.toggleStatus(cls.id, !cls.isActive).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadClasses(); // Reload to get updated data
        }
      },
      error: (error) => {
        console.error('Error toggling class status:', error);
      }
    });
  }

  deleteClass(id: string): void {
    if (confirm('Are you sure you want to delete this class?')) {
      this.classesService.deleteClass(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadClasses(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting class:', error);
        }
      });
    }
  }

  private emptyClass(): Partial<Class> {
    return { name: '', section: '', academicYear: '2024-25', description: '', isActive: true };
  }
}
