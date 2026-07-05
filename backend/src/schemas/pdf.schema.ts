import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PdfDocument = Pdf & Document;

@Schema({ timestamps: true, collection: 'pdfs' })
export class Pdf {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ default: 0 })
  fileSize: number;

  @Prop({ default: 0 })
  pageCount: number;

  @Prop({ enum: ['NOTES', 'ASSIGNMENT', 'QUESTION_PAPER', 'SOLUTION', 'REFERENCE'], default: 'NOTES' })
  type: string;

  @Prop()
  chapter: string;

  @Prop([String])
  tags: string[];

  @Prop({ enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  status: string;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher' })
  teacherId: Types.ObjectId;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);
PdfSchema.index({ subjectId: 1, type: 1 });
PdfSchema.index({ title: 'text' });
