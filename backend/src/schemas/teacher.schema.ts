import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true, collection: 'teachers' })
export class Teacher {
  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop({ required: true })
  qualification: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  joinDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
