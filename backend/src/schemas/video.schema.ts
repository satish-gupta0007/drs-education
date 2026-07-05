import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true, collection: 'videos' })
export class Video {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  videoUrl: string;

  @Prop()
  thumbnailUrl: string;

  @Prop({ default: 0 })
  duration: number;          // seconds

  @Prop({ default: 0 })
  fileSize: number;          // bytes

  @Prop()
  chapter: string;

  @Prop()
  topic: string;

  @Prop([String])
  tags: string[];

  @Prop({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' })
  status: string;

  @Prop({ enum: ['UPLOADING', 'PROCESSING', 'READY', 'FAILED'], default: 'READY' })
  uploadStatus: string;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher' })
  teacherId: Types.ObjectId;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
VideoSchema.index({ subjectId: 1, status: 1 });
VideoSchema.index({ isFeatured: 1, status: 1 });
VideoSchema.index({ title: 'text', topic: 'text', tags: 'text' });
