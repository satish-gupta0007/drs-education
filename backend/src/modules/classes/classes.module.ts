import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassEntity, ClassSchema } from '../../schemas/class.schema';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { Subject, SubjectSchema } from '../../schemas/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassEntity.name, schema: ClassSchema },
      { name: Student.name,     schema: StudentSchema },
      { name: Subject.name,     schema: SubjectSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers:   [ClassesService],
  exports:     [ClassesService],
})
export class ClassesModule {}
