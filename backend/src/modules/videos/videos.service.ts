import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from '../../schemas/video.schema';
import { VideoWatch, VideoWatchDocument } from '../../schemas/video-watch.schema';
import { R2Service } from '../../common/r2.service';
import { ApiResult } from '../classes/classes.service';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name)      private videoModel: Model<VideoDocument>,
    @InjectModel(VideoWatch.name) private watchModel: Model<VideoWatchDocument>,
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
    const { page = 1, limit = 20, search, subjectId, status, featured } = query;
    const filter: Record<string, any> = {};

    if (search)              filter['$text']     = { $search: search };
    if (subjectId)           filter['subjectId'] = subjectId;
    if (status)              filter['status']    = status.toUpperCase();
    if (featured === 'true') filter['isFeatured']= true;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.videoModel
        .find(filter)
        .populate('subjectId', 'name color')
        .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name avatar' } })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      this.videoModel.countDocuments(filter),
    ]);

    let videos = this.transformDocument(data);

    // Add watch progress if studentId provided
    if (query.studentId) {
      const videoIds = videos.map((v: any) => v.id);
      const watches = await this.watchModel.find({ studentId: query.studentId, videoId: { $in: videoIds } }).lean();
      const watchMap = watches.reduce((acc, w) => {
        acc[w.videoId.toString()] = w;
        return acc;
      }, {} as Record<string, any>);

      videos = videos.map((v: any) => ({
        ...v,
        watchProgress: watchMap[v.id] || null,
      }));
    }

    return {
      success: true,
      data: videos,
      pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / +limit) },
    };
  }

  async getFeatured(): Promise<ApiResult> {
    const data = await this.videoModel
      .find({ isFeatured: true, status: 'PUBLISHED' })
      .populate('subjectId', 'name color')
      .sort({ viewCount: -1 })
      .limit(10)
      .lean();
    return { success: true, data: this.transformDocument(data) };
  }

  async findOne(id: string): Promise<ApiResult> {
    const video = await this.videoModel
      .findById(id)
      .populate('subjectId')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name avatar' } })
      .lean();
    if (!video) throw new NotFoundException(`Video ${id} not found`);
    await this.videoModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    return { success: true, data: this.transformDocument(video) };
  }

  async create(dto: any): Promise<ApiResult> {
    const video = await this.videoModel.create(dto);
    return { success: true, data: this.transformDocument(video.toObject()) };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    const video = await this.videoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!video) throw new NotFoundException(`Video ${id} not found`);
    return { success: true, data: this.transformDocument(video) };
  }

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResult> {
    const video = await this.videoModel
      .findByIdAndUpdate(id, { status: isPublished ? 'PUBLISHED' : 'DRAFT' }, { new: true })
      .lean();
    if (!video) throw new NotFoundException(`Video ${id} not found`);
    return { success: true, data: this.transformDocument(video) };
  }

  async toggleFeatured(id: string, isFeatured: boolean): Promise<ApiResult> {
    const video = await this.videoModel
      .findByIdAndUpdate(id, { isFeatured }, { new: true })
      .lean();
    if (!video) throw new NotFoundException(`Video ${id} not found`);
    return { success: true, data: this.transformDocument(video) };
  }

  async recordWatch(
    videoId: string,
    body: { studentId: string; watchedDuration: number; isCompleted: boolean; lastPosition: number },
  ): Promise<ApiResult> {
    const watch = await this.watchModel
      .findOneAndUpdate(
        { studentId: body.studentId, videoId },
        {
          $set: {
            watchedDuration: body.watchedDuration,
            isCompleted:     body.isCompleted,
            lastPosition:    body.lastPosition,
          },
        },
        { new: true, upsert: true },
      )
      .lean();
    return { success: true, data: this.transformDocument(watch) };
  }

  async uploadVideo(file: Express.Multer.File, dto: any): Promise<ApiResult> {
    const key = `videos/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const videoUrl = await this.r2Service.uploadFile(file, key);

    const video = await this.videoModel.create({
      ...dto,
      videoUrl,
      fileSize: file.size,
      status: 'PUBLISHED', // Auto publish after upload
    });

    return { success: true, data: this.transformDocument(video) };
  }

  async remove(id: string): Promise<ApiResult> {
    const video = await this.videoModel.findByIdAndDelete(id);
    if (!video) throw new NotFoundException(`Video ${id} not found`);
    return { success: true, message: 'Video deleted successfully' };
  }

  async getWatchProgress(videoId: string, studentId: string): Promise<ApiResult> {
    const watch = await this.watchModel.findOne({ videoId, studentId }).lean();
    return { success: true, data: this.transformDocument(watch) };
  }
}
