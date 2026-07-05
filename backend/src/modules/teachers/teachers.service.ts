import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(User.name)    private userModel:    Model<UserDocument>,
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
    const { page = 1, limit = 20, search } = query;
    const filter: Record<string, any> = {};
    if (search) {
      const users = await this.userModel
        .find({ $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] })
        .select('_id').lean();
      filter['$or'] = [
        { userId:         { $in: users.map((u) => u['_id']) } },
        { employeeId:     { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.teacherModel.find(filter)
        .populate('userId', 'name email phone avatar isActive')
        .skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean(),
      this.teacherModel.countDocuments(filter),
    ]);
    return { success: true, 
      data: data, pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / +limit) } };
  }

  async findOne(id: string): Promise<ApiResult> {
    const t = await this.teacherModel.findById(id).populate('userId', 'name email phone avatar').lean();
    if (!t) throw new NotFoundException(`Teacher ${id} not found`);
    return { success: true, data: this.transformDocument(t) };
  }

  async create(dto: any): Promise<ApiResult> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password || 'Teacher@123', 10);
    const user = await this.userModel.create({ name: dto.name, email: dto.email.toLowerCase(), phone: dto.phone, passwordHash, role: 'TEACHER' });
    const teacher = await this.teacherModel.create({ userId: user._id, employeeId: dto.employeeId, qualification: dto.qualification, specialization: dto.specialization, joinDate: dto.joinDate || new Date() });
    return { success: true, data: this.transformDocument({ ...teacher.toObject(), user: this.transformDocument(user.toObject()) }) };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    const teacher = await this.teacherModel.findById(id);
    if (!teacher) throw new NotFoundException(`Teacher ${id} not found`);

    const userUpdate: Record<string, any> = {};
    if (dto.name)  userUpdate['name']  = dto.name;
    if (dto.phone) userUpdate['phone'] = dto.phone;

    const teacherUpdate: Record<string, any> = {};
    if (dto.qualification)  teacherUpdate['qualification']  = dto.qualification;
    if (dto.specialization) teacherUpdate['specialization'] = dto.specialization;
    if (dto.employeeId)     teacherUpdate['employeeId']     = dto.employeeId;

    await Promise.all([
      Object.keys(userUpdate).length    ? this.userModel.findByIdAndUpdate(teacher.userId, userUpdate)   : Promise.resolve(null),
      Object.keys(teacherUpdate).length ? this.teacherModel.findByIdAndUpdate(id, teacherUpdate)          : Promise.resolve(null),
    ]);
    return this.findOne(id);
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.teacherModel.findByIdAndDelete(id))) throw new NotFoundException(`Teacher ${id} not found`);
    return { success: true, message: 'Teacher removed' };
  }
}
