import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ default: '#4e73df' })
  color: string;

  @Prop()
  thumbnail: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'ClassEntity', required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher' })
  teacherId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  enrolledStudents: Types.ObjectId[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ code: 1, classId: 1 }, { unique: true });
