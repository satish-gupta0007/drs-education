// =====================
// DRS Education Models
// =====================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;          // e.g., "Class 10", "Grade 5"
  description?: string;
  section?: string;
  academicYear: string;
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
  subjectCount: number;
  isActive: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  description?: string;
  teacherId?: string;
  teacherName?: string;
  videoCount: number;
  pdfCount: number;
  quizCount: number;
  thumbnail?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId?: string;
  teacherName?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;         // in seconds
  fileSize: number;         // in bytes
  viewCount: number;
  chapter?: string;
  topic?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  uploadStatus: 'uploading' | 'processing' | 'ready' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PDF {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  pageCount: number;
  downloadCount: number;
  type: 'notes' | 'assignment' | 'question_paper' | 'solution' | 'reference';
  chapter?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  classId: any;
  className: string;
  parentName?: string;
  parentPhone?: string;
  avatar?: string;
  enrollmentDate: Date;
  isActive: boolean;
  totalWatchTime: number;   // in minutes
  quizScore: number;        // average %
  lastActive: Date;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  qualification: string;
  specialization: string;
  subjects: string[];
  classes: string[];
  avatar?: string;
  joinDate: Date;
  isActive: boolean;
  videoCount: number;
  totalStudents: number;
  rating: number;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'exam' | 'holiday' | 'event' | 'urgent';
  targetAudience: 'all' | 'students' | 'teachers' | 'class';
  targetClassIds?: string[];
  attachmentUrl?: string;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subjectId: any;
  subjectName: string;
  classId: any;
  className: string;
  questions: QuizQuestion[];
  totalMarks: number;
  passingMarks: number;
  duration: number;       // in minutes
  attempts: number;
  isPublished: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalVideos: number;
  totalPDFs: number;
  totalQuizzes: number;
  activeStudentsToday: number;
  videoViewsToday: number;
  newEnrollmentsThisMonth: number;
  averageQuizScore: number;
  totalWatchTimeHours: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}
