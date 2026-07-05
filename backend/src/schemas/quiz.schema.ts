import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

// Embedded sub-document for questions
@Schema({ _id: true })
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ enum: ['mcq', 'true_false'], default: 'mcq' })
  type: string;

  @Prop([String])
  options: string[];

  @Prop({ required: true })
  correctAnswer: number;

  @Prop()
  explanation: string;

  @Prop({ default: 1 })
  marks: number;

  @Prop({ enum: ['easy', 'medium', 'hard'], default: 'medium' })
  difficulty: string;

  @Prop({ default: 0 })
  order: number;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ timestamps: true, collection: 'quizzes' })
export class Quiz {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  totalMarks: number;

  @Prop({ required: true })
  passingMarks: number;

  @Prop({ required: true })
  duration: number;       // minutes

  @Prop({ enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  status: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questions: QuizQuestion[];

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
QuizSchema.index({ subjectId: 1, status: 1 });
