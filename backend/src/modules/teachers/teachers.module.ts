import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Teacher.name, schema: TeacherSchema },
    { name: User.name,    schema: UserSchema },
  ])],
  controllers: [TeachersController], providers: [TeachersService], exports: [TeachersService],
})
export class TeachersModule {}
