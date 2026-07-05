import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pdf, PdfDocument } from '../../schemas/pdf.schema';
import { R2Service } from '../../common/r2.service';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class PdfsService {
  constructor(
    @InjectModel(Pdf.name) private model: Model<PdfDocument>,
    private r2Service: R2Service,
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
    const { page = 1, limit = 20, search, subjectId, type, status } = query;
    const filter: Record<string, any> = {};
    if (search)    filter['$text']      = { $search: search };
    if (subjectId) filter['subjectId']  = subjectId;
    if (type)      filter['type']       = type.toUpperCase();
    if (status)    filter['status']     = status.toUpperCase();
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.model.find(filter).populate('subjectId', 'name color').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean(),
      this.model.countDocuments(filter),
    ]);
    return { success: true, data: this.transformDocument(data), pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / +limit) } };
  }

  async findOne(id: string): Promise<ApiResult> {
    const pdf = await this.model.findById(id).populate('subjectId').lean();
    if (!pdf) throw new NotFoundException(`PDF ${id} not found`);
    return { success: true, data: this.transformDocument(pdf) };
  }

  async create(dto: any): Promise<ApiResult> { const pdf = await this.model.create(dto); return { success: true, data: this.transformDocument(pdf.toObject()) }; }

  async update(id: string, dto: any): Promise<ApiResult> {
    const pdf = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!pdf) throw new NotFoundException(`PDF ${id} not found`);
    return { success: true, data: this.transformDocument(pdf) };
  }

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResult> {
    return this.update(id, { status: isPublished ? 'PUBLISHED' : 'DRAFT' });
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.model.findByIdAndDelete(id))) throw new NotFoundException(`PDF ${id} not found`);
    return { success: true, message: 'PDF deleted' };
  }

  async uploadPdf(file: Express.Multer.File, dto: any): Promise<ApiResult> {
    const key = `pdfs/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const fileUrl = await this.r2Service.uploadFile(file, key);
console.log('fileUrl::',fileUrl);

    const pdf = await this.model.create({
      ...dto,
      fileUrl,
      fileSize: file.size,
      status: 'PUBLISHED', // Auto publish after upload
    });

    return { success: true, data: this.transformDocument(pdf) };
  }
}
