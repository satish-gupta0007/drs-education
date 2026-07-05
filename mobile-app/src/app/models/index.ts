export interface User {
  id: string; name: string; email: string; phone?: string; avatar?: string;
  classId?: string; className?: string; studentId?: string; rollNumber?: string; token?: string;
}
export interface Course {
  id: string; name: string; className: string; description?: string; teacherName: string;
  videoCount: number; pdfCount: number; quizCount: number; thumbnail?: string;
  color: string; progress: number; isEnrolled: boolean; isFavorite: boolean;
  totalDuration: number; completedDuration: number;
}
export interface Video {
  id: string; title: string; description?: string; courseId: string; courseName: string;
  className: string; teacherName: string; videoUrl: string; thumbnailUrl?: string;
  duration: number; viewCount: number; chapter?: string; topic?: string; tags: string[];
  isWatched: boolean; watchedDuration: number; isFeatured: boolean;
  isDownloaded: boolean; downloadProgress?: number; createdAt: Date;
}
export interface PDF {
  id: string; title: string; description?: string; courseId: string; courseName: string;
  className: string; fileUrl: string; fileSize: number; pageCount: number;
  type: 'notes' | 'assignment' | 'question_paper' | 'solution' | 'reference';
  chapter?: string; isBookmarked: boolean; isDownloaded: boolean; createdAt: Date;
  isSaved?: boolean;
}
export interface Quiz {
  id: string; title: string; courseId: string; courseName: string; className: string;
  totalQuestions: number; totalMarks: number; passingMarks: number; duration: number;
  attempts: number; bestScore?: number; isCompleted: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
}
export interface QuizQuestion {
  id: string; question: string; type: 'mcq' | 'true_false'; options: string[];
  correctAnswer: number; explanation?: string; marks: number;
  difficulty: 'easy' | 'medium' | 'hard'; selectedAnswer?: number;
}
export interface Announcement {
  id: string; title: string; content: string;
  type: 'general' | 'exam' | 'holiday' | 'event' | 'urgent';
  isPinned: boolean; isRead: boolean; publishedAt: Date;
}
export interface StudentProgress {
  totalVideosWatched: number; totalWatchTimeMinutes: number; totalPdfsRead: number;
  totalQuizzesTaken: number; averageScore: number; currentStreak: number;
  longestStreak: number; badges: Badge[]; weeklyActivity: number[];
}
export interface Badge {
  id: string; name: string; description: string; icon: string; earnedAt: Date; color: string;
}
