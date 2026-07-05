import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playOutline, pauseOutline, expandOutline, downloadOutline,
  heartOutline, heartSharp, chatbubbleOutline, shareOutline,
  thumbsUpOutline, bookmarkOutline, bookmarkSharp,
  timeOutline, playCircleOutline, chevronDownOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

import { VideosService } from '../../services/videos.service';
import { AuthService } from '../../services/auth.service';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons, IonIcon
  ],
  templateUrl: './video-player.page.html',
  styleUrl: './video-player.page.scss'
})
export class VideoPlayerPage implements OnInit, OnDestroy {

  private videosService = inject(VideosService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  videoId = signal('');
  loading = signal(true);

  // Player state
  isPlaying = signal(false);
  isBookmarked = signal(false);
  isLiked = signal(false);
  progress = signal(0);

  activeTab = signal<'notes' | 'quiz' | 'related'>('notes');

  newComment = '';

  video = signal<any>(null);
  relatedVideos = signal<any[]>([]);
  notes = signal<any[]>([]);
  comments = signal<Comment[]>([]);
  watchProgress = signal<any>(null);

  // ✅ Computed safe video
  safeVideo = computed(() => this.video() || {});

  constructor() {
    addIcons({
      playOutline, pauseOutline, expandOutline, downloadOutline,
      heartOutline, heartSharp, chatbubbleOutline, shareOutline,
      thumbsUpOutline, bookmarkOutline, bookmarkSharp,
      timeOutline, playCircleOutline, chevronDownOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'] || '1';
    this.videoId.set(id);
    this.loadVideoData();
  }

  ngOnDestroy(): void {}

  loadVideoData(): void {
    this.loading.set(true);

    // ✅ Video
    this.videosService.getVideoById(this.videoId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.video.set(res.data);

          // load related AFTER video
          this.loadRelatedVideos(res.data.subjectId);
        }
      },
      error: (e) => console.error(e)
    });

    // ✅ Watch Progress
    const user = this.authService.currentUser();
    if (user) {
      this.videosService.getWatchProgress(this.videoId(), user.id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.watchProgress.set(res.data);
            const pct = (res.data.lastPosition / res.data.videoDuration) * 100;
            this.progress.set(Math.round(pct || 0));
          }
        }
      });
    }

    this.notes.set([]);
    this.comments.set([]);

    this.loading.set(false);
  }

  loadRelatedVideos(subjectId: string) {
    if (!subjectId) return;

    this.videosService.getVideos({ subjectId, limit: 4 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.relatedVideos.set(
            (res.data || []).filter((v: any) => v.id !== this.videoId())
          );
        }
      }
    });
  }

  // ================= Actions =================

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  toggleBookmark() {
    this.isBookmarked.update(v => !v);
  }

  toggleLike() {
    this.isLiked.update(v => !v);

    const v = this.video();
    if (!v) return;

    const updated = {
      ...v,
      likes: this.isLiked() ? (v.likes || 0) + 1 : (v.likes || 0) - 1
    };

    this.video.set(updated);
  }

  goToRelated(id: string) {
    this.router.navigate(['/video-player', id]);
  }

  scrubTo(event: MouseEvent, el: HTMLElement) {
    const pct = (event.offsetX / el.offsetWidth) * 100;
    this.progress.set(Math.round(pct));
  }

  addComment() {
    if (!this.newComment.trim()) return;

    this.comments.update(list => [
      {
        id: Date.now().toString(),
        user: 'You',
        avatar: 'Y',
        text: this.newComment,
        time: 'now',
        likes: 0
      },
      ...list
    ]);

    this.newComment = '';
  }
}