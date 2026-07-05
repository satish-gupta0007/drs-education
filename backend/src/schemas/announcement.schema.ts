import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ['GENERAL', 'EXAM', 'HOLIDAY', 'EVENT', 'URGENT'], default: 'GENERAL' })
  type: string;

  @Prop({ enum: ['ALL', 'STUDENTS', 'TEACHERS', 'CLASS'], default: 'ALL' })
  audience: string;

  @Prop({ type: [Types.ObjectId], ref: 'ClassEntity', default: [] })
  targetClassIds: Types.ObjectId[];

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
AnnouncementSchema.index({ isPublished: 1, isPinned: -1, createdAt: -1 });
