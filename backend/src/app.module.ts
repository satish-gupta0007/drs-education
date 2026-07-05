import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseConfigModule } from './config/mongoose.module';
import { AuthModule }          from './modules/auth/auth.module';
import { ClassesModule }       from './modules/classes/classes.module';
import { SubjectsModule }      from './modules/subjects/subjects.module';
import { VideosModule }        from './modules/videos/videos.module';
import { PdfsModule }          from './modules/pdfs/pdfs.module';
import { StudentsModule }      from './modules/students/students.module';
import { TeachersModule }      from './modules/teachers/teachers.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { QuizzesModule }       from './modules/quizzes/quizzes.module';
import { ReportsModule }       from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseConfigModule,
    AuthModule,
    ClassesModule,
    SubjectsModule,
    VideosModule,
    PdfsModule,
    StudentsModule,
    TeachersModule,
    AnnouncementsModule,
    QuizzesModule,
    ReportsModule,
  ],
})
export class AppModule {}
