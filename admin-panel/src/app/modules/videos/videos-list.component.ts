import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Video } from '../../core/models';
import { VideosService } from '../../core/services/videos.service';
import { SubjectsService } from '../../core/services/subjects.service';
import { ClassesService } from '../../core/services/classes.service';

@Component({
  selector: 'app-videos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos-list.component.html',
  styleUrl: './videos-list.component.scss'
})
export class VideosListComponent implements OnInit {
  videosService = inject(VideosService);
  subjectsService = inject(SubjectsService);
  classesService = inject(ClassesService);

  videos = signal<Video[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  filterSubject = signal('');
  filterStatus = signal('');
  submitting = signal(false);
  uploadProgress = signal(0);
  isDragging = signal(false);

  currentVideo: Partial<Video> = this.emptyVideo();
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  classes: any[] = [];
  subjects: any[] = [];

  ngOnInit(): void {
    this.loadVideos();
    this.loadClasses();
    this.loadSubjects();
  }

  loadVideos(): void {
    this.loading.set(true);
    this.videosService.getVideos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.videos.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.loading.set(false);
      }
    });
  }

  loadClasses(): void {
    this.classesService.getClasses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.classes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  loadSubjects(): void {
    this.subjectsService.getSubjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  get filteredVideos(): Video[] {
    let result = this.videos();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(query) ||
        (v.subjectName || '').toLowerCase().includes(query)
      );
    }
    if (this.filterSubject()) result = result.filter(v => (v.subjectName || '') === this.filterSubject());
    if (this.filterStatus() === 'published') result = result.filter(v => v.isPublished);
    if (this.filterStatus() === 'draft') result = result.filter(v => !v.isPublished);
    return result;
  }

  openAddModal(): void {
    this.editMode.set(false);
    this.currentVideo = this.emptyVideo();
    this.selectedFile = null;
    this.previewUrl = null;
    this.showModal.set(true);
  }

  openEditModal(video: Video): void {
    this.editMode.set(true);
    this.currentVideo = { ...video };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.uploadProgress.set(0);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('video/')) {
      this.handleFileSelect(file);
    }
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFileSelect(file);
  }

  handleFileSelect(file: File): void {
    this.selectedFile = file;
    this.currentVideo.title = this.currentVideo.title || file.name.replace(/\.[^/.]+$/, '');
    // Create video preview URL
    this.previewUrl = URL.createObjectURL(file);
  }

  onSubmit(): void {
    if (!this.selectedFile && !this.editMode()) {
      alert('Please select a video file');
      return;
    }

    this.submitting.set(true);
    this.uploadProgress.set(0);

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('title', this.currentVideo.title || '');
      formData.append('description', this.currentVideo.description || '');
      formData.append('subjectId', this.currentVideo.subjectId || '');
      formData.append('classId', this.currentVideo.classId || '');
      formData.append('chapter', this.currentVideo.chapter || '');
      formData.append('topic', this.currentVideo.topic || '');
      formData.append('tags', JSON.stringify(this.currentVideo.tags || []));
      formData.append('className', this.currentVideo.className || '');
      formData.append('subjectName', this.currentVideo.subjectName || '');
      formData.append('isPublished', this.currentVideo.isPublished ? 'true' : 'false');
      formData.append('isFeatured', this.currentVideo.isFeatured ? 'true' : 'false');

      this.videosService.uploadVideo(formData).subscribe({
        next: (event: any) => {
          // Handle upload progress
          if (event.type === 1) {
            // ProgressEvent - type 1 is HttpProgressEvent
            if (event.total) {
              this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
            }
          } else if (event.type === 4) {
            // Response received - type 4 is HttpResponse
            if (event.body && event.body.success) {
              this.loadVideos();
              this.closeModal();
              this.submitting.set(false);
            } else {
              alert('Error uploading video: ' + (event.body?.message || 'Unknown error'));
              this.submitting.set(false);
            }
          }
        },
        error: (error: any) => {
          console.error('Error uploading video:', error);
          alert('Error uploading video: ' + (error?.error?.message || error?.message || 'Unknown error'));
          this.submitting.set(false);
        }
      });
    } else if (this.editMode()) {
      // Update existing video
      this.videosService.updateVideo(this.currentVideo.id!, this.currentVideo).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadVideos(); // Reload the list
            this.closeModal();
          }
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error updating video:', error);
          this.submitting.set(false);
        }
      });
    }
  }

  togglePublish(video: Video): void {
    this.videosService.togglePublish(video.id, !video.isPublished).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadVideos(); // Reload to get updated data
        }
      },
      error: (error) => {
        console.error('Error toggling publish status:', error);
      }
    });
  }

  toggleFeatured(video: Video): void {
    // For now, toggle locally - this should call an API
    // TODO: Implement toggle featured API call
    video.isFeatured = !video.isFeatured;
  }

  deleteVideo(id: string): void {
    if (confirm('Delete this video?')) {
      this.videosService.deleteVideo(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadVideos(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting video:', error);
        }
      });
    }
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }

  formatFileSize(bytes: number): string {
    if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
    return `${(bytes / 1e3).toFixed(0)} KB`;
  }

  private emptyVideo(): Partial<Video> {
    return { title: '', description: '', subjectName: '', className: '', chapter: '', topic: '', tags: [], isPublished: false, isFeatured: false };
  }
}
