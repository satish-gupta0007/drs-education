import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from '../../schemas/quiz.schema';
import { QuizAttempt, QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
  ) {}

  private transformDocument(doc: any, visited = new WeakSet()): any {
    if (!doc) return doc;
    
    // Prevent infinite recursion on circular references
    if (typeof doc === 'object') {
      if (visited.has(doc)) return doc;
      visited.add(doc);
    }
    
    if (Array.isArray(doc)) {
      return doc.map(d => this.transformDocument(d, visited));
    }
    
    if (typeof doc === 'object') {
      const { _id, ...rest } = doc;
      const transformed = { id: _id?.toString(), ...rest };
      
      // Transform nested objects with depth limit
      Object.keys(transformed).forEach(key => {
        const value = transformed[key];
        if (value && typeof value === 'object' && !visited.has(value)) {
          // Only recursively transform if it looks like a transformed document (has _id or is known structure)
          if (value._id || Array.isArray(value)) {
            transformed[key] = this.transformDocument(value, visited);
          }
        }
      });
      
      return transformed;
    }
    
    return doc;
  }

  async findAll(query: any): Promise<ApiResult> {
    const { page = 1, limit = 20, search, subjectId, status } = query;
    const filter: Record<string, any> = {};

    if (search) filter['$or'] = [{ title: { $regex: search, $options: 'i' } }];
    if (subjectId) filter['subjectId'] = subjectId;
    if (status) filter['status'] = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.quizModel
        .find(filter)
        .populate('subjectId', 'name color')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      this.quizModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      data.map(async (q) => {
        const quizData: any = {
          ...q,
          attemptCount: await this.attemptModel.countDocuments({ quizId: q['_id'] }),
        };

        if (query.studentId) {
          const attempt = await this.attemptModel.findOne({ quizId: q['_id'], studentId: query.studentId }).sort({ createdAt: -1 }).lean();
          quizData.studentAttempt = attempt ? this.transformDocument(attempt) : null;
        }

        return quizData;
      }),
    );

    return {
      success: true,
      data: this.transformDocument(enriched),
      pagination: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / +limit),
      },
    };
  }

  async findOne(id: string): Promise<ApiResult> {
    const q = await this.quizModel
      .findById(id)
      .populate('subjectId')
      .lean();

    if (!q) throw new NotFoundException(`Quiz ${id} not found`);

    return { success: true, data: this.transformDocument(q) };
  }

  async create(dto: any): Promise<ApiResult> {
    const totalMarks: number = ((dto.questions || []) as any[]).reduce(
      (s: number, q: any) => s + (q.marks || 1),
      0,
    );

    const quiz = await this.quizModel.create({
      ...dto,
      totalMarks: totalMarks || dto.totalMarks || 0,
    });

    return { success: true, data: this.transformDocument(quiz.toObject()) };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    if (dto.questions) {
      dto.totalMarks = (dto.questions as any[]).reduce(
        (s: number, q: any) => s + (q.marks || 1),
        0,
      );
    }

    const q = await this.quizModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!q) throw new NotFoundException(`Quiz ${id} not found`);

    return { success: true, data: this.transformDocument(q) };
  }

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResult> {
    return this.update(id, { status: isPublished ? 'PUBLISHED' : 'DRAFT' });
  }

  // ✅ FIXED: handles ARRAY → MAP conversion
  async submitAttempt(
    quizId: string,
    dto: { studentId: string; answers: number[]; timeTaken: number },
  ): Promise<ApiResult> {
    const quiz = await this.quizModel.findById(quizId).lean() as any;

    if (!quiz) throw new NotFoundException(`Quiz ${quizId} not found`);

    let score = 0;
    const answersMap = new Map<string, number>();

    (quiz.questions as any[]).forEach((q: any, index: number) => {
      const ans = dto.answers[index];

      if (ans !== undefined) {
        answersMap.set(q._id.toString(), ans);

        if (ans === q.correctAnswer) {
          score += q.marks || 1;
        }
      }
    });

    const isPassed = score >= quiz.passingMarks;

    const attempt = await this.attemptModel.create({
      studentId: dto.studentId,
      quizId,
      score,
      totalMarks: quiz.totalMarks,
      answers: answersMap,
      timeTaken: dto.timeTaken,
      isPassed,
    });

    return {
      success: true,
      data: this.transformDocument({
        ...attempt.toObject(),
        scorePercent: Math.round((score / quiz.totalMarks) * 100),
      }),
    };
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.quizModel.findByIdAndDelete(id))) {
      throw new NotFoundException(`Quiz ${id} not found`);
    }

    return { success: true, message: 'Quiz deleted' };
  }

  async startQuiz(quizId: string, studentId: string): Promise<ApiResult> {
    const quiz = await this.quizModel
      .findById(quizId)
      .select('-questions.correctAnswer')
      .lean();

    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found`);
    }

    return {
      success: true,
      data: this.transformDocument({
        ...quiz,
        startedAt: new Date(),
        studentId,
      }),
    };
  }

  async saveAnswer(
    quizId: string,
    dto: { studentId: string; questionId: string; selectedAnswer: number },
  ): Promise<ApiResult> {

    let attempt = await this.attemptModel.findOne({
      quizId,
      studentId: dto.studentId,
    });

    if (!attempt) {
      const quiz = await this.quizModel.findById(quizId);

      attempt = await this.attemptModel.create({
        quizId,
        studentId: dto.studentId,
        answers: new Map(),
        score: 0,
        totalMarks: quiz.totalMarks,
        timeTaken: 0,
        isPassed: false,
      });
    }

    // ✅ Ensure answers exists
    if (!attempt.answers) {
      attempt.answers = new Map();
    }

    attempt.answers.set(dto.questionId, dto.selectedAnswer);

    await attempt.save();

    return {
      success: true,
      message: 'Answer saved',
      data: this.transformDocument(attempt.toObject()),
    };
  }

  async saveProgress(
    quizId: string,
    dto: {
      studentId: string;
      currentIndex: number;
      timeLeft: number;
    },
  ): Promise<ApiResult> {

    let attempt = await this.attemptModel.findOne({
      quizId,
      studentId: dto.studentId,
    });

    if (!attempt) {
      const quiz = await this.quizModel.findById(quizId);

      attempt = await this.attemptModel.create({
        quizId,
        studentId: dto.studentId,
        answers: new Map(),
        score: 0,
        totalMarks: quiz.totalMarks,
        timeTaken: 0,
        isPassed: false,
      });
    }

    attempt.set({
      currentIndex: dto.currentIndex,
      timeLeft: dto.timeLeft,
    });

    await attempt.save();

    return {
      success: true,
      message: 'Progress saved',
      data: this.transformDocument(attempt.toObject()),
    };
  }
  async retakeQuiz(quizId: string, studentId: string): Promise<ApiResult> {
  const quiz = await this.quizModel.findById(quizId);

  if (!quiz) {
    throw new NotFoundException(`Quiz ${quizId} not found`);
  }

  // ❌ delete old attempt (simple approach)
  await this.attemptModel.deleteOne({ quizId, studentId });

  // ✅ create fresh attempt
  const attempt = await this.attemptModel.create({
    quizId,
    studentId,
    answers: new Map(),
    score: 0,
    totalMarks: quiz.totalMarks,
    timeTaken: 0,
    isPassed: false,
  });

  return {
    success: true,
    message: 'Retake started',
    data: this.transformDocument(attempt.toObject()),
  };
}
}