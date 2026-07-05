import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Teacher } from '../../core/models';
import { TeachersService } from '../../core/services/teachers.service';
import { SubjectsService } from '../../core/services/subjects.service';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers-list.component.html',
  styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent implements OnInit {
  private teachersService = inject(TeachersService);
  private subjectsService = inject(SubjectsService);


  teachers = signal<Teacher[]>([]);
  showModal = signal(false);
  editMode  = signal(false);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal('');
  submitting = false;
  current: Partial<Teacher> = this.empty();

  qualifications = ['B.Ed','M.Ed','M.Sc + B.Ed','Ph.D','B.Sc + B.Ed','MBA','M.Tech'];
  // subjectOptions = ['Mathematics','Physics','Chemistry','Biology','English','History','Geography','Computer Science','Economics'];

  avatarColors = ['#4e73df','#f1416c','#1cc88a','#fd7e14','#36b9cc','#6e56cf','#e83e8c','#f6c23e'];
 subjects = signal<any[]>([]);
  ngOnInit(): void {
    this.loadTeachers();
     this.loadSubjects();
  }

   loadSubjects(): void {
    this.loading.set(true);
    this.subjectsService.getSubjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.loading.set(false);
      }
    });
  }

  loadTeachers(): void {
    this.loading.set(true);
    this.teachersService.getTeachers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.teachers.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.loading.set(false);
      }
    });
  }

  filtered = computed(() => {
    let r = this.teachers();
    if (this.filterStatus() === 'active')   r = r.filter(t => t.isActive);
    if (this.filterStatus() === 'inactive') r = r.filter(t => !t.isActive);
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      r = r.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.employeeId.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q));
    }
    return r;
  });

  openAdd(): void  { this.editMode.set(false); this.current = this.empty(); this.showModal.set(true); }
  openEdit(t: Teacher): void {
     this.editMode.set(true); 
     this.current = {...t}; 
     this.showModal.set(true);
     }
  close(): void { this.showModal.set(false); }

  onSubmit(): void {
    this.submitting = true;
    const apiCall = this.editMode()
      ? this.teachersService.updateTeacher(this.current.id!, this.current)
      : this.teachersService.createTeacher(this.current);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTeachers(); // Reload the list
          this.close();
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving teacher:', error);
        this.submitting = false;
      }
    });
  }

  toggleStatus(t: Teacher): void {
    this.teachersService.updateTeacher(t.id, { isActive: !t.isActive }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTeachers(); // Reload to get updated data
        }
      },
      error: (error) => {
        console.error('Error toggling teacher status:', error);
      }
    });
  }
  delete(id: string): void {
    if (confirm('Delete this teacher?')) {
      this.teachersService.deleteTeacher(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTeachers(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting teacher:', error);
        }
      });
    }
  }

  getInitials(name: string): string { return name.replace('Mr. ','').replace('Ms. ','').replace('Mrs. ','').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
  getAvatarColor(id: string): string { return this.avatarColors[parseInt(id) % this.avatarColors.length]; }
  getRatingStars(rating: number): number[] { return Array.from({length:5},(_,i)=>i); }
  isSubjectSelected(sub: string): boolean {
     return (this.current.subjects || []).includes(sub); 
    }
  toggleSubject(sub: string): void {
    const subs = [...(this.current.subjects || [])];
    const i = subs.indexOf(sub);
    if (i > -1) subs.splice(i,1); else subs.push(sub);
    this.current.subjects = subs;
  }

  private empty(): Partial<Teacher> {
    return { name:'', email:'', phone:'', employeeId:'', qualification:'', specialization:'', subjects:[], classes:[], isActive:true };
  }
}
