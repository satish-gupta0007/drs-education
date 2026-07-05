import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Subject, SubjectSchema } from '../../schemas/subject.schema';
import { ClassEntity, ClassSchema } from '../../schemas/class.schema';
import { Video, VideoSchema } from '../../schemas/video.schema';
import { Quiz, QuizSchema } from '../../schemas/quiz.schema';
import { VideoWatch, VideoWatchSchema } from '../../schemas/video-watch.schema';
import { QuizAttempt, QuizAttemptSchema } from '../../schemas/quiz-attempt.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Subject.name, schema: SubjectSchema },
    { name: ClassEntity.name, schema: ClassSchema },
    { name: Video.name, schema: VideoSchema },
    { name: Quiz.name, schema: QuizSchema },
    { name: VideoWatch.name, schema: VideoWatchSchema },
    { name: QuizAttempt.name, schema: QuizAttemptSchema },
  ])],
  controllers: [SubjectsController], providers: [SubjectsService], exports: [SubjectsService],
})
export class SubjectsModule {}
