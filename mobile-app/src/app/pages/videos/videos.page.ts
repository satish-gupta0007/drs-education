import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonSearchbar, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playCircleOutline, timeOutline, eyeOutline,
  bookmarkOutline, bookmarkSharp,
  gridOutline, listOutline,
  starOutline, checkmarkCircleOutline, cloudDownloadOutline
} from 'ionicons/icons';

import { VideosService } from '../../services/videos.service';
import { Video } from '../../models';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonSearchbar, IonIcon, IonRefresher, IonRefresherContent
  ],
  templateUrl: './videos.page.html',
  styleUrl: './videos.page.scss'
})
export class VideosPage implements OnInit {

  router = inject(Router);
  videosService = inject(VideosService);

  searchQuery = signal('');
  selectedSubject = signal('');
  selectedFilter = signal('all');
  viewMode = signal<'list' | 'grid'>('list');
  loading = signal(false);

  subjects: string[] = [];

  filters = [
    { id:'all', label:'All' },
    { id:'recent', label:'Recent' },
    { id:'watched', label:'Watched' },
    { id:'saved', label:'Saved' },
    { id:'downloaded', label:'Downloaded' }
  ];

  allVideos = signal<Video[]>([]);

  // ✅ Computed (Fix for your error)
  filteredVideos = computed(() => {
    const subject = this.selectedSubject();
    const filter = this.selectedFilter();
    const query = this.searchQuery().toLowerCase();

    return this.allVideos().filter(v => {

      const matchSubject = !subject || v.courseName === subject;

      const matchFilter =
        filter === 'all' ||
        (filter === 'watched' && v.isWatched) ||
        (filter === 'saved' && v.tags?.includes('saved')) ||
        (filter === 'downloaded' && v.isDownloaded);

      const matchSearch =
        !query ||
        v.title.toLowerCase().includes(query) ||
        v.courseName.toLowerCase().includes(query) ||
        v.tags?.some(tag => tag.toLowerCase().includes(query));

      return matchSubject && matchFilter && matchSearch;
    });
  });

  constructor() {
    addIcons({
      playCircleOutline, timeOutline, eyeOutline,
      bookmarkOutline, bookmarkSharp,
      gridOutline, listOutline,
      starOutline, checkmarkCircleOutline, cloudDownloadOutline
    });
  }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading.set(true);

    this.videosService.getVideos({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.success) {
          const videos = res.data as Video[] || [];
          this.allVideos.set(videos);
          this.subjects = Array.from(new Set(videos.map((v: Video) => v.courseName))).filter(Boolean) as string[];
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value || '');
  }

  setSubject(subject: string) {
    this.selectedSubject.set(subject);
  }

  setFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  toggleView() {
    this.viewMode.update(v => v === 'list' ? 'grid' : 'list');
  }

  trackById(index: number, item: Video) {
    return item.id;
  }

  openVideo(id: string) {
    this.router.navigate(['/video-player', id]);
  }

  toggleSave(video: Video, e: Event) {
    e.stopPropagation();
    video.tags = video.tags || [];

    const i = video.tags.indexOf('saved');
    i > -1 ? video.tags.splice(i, 1) : video.tags.push('saved');
  }

  handleRefresh(event: any): void {
    this.loadVideos();
    setTimeout(() => event.target.complete(), 800);
  }
}