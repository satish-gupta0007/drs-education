import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Subject, SubjectDocument } from '../../schemas/subject.schema';
import { ClassEntity, ClassDocument } from '../../schemas/class.schema';
import { Video, VideoDocument } from '../../schemas/video.schema';
import { Quiz, QuizDocument } from '../../schemas/quiz.schema';
import { VideoWatch, VideoWatchDocument } from '../../schemas/video-watch.schema';
import { QuizAttempt, QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private model: Model<SubjectDocument>,
    @InjectModel(ClassEntity.name) private classModel: Model<ClassDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(VideoWatch.name) private videoWatchModel: Model<VideoWatchDocument>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttemptDocument>,
  ) { }

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

  private mapSubject(subject: any): any {
    const classId = typeof subject?.classId === 'object' && subject.classId !== null
      ? subject.classId._id?.toString() || subject.classId.id || ''
      : subject?.classId?.toString?.() || '';

    const teacherId = typeof subject?.teacherId === 'object' && subject.teacherId !== null
      ? subject.teacherId._id?.toString() || subject.teacherId.id || ''
      : subject?.teacherId?.toString?.() || '';

    return {
      id: subject?.id || subject?._id?.toString(),
      name: subject?.name ?? '',
      code: subject?.code ?? '',
      classId,
      className: subject?.classId?.name || '',
      description: subject?.description || '',
      teacherId,
      teacherName: subject?.teacherId?.userId?.name || '',
      videoCount: 0,
      pdfCount: 0,
      quizCount: 0,
      thumbnail: subject?.thumbnail || '',
      color: subject?.color || '#4e73df',
      progress: 0,
      isFavorite: false,
      totalDuration: 0,
      completedDuration: 0,
      isActive: subject?.isActive ?? true,
    };
  }

  private async isSubjectEnrolled(studentId: string, subjectId: string, subjectDoc?: any): Promise<boolean> {
    if (!studentId || !subjectId) return false;

    const doc = subjectDoc || await this.model.findById(subjectId).lean();
    
    const enrolledStudents = (doc?.enrolledStudents || []) as any[];
    if (enrolledStudents.some((entry: any) => entry?.id?.toString() === studentId)) {
// console.log('entry?.id::',entry?.id);

      return true;
    }

    const [videoProgress, quizProgress] = await Promise.all([
      this.videoWatchModel.countDocuments({
        studentId,
        videoId: { $in: await this.videoModel.find({ subjectId }).distinct('_id') },
      }),
      this.quizAttemptModel.countDocuments({
        studentId,
        quizId: { $in: await this.quizModel.find({ subjectId }).distinct('_id') },
      }),
    ]);

    return videoProgress > 0 || quizProgress > 0;
  }

  async findAll(query: any): Promise<ApiResult> {
    const { page = 1, limit = 20, search, classId, isActive, studentId } = query;
    const filter: Record<string, any> = {};
    if (search) filter['$or'] = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
    if (classId) {
      if (mongoose.isValidObjectId(classId)) {
        filter['classId'] = new mongoose.Types.ObjectId(classId);
      } else {
        const classDoc = await this.classModel.findOne({ name: classId }).lean();
        if (classDoc) filter['classId'] = classDoc._id;
      }
    }
    if (isActive !== undefined) filter['isActive'] = isActive === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    console.log('filter::',filter);
    
    const [data, total] = await Promise.all([
      this.model.find(filter)
        .populate('classId', 'name section')
        .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name' } })
        .skip(skip).limit(Number(limit)).sort({ name: 1 }).lean(),
      this.model.countDocuments(filter),
    ]);
    const transformedData = this.transformDocument(data);
    const courses = await Promise.all(
      transformedData.map(async (subject: any) => {
        const mapped = this.mapSubject(subject);
        console.log('mapped::',mapped);
        console.log('studentId::',studentId);

        
        if (studentId) {
          mapped.isEnrolled = await this.isSubjectEnrolled(studentId, mapped.id, subject);
        }
        return mapped;
      }),
    );
    return { success: true, data: courses, pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / +limit) } };
  }

  async findOne(id: string): Promise<ApiResult> {
    const s = await this.model.findById(id)
      .populate('classId')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } })
      .lean();
    if (!s) throw new NotFoundException(`Subject ${id} not found`);
    return { success: true, data: this.mapSubject(this.transformDocument(s)) };
  }

  async create(dto: any): Promise<ApiResult> {
    console.log('dto::', dto);

    const s = await this.model.create(dto);
    return { success: true, data: this.mapSubject(this.transformDocument(s.toObject())) };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    console.log('mongoose.isValidObjectId(dto.classId)::',mongoose.isValidObjectId(dto.classId));
    
    if (dto.classId) {
      dto.classId=new mongoose.Types.ObjectId(dto.classId);
    }
    console.log('dto::',dto);

    const s = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!s) throw new NotFoundException(`Subject ${id} not found`);
    return { success: true, data: this.mapSubject(this.transformDocument(s)) };
  }

  async toggleStatus(id: string, isActive: boolean): Promise<ApiResult> {
    const s = await this.model.findByIdAndUpdate(id, { isActive }, { new: true }).lean();
    if (!s) throw new NotFoundException(`Subject ${id} not found`);
    return { success: true, data: this.mapSubject(this.transformDocument(s)) };
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.model.findByIdAndDelete(id))) throw new NotFoundException(`Subject ${id} not found`);
    return { success: true, message: 'Subject deleted' };
  }

  async toggleEnrollment(id: string, studentId?: string, enrolled = true): Promise<ApiResult> {
    if (!studentId) {
      throw new NotFoundException('Student ID is required for enrollment changes');
    }

    const subject = await this.model.findById(id);
    if (!subject) throw new NotFoundException(`Subject ${id} not found`);

    const normalizedStudentId = new mongoose.Types.ObjectId(studentId);
    const currentStudents = (subject.enrolledStudents || []).map((entry: any) =>
      entry instanceof mongoose.Types.ObjectId ? entry : new mongoose.Types.ObjectId(entry?.toString?.() || entry),
    );

    if (enrolled) {
      if (!currentStudents.some((entry: mongoose.Types.ObjectId) => entry.toString() === studentId)) {
        subject.enrolledStudents = [...currentStudents, normalizedStudentId];
      }
    } else {
      subject.enrolledStudents = currentStudents.filter((entry: mongoose.Types.ObjectId) => entry.toString() !== studentId);
    }

    await subject.save();

    const updated = await this.model.findById(id).lean();
    return { success: true, data: this.mapSubject(this.transformDocument(updated)) };
  }

//   async enrollCourse(
//   courseId: string,
//   dto: EnrollCourseDto,
// ) {
//   const student = await this.studentModel.findById(dto.studentId);

//   if (!student) {
//     throw new NotFoundException('Student not found');
//   }

//   const course = await this.model.findById(courseId);

//   if (!course) {
//     throw new NotFoundException('Course not found');
//   }

//   const alreadyEnrolled =
//     await this.enrollmentModel.findOne({
//       studentId: student._id,
//       courseId: course._id,
//     });

//   if (alreadyEnrolled) {
//     throw new BadRequestException(
//       'Student already enrolled in this course',
//     );
//   }

//   const enrollment =
//     await this.enrollmentModel.create({
//       studentId: student._id,
//       courseId: course._id,
//       classId: student.classId,
//       enrolledAt: new Date(),
//       progress: 0,
//       completed: false,
//       status: 'ACTIVE',
//     });

//   return {
//     success: true,
//     message: 'Course enrolled successfully',
//     data: enrollment,
//   };
// }
}
