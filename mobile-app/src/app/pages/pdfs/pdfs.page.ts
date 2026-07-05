import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentOutline,
  downloadOutline,
  bookmarkOutline,
  bookmarkSharp,
  cloudDownloadOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { PdfsService } from '../../services/pdfs.service';
import { PDF } from '../../models';

@Component({
  selector: 'app-pdfs',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,IonSearchbar],
  templateUrl: './pdfs.page.html',
  styleUrl: './pdfs.page.scss'
})
export class PdfsPage implements OnInit {

  pdfsService = inject(PdfsService);

  searchQuery = signal('');
  selectedType = signal('');
  loading = signal(false);

  types = ['notes','assignment','question_paper','solution','reference'];

  typeLabels: any = {
    notes:'Notes',
    assignment:'Assignment',
    question_paper:'Q.Paper',
    solution:'Solution',
    reference:'Reference'
  };

  typeColors: any = {
    notes:'#4e73df',
    assignment:'#f6c23e',
    question_paper:'#f1416c',
    solution:'#1cc88a',
    reference:'#36b9cc'
  };

  pdfs = signal<PDF[]>([]);

  // ✅ computed instead of getter
  filtered = computed(() => {
    const type = this.selectedType();
    const query = this.searchQuery().toLowerCase();

    return this.pdfs().filter(p => {
      const matchType = !type || p.type === type;

      const matchSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.courseName.toLowerCase().includes(query);

      return matchType && matchSearch;
    });
  });

  constructor() {
    addIcons({
      documentOutline,
      downloadOutline,
      bookmarkOutline,
      bookmarkSharp,
      cloudDownloadOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit(): void {
    this.loadPdfs();
  }

  loadPdfs(): void {
    this.loading.set(true);

    this.pdfsService.getPdfs().subscribe({
      next: (res) => {
        if (res.success) {
          this.pdfs.set(res.data || []);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ✅ handlers instead of ngModel
  onSearch(event: any) {
    this.searchQuery.set(event.target.value || '');
  }

  setType(type: string) {
    this.selectedType.set(type);
  }

  trackById(index: number, item: PDF) {
    return item.id;
  }

  toggleSave(pdf: PDF, e: Event) {
    e.stopPropagation();
    pdf.isSaved = !pdf.isSaved;
  }

  toggleDownload(pdf: PDF, e: Event) {
    e.stopPropagation();
    pdf.isDownloaded = !pdf.isDownloaded;
  }

  handleRefresh(event: any): void {
    this.loadPdfs();
    setTimeout(() => event.target.complete(), 800);
  }
}