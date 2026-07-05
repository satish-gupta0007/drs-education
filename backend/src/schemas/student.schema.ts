import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type StudentDocument = Student & Document;

@Schema({ timestamps: true, collection: "students" })
export class Student {
  @Prop({ required: true, unique: true })
  rollNumber: string;

  @Prop()
  parentName: string;

  @Prop()
  parentPhone: string;

  @Prop({ default: Date.now })
  enrollmentDate: Date;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ClassEntity", required: true })
  classId: Types.ObjectId;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ classId: 1 });
