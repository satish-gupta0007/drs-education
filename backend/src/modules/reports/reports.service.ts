import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument }             from '../../schemas/user.schema';
import { Student, StudentDocument }       from '../../schemas/student.schema';
import { Teacher, TeacherDocument }       from '../../schemas/teacher.schema';
import { ClassEntity, ClassDocument }     from '../../schemas/class.schema';
import { Subject, SubjectDocument }       from '../../schemas/subject.schema';
import { Video, VideoDocument }           from '../../schemas/video.schema';
import { VideoWatch, VideoWatchDocument } from '../../schemas/video-watch.schema';
import { Pdf, PdfDocument }               from '../../schemas/pdf.schema';
import { Quiz, QuizDocument }             from '../../schemas/quiz.schema';
import { QuizAttempt, QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(User.name)          private userModel:    Model<UserDocument>,
    @InjectModel(Student.name)       private studentModel: Model<StudentDocument>,
    @InjectModel(Teacher.name)       private teacherModel: Model<TeacherDocument>,
    @InjectModel(ClassEntity.name)   private classModel:   Model<ClassDocument>,
    @InjectModel(Subject.name)       private subjectModel: Model<SubjectDocument>,
    @InjectModel(Video.name)         private videoModel:   Model<VideoDocument>,
    @InjectModel(VideoWatch.name)    private watchModel:   Model<VideoWatchDocument>,
    @InjectModel(Pdf.name)           private pdfModel:     Model<PdfDocument>,
    @InjectModel(Quiz.name)          private quizModel:    Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)   private attemptModel: Model<QuizAttemptDocument>,
  ) {}

  private transformDocument(doc: any): any {
    if (!doc) return doc;
    if (Array.isArray(doc)) {
      return doc.map(d => this.transformDocument(d));
    }
    if (typeof doc === 'object') {
      const { _id, ...rest } = doc;
      const transformed = { id: _id?.toString(), ...rest };
      // Recursively transform nested objects
      Object.keys(transformed).forEach(key => {
        if (transformed[key] && typeof transformed[key] === 'object') {
          transformed[key] = this.transformDocument(transformed[key]);
        }
      });
      return transformed;
    }
    return doc;
  }

  async getDashboardStats(): Promise<ApiResult> {
    const [
      totalStudents, totalTeachers, totalClasses, totalSubjects,
      totalVideos, totalPdfs, totalQuizzes, publishedVideos,
      watchesToday, attemptsToday, allWatches, allAttempts,
    ] = await Promise.all([
      this.studentModel.countDocuments(),
      this.teacherModel.countDocuments(),
      this.classModel.countDocuments({ isActive: true }),
      this.subjectModel.countDocuments({ isActive: true }),
      this.videoModel.countDocuments(),
      this.pdfModel.countDocuments(),
      this.quizModel.countDocuments(),
      this.videoModel.countDocuments({ status: 'PUBLISHED' }),
      this.watchModel.countDocuments({ updatedAt: { $gte: this.startOfDay() } }),
      this.attemptModel.countDocuments({ createdAt: { $gte: this.startOfDay() } }),
      this.watchModel.find().select('watchedDuration').lean(),
      this.attemptModel.find().select('score totalMarks').lean(),
    ]);

    const totalWatchSeconds = allWatches.reduce(
      (s, w) => s + (w.watchedDuration || 0), 0,
    );
    const avgScore =
      allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) /
              allAttempts.length,
          )
        : 0;

    return {
      success: true,
      data: {
        totalStudents, totalTeachers, totalClasses, totalSubjects,
        totalVideos,   totalPdfs,     totalQuizzes, publishedVideos,
        videoViewsToday:     watchesToday,
        quizzesToday:        attemptsToday,
        totalWatchTimeHours: Math.round(totalWatchSeconds / 3600),
        averageQuizScore:    avgScore,
      },
    };
  }

  async getTopVideos(limit = 10): Promise<ApiResult> {
    const videos = await this.videoModel
      .find({ status: 'PUBLISHED' })
      .sort({ viewCount: -1 })
      .limit(Number(limit))
      .populate('subjectId', 'name color')
      .select('title viewCount duration isFeatured subjectId')
      .lean();
    return { success: true, data: this.transformDocument(videos) };
  }

  async getTopStudents(limit = 10): Promise<ApiResult> {
    const agg: any[] = await this.attemptModel.aggregate([
      {
        $group: {
          _id:         '$studentId',
          totalScore:  { $sum: '$score' },
          totalMarks:  { $sum: '$totalMarks' },
          quizCount:   { $sum: 1 },
          passedCount: { $sum: { $cond: ['$isPassed', 1, 0] } },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: Number(limit) },
    ]);

    const enriched = await Promise.all(
      agg.map(async (a) => {
        const student = await this.studentModel
          .findById(a._id)
          .populate('userId', 'name avatar')
          .lean();

        const watchAgg: any[] = await this.watchModel.aggregate([
          { $match: { studentId: new Types.ObjectId(String(a._id)) } },
          { $group: { _id: null, total: { $sum: '$watchedDuration' } } },
        ]);

        return {
          studentId:    a._id,
          student,
          avgScore:     a.totalMarks > 0
            ? Math.round((a.totalScore / a.totalMarks) * 100)
            : 0,
          quizzesTaken: a.quizCount,
          quizzesPassed:a.passedCount,
          watchMinutes: watchAgg[0] ? Math.round(watchAgg[0].total / 60) : 0,
        };
      }),
    );

    return { success: true, data: this.transformDocument(enriched) };
  }

  async getSubjectEngagement(): Promise<ApiResult> {
    const subjects = await this.subjectModel
      .find({ isActive: true })
      .lean();

    const enriched: any[] = await Promise.all(
      subjects.map(async (sub) => {
        const subId = sub['_id'] as Types.ObjectId;

        const [videoCount, pdfCount, quizCount, videos, quizIds] = await Promise.all([
          this.videoModel.countDocuments({ subjectId: subId, status: 'PUBLISHED' }),
          this.pdfModel.countDocuments({ subjectId: subId, status: 'PUBLISHED' }),
          this.quizModel.countDocuments({ subjectId: subId, status: 'PUBLISHED' }),
          this.videoModel.find({ subjectId: subId }).select('viewCount').lean(),
          this.quizModel.find({ subjectId: subId }).select('_id').lean(),
        ]);

        const totalViews = videos.reduce((s, v) => s + (v.viewCount || 0), 0);

        const quizAttempts = await this.attemptModel
          .find({ quizId: { $in: quizIds.map((q) => q['_id']) } })
          .select('score totalMarks')
          .lean();

        const avgScore =
          quizAttempts.length > 0
            ? Math.round(
                quizAttempts.reduce(
                  (s, a) => s + (a.score / a.totalMarks) * 100,
                  0,
                ) / quizAttempts.length,
              )
            : 0;

        return { ...sub, videoCount, pdfCount, quizCount, totalViews, avgScore };
      }),
    );

    return {
      success: true,
      data:    enriched.sort((a, b) => b.totalViews - a.totalViews),
    };
  }

  async getEnrollmentTrend(months = 12): Promise<ApiResult> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trend = await this.studentModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return { success: true, data: trend };
  }

  private startOfDay(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
