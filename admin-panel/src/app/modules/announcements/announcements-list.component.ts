import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Announcement } from '../../core/models';
import { AnnouncementsService } from '../../core/services/announcements.service';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcements-list.component.html',
  styleUrl: './announcements-list.component.scss'
})
export class AnnouncementsListComponent implements OnInit {
  announcementsService = inject(AnnouncementsService);

  announcements = signal<Announcement[]>([]);
  showModal = signal(false);
  editMode = signal(false);
  filterType = signal('');
  submitting = signal(false);
  loading = signal(false);

  current: Partial<Announcement> = this.empty();

  types = ['general','exam','holiday','event','urgent'];
  typeLabels: any = { general:'General', exam:'Exam', holiday:'Holiday', event:'Event', urgent:'Urgent' };
  typeColors: any = { general:'#4e73df', exam:'#f1416c', holiday:'#1cc88a', event:'#f6c23e', urgent:'#f1416c' };
  audiences = ['all','students','teachers','class'];

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading.set(true);
    this.announcementsService.getAnnouncements().subscribe({
      next: (response) => {
        
        if (response.success && response.data) {
          this.announcements.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.loading.set(false);
      }
    });
  }

  get filtered(): Announcement[] {
    const announcements = this.announcements();
    if (!this.filterType()) return announcements;
    return announcements.filter(a => a.type === this.filterType());
  }

  openAdd(): void { this.editMode.set(false); this.current = this.empty(); this.showModal.set(true); }
  openEdit(a: Announcement): void { 
    this.submitting.set(false);
    this.editMode.set(true); 
    this.current = {...a};
     this.showModal.set(true); 
    }
  close(): void { this.showModal.set(false); }

  onSubmit(): void {
    this.submitting.set(true);

    const operation = this.editMode()
      ? this.announcementsService.update(this.current.id!, this.current)
      : this.announcementsService.create(this.current);

    operation.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadAnnouncements(); // Reload the list
          this.close();
        }
        this.submitting.set(false);
      },
      error: (error: any) => {
        console.error('Error saving announcement:', error);
        this.submitting.set(false);
      }
    });
  }

  togglePin(announcement: Announcement): void {
    // For now, just toggle locally - this should call an API
    // TODO: Implement toggle pin API call
    announcement.isPinned = !announcement.isPinned;
  }

  togglePublish(announcement: Announcement): void {
    this.announcementsService.togglePublish(announcement.id, !announcement.isPublished).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAnnouncements(); // Reload to get updated data
        }
      },
      error: (error) => {
        console.error('Error toggling publish status:', error);
      }
    });
  }

  deleteAnnouncement(id: string): void {
    if (confirm('Delete announcement?')) {
      this.announcementsService.deleteAnnouncement(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadAnnouncements(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting announcement:', error);
        }
      });
    }
  }

  private empty(): Partial<Announcement> {
    return { title:'', content:'', type:'general', targetAudience:'all', isPinned:false, isPublished:false };
  }
}
