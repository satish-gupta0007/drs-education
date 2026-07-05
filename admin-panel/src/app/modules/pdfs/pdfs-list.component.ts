import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDF } from '../../core/models';
import { PdfsService } from '../../core/services/pdfs.service';
import { forkJoin } from 'rxjs';
import { SubjectsService } from '../../core/services/subjects.service';
import { ClassesService } from '../../core/services/classes.service';

@Component({
  selector: 'app-pdfs-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdfs-list.component.html',
  styleUrl: './pdfs-list.component.scss'
})
export class PdfsListComponent implements OnInit {
  pdfsService = inject(PdfsService);
subjectsService = inject(SubjectsService);
classesService = inject(ClassesService);
  pdfs = signal<PDF[]>([]);
  showModal = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  filterType = signal('');
  filterClass = signal('');
  submitting = signal(false);
  uploadProgress = signal(0);
  isDragging = signal(false);
  selectedFile: File | null = null;
  loading = signal(false);

  currentPdf: Partial<PDF> = this.emptyPdf();

  classes:any[]   = [];
  subjects:any[]  = [];
  pdfTypes  = ['notes','assignment','question_paper','solution','reference'];
  typeLabels: any = { notes:'Notes', assignment:'Assignment', question_paper:'Question Paper', solution:'Solution', reference:'Reference Material' };
  typeColors: any = { notes:'#4e73df', assignment:'#f6c23e', question_paper:'#f1416c', solution:'#1cc88a', reference:'#36b9cc' };

  ngOnInit(): void {
    this.loadSupportedData().subscribe({
      next: ({ subjects, classes }) => {
        if (subjects.success && subjects.data) this.subjects = subjects.data;
        if (classes.success && classes.data) this.classes = classes.data;
    this.loadPdfs();

      },
      error: (error) => console.error('Error loading supported data:', error),
      complete: () => this.loadPdfs()
    });
  }

  loadPdfs(): void {
    this.loading.set(true);
    this.pdfsService.getPdfs().subscribe({
      next: (response) => {
        if (response.success && response.data) {
       const updatedPdfs =  response.data.map((x:any)=>{
            return{
              ...x,
              type:x.type.toLowerCase(),
              status:x.status.toLowerCase(),
              subjectName:this.subjects.find((s:any)=>s.id === x.subjectId.id)?.name || 'Unknown Subject',
              className:this.classes.find((c:any)=>c.id === x.id)?.name || 'Unknown Class'
            }
          });
          console.log('updatedPdfs::',updatedPdfs);
          
          this.pdfs.set(updatedPdfs);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading PDFs:', error);
        this.loading.set(false);
      }
    });
  }
loadSupportedData(){
   return forkJoin({
      subjects: this.subjectsService.getSubjects(),
      classes: this.classesService.getClasses(),
      // videos: this.videosService.getVideos({ limit: 5, sort: '-createdAt' }),
      // announcements: this.announcementsService.getAnnouncements()
    });
}
  get filteredPdfs(): PDF[] {
    let filtered = this.pdfs();

    if (this.filterType()) {
      filtered = filtered.filter(p => p.type === this.filterType());
    }
    if (this.filterClass()) {
      filtered = filtered.filter(p => p.className === this.filterClass());
    }
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.subjectName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  openAddModal(): void  { this.editMode.set(false); this.currentPdf = this.emptyPdf(); this.selectedFile = null; this.showModal.set(true); }
  openEditModal(p: PDF): void {
     this.editMode.set(true);
      this.currentPdf = {...p}; 
      this.showModal.set(true); 
    }
  closeModal(): void { this.showModal.set(false); this.uploadProgress.set(0); }

  onFileDrop(event: DragEvent): void {
    event.preventDefault(); this.isDragging.set(false);
    const f = event.dataTransfer?.files[0];
    if (f && f.type === 'application/pdf') this.selectedFile = f;
  }
  onFileSelect(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) { this.selectedFile = f; if (!this.currentPdf.title) this.currentPdf.title = f.name.replace('.pdf',''); }
  }

  onSubmit(): void {
    if (!this.selectedFile && !this.editMode()) {
      alert('Please select a PDF file');
      return;
    }

    this.submitting.set(true);
    this.uploadProgress.set(0);

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('title', this.currentPdf.title || '');
      formData.append('subjectId', this.currentPdf.subjectName || ''); // subjectName contains the ID
      formData.append('type', this.currentPdf.type?.toUpperCase() || 'notes');
      formData.append('chapter', this.currentPdf.chapter || '');
      formData.append('tags', JSON.stringify(this.currentPdf.tags || []));

      this.pdfsService.uploadPdf(formData).subscribe({
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
              this.loadPdfs();
              this.closeModal();
              this.submitting.set(false);
            } else {
              alert('Error uploading PDF: ' + (event.body?.message || 'Unknown error'));
              this.submitting.set(false);
            }
          }
        },
        error: (error: any) => {
          console.error('Error uploading PDF:', error);
          alert('Error uploading PDF: ' + (error?.error?.message || error?.message || 'Unknown error'));
          this.submitting.set(false);
        }
      });
    } else if (this.editMode()) {
      // Update existing PDF
      this.pdfsService.updatePdf(this.currentPdf.id!, this.currentPdf).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPdfs(); // Reload the list
            this.closeModal();
          }
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error updating PDF:', error);
          this.submitting.set(false);
        }
      });
    }
  }

  togglePublish(pdf: PDF): void {
    // For now, toggle locally - this should call an API
    // TODO: Implement toggle publish API call for PDFs
    pdf.isPublished = !pdf.isPublished;
  }

  deletePdf(id: string): void {
    if (confirm('Delete this file?')) {
      this.pdfsService.deletePdf(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPdfs(); // Reload the list
          }
        },
        error: (error) => {
          console.error('Error deleting PDF:', error);
        }
      });
    }
  }

  formatSize(bytes: number): string {
    if (bytes > 1e6) return (bytes/1e6).toFixed(1)+' MB';
    return (bytes/1e3).toFixed(0)+' KB';
  }

  private emptyPdf(): Partial<PDF> {
    return { title:'', subjectName:'', className:'', type:'notes', chapter:'', tags:[], isPublished:false };
  }
  publishStatus(pdf: any) {
    if (pdf.status === 'published') return 'published';
    // if (pdf.status === 'processing') return 'processing';
    // if (pdf.status === 'failed') return 'failed';
    return ''; 
  }
}
