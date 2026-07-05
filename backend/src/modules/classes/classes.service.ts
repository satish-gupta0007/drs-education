import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassEntity, ClassDocument } from '../../schemas/class.schema';
import { Student, StudentDocument } from '../../schemas/student.schema';
import { Subject, SubjectDocument } from '../../schemas/subject.schema';
import { CreateClassDto } from './dto/create-class.dto';

export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassEntity.name) private classModel: Model<ClassDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
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

  async findAll(query: any): Promise<ApiResult> {
    const { page = 1, limit = 20, search, isActive } = query;
    const filter: Record<string, any> = {};

    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) filter['isActive'] = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.classModel
        .find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 })
        .lean(),
      this.classModel.countDocuments(filter),
    ]);
    console.log('data::', data);

    const enriched = await Promise.all(
      data.map(async (cls) => ({
        ...cls,
        studentCount: await this.studentModel.countDocuments({ classId: cls['_id'].toString() }),
        subjectCount: await this.subjectModel.countDocuments({ classId: cls['_id'].toString() }),
      })),
    );
    // console.log('enriched::',enriched);

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
    console.log('hello');

    const cls = await this.classModel.findById(id).lean();
    if (!cls) throw new NotFoundException(`Class ${id} not found`);

    const [studentCount, subjects] = await Promise.all([
      this.studentModel.countDocuments({ classId: id }),
      this.subjectModel
        .find({ classId: id })
        .select('name code color isActive')
        .lean(),
    ]);

    return { success: true, data: this.transformDocument({ ...cls, studentCount, subjects }) };
  }

  async create(dto: CreateClassDto): Promise<ApiResult> {
    const cls = await this.classModel.create(dto);
    return { success: true, data: this.transformDocument(cls.toObject()) };
  }

  async update(id: string, dto: Partial<CreateClassDto>): Promise<ApiResult> {
    const cls = await this.classModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return { success: true, data: this.transformDocument(cls) };
  }

  async toggleStatus(id: string, isActive: boolean): Promise<ApiResult> {
    const cls = await this.classModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .lean();
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return { success: true, data: this.transformDocument(cls) };
  }

  async remove(id: string): Promise<ApiResult> {
    const cls = await this.classModel.findByIdAndDelete(id);
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return { success: true, message: 'Class deleted successfully' };
  }

  async getStudents(id: string): Promise<ApiResult> {
    const students = await this.studentModel
      .find({ classId: id })
      .populate('userId', 'name email phone avatar isActive lastLoginAt')
      .lean();
    return { success: true, data: this.transformDocument(students) };
  }
}
