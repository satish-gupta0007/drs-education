import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoWatchDocument = VideoWatch & Document;

@Schema({ timestamps: true, collection: 'video_watches' })
export class VideoWatch {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;

  @Prop({ default: 0 })
  watchedDuration: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: 0 })
  lastPosition: number;
}

export const VideoWatchSchema = SchemaFactory.createForClass(VideoWatch);
VideoWatchSchema.index({ studentId: 1, videoId: 1 }, { unique: true });
