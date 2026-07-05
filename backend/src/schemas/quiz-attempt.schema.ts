import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ timestamps: true, collection: 'quiz_attempts' })
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ default: 0 })
  score: number;

  @Prop({ required: true })
  totalMarks: number;

  @Prop({ type: Map, of: Number, default: {} })
  answers: Map<string, number>;

  @Prop({ default: 0 })
  timeTaken: number;
  // seconds
  @Prop({ default: 0 })
  currentIndex: number;

  @Prop({ default: 0 })
  timeLeft: number;
  @Prop({ default: false })
  isPassed: boolean;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
QuizAttemptSchema.index({ studentId: 1, quizId: 1 });
