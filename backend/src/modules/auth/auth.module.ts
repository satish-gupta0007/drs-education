import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from '../../schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from '../../schemas/refresh-token.schema';
import { Student, StudentSchema } from '../../schemas/student.schema';
import { ClassEntity, ClassSchema } from '../../schemas/class.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name,         schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Student.name,      schema: StudentSchema },
      { name: ClassEntity.name,  schema: ClassSchema },
    ]),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [AuthService],
})
export class AuthModule {}
