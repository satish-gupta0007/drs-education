// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { Document, Types } from "mongoose";

// export type StudentCourseEnrollmentDocument =
//   StudentCourseEnrollment & Document;

// @Schema({
//   timestamps: true,
//   collection: "student_course_enrollments",
// })
// export class StudentCourseEnrollment {

//   @Prop({
//     type: Types.ObjectId,
//     ref: "Student",
//     required: true,
//     index: true,
//   })
//   studentId: Types.ObjectId;

//   @Prop({
//     type: Types.ObjectId,
//     ref: "Course",
//     required: true,
//     index: true,
//   })
//   courseId: Types.ObjectId;

//   @Prop({
//     type: Types.ObjectId,
//     ref: "ClassEntity",
//     required: true,
//   })
//   classId: Types.ObjectId;

//   @Prop({
//     default: Date.now,
//   })
//   enrolledAt: Date;

//   @Prop({
//     default: 0,
//     min: 0,
//     max: 100,
//   })
//   progress: number;

//   @Prop({
//     default: false,
//   })
//   completed: boolean;

//   @Prop({
//     enum: ["ACTIVE", "COMPLETED", "DROPPED"],
//     default: "ACTIVE",
//   })
//   status: string;

//   @Prop()
//   completedAt?: Date;
// }

// export const StudentCourseEnrollmentSchema =
//   SchemaFactory.createForClass(StudentCourseEnrollment);

// // Prevent duplicate enrollment
// StudentCourseEnrollmentSchema.index(
//   { studentId: 1, courseId: 1 },
//   { unique: true }
// );

// // Faster lookups
// StudentCourseEnrollmentSchema.index({ studentId: 1 });
// StudentCourseEnrollmentSchema.index({ courseId: 1 });
// StudentCourseEnrollmentSchema.index({ classId: 1 });