// enroll-course.dto.ts

import { IsMongoId } from 'class-validator';

export class EnrollCourseDto {
  @IsMongoId()
  studentId: string;
}