import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { QuizAttempt, QuizAttemptSchema } from '../../schemas/quiz-attempt.schema';
import { VideoWatch, VideoWatchSchema } from '../../schemas/video-watch.schema';
import { Subject, SubjectSchema } from '../../schemas/subject.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Student.name,     schema: StudentSchema },
    { name: User.name,        schema: UserSchema },
    { name: QuizAttempt.name, schema: QuizAttemptSchema },
    { name: VideoWatch.name,  schema: VideoWatchSchema },
    { name: Subject.name,     schema: SubjectSchema },
  ])],
  controllers: [StudentsController], providers: [StudentsService], exports: [StudentsService],
})
export class StudentsModule {}
