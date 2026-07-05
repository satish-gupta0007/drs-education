import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = ClassEntity & Document;

@Schema({ timestamps: true, collection: 'classes' })
export class ClassEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  section: string;

  @Prop({ required: true })
  academicYear: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(ClassEntity);
ClassSchema.index({ name: 1, academicYear: 1 });
