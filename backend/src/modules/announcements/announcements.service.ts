import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement, AnnouncementDocument } from '../../schemas/announcement.schema';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class AnnouncementsService {
  constructor(@InjectModel(Announcement.name) private model: Model<AnnouncementDocument>) {}

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
    const { page = 1, limit = 20, type, audience, isPublished } = query;
    const filter: Record<string, any> = {};
    if (type)        filter['type']        = type.toUpperCase();
    if (audience)    filter['audience']    = audience.toUpperCase();
    if (isPublished !== undefined) filter['isPublished'] = isPublished === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      this.model.countDocuments(filter),
    ]);
    return { success: true, data: this.transformDocument(data), pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / +limit) } };
  }

  async findOne(id: string): Promise<ApiResult> {
    const a = await this.model.findById(id).lean();
    if (!a) throw new NotFoundException(`Announcement ${id} not found`);
    return { success: true, data: this.transformDocument(a) };
  }

  async create(dto: any, userId: string): Promise<ApiResult> {
    const a = await this.model.create({ ...dto, createdById: userId });
    return { success: true, data: this.transformDocument(a.toObject()) };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    const a = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!a) throw new NotFoundException(`Announcement ${id} not found`);
    return { success: true, data: this.transformDocument(a) };
  }

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResult> {
    const updateData: Record<string, any> = { isPublished };
    if (isPublished) updateData['publishedAt'] = new Date();
    return this.update(id, updateData);
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.model.findByIdAndDelete(id))) throw new NotFoundException(`Announcement ${id} not found`);
    return { success: true, message: 'Announcement deleted' };
  }
}
