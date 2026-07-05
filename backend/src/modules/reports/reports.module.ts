import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User, UserSchema }             from '../../schemas/user.schema';
import { Student, StudentSchema }       from '../../schemas/student.schema';
import { Teacher, TeacherSchema }       from '../../schemas/teacher.schema';
import { ClassEntity, ClassSchema }     from '../../schemas/class.schema';
import { Subject, SubjectSchema }       from '../../schemas/subject.schema';
import { Video, VideoSchema }           from '../../schemas/video.schema';
import { VideoWatch, VideoWatchSchema } from '../../schemas/video-watch.schema';
import { Pdf, PdfSchema }               from '../../schemas/pdf.schema';
import { Quiz, QuizSchema }             from '../../schemas/quiz.schema';
import { QuizAttempt, QuizAttemptSchema } from '../../schemas/quiz-attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name,        schema: UserSchema },
      { name: Student.name,     schema: StudentSchema },
      { name: Teacher.name,     schema: TeacherSchema },
      { name: ClassEntity.name, schema: ClassSchema },
      { name: Subject.name,     schema: SubjectSchema },
      { name: Video.name,       schema: VideoSchema },
      { name: VideoWatch.name,  schema: VideoWatchSchema },
      { name: Pdf.name,         schema: PdfSchema },
      { name: Quiz.name,        schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
