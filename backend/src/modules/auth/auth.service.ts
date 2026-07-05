import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { RefreshToken, RefreshTokenDocument } from '../../schemas/refresh-token.schema';
import { Student, StudentDocument } from '../../schemas/student.schema';
import { ClassEntity, ClassDocument } from '../../schemas/class.schema';
import { LoginDto } from './dto/login.dto';

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token:        string;
    refreshToken: string;
    user:         Record<string, any>;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)         private userModel:  Model<UserDocument>,
    @InjectModel(RefreshToken.name) private tokenModel: Model<RefreshTokenDocument>,
    @InjectModel(Student.name)      private studentModel: Model<StudentDocument>,
    @InjectModel(ClassEntity.name)  private classModel: Model<ClassDocument>,
    private jwt:    JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .lean<Record<string, any>>();

    if (!user || !user['isActive']) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user['passwordHash'] as string);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    await this.userModel.findByIdAndUpdate(user['_id'], { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(
      String(user['_id']),
      user['email'] as string,
      user['role'] as string,
      user['name'] as string,
    );

    const { passwordHash, ...safeUser } = user as any;

    // Add student profile details for students
    if (user['role'] === 'STUDENT') {
      const student = await this.studentModel.findOne({ userId: user['_id'] }).populate('classId', 'name').lean();
      if (student) {
        safeUser.studentId = student._id?.toString();
        safeUser.classId = (student.classId as any)?._id?.toString() || '';
        safeUser.className = (student.classId as any)?.name || '';
        safeUser.rollNumber = student.rollNumber;
      }
    }

    return {
      success: true,
      data: {
        token:        tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user:         safeUser,
      },
    };
  }

  async refreshToken(token: string): Promise<Record<string, any>> {
    let payload: any;
    try {
      payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const dbToken = await this.tokenModel.findOne({ token });
    if (!dbToken || new Date() > dbToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired or not found');
    }

    const tokens = await this.generateTokens(
      payload.sub,
      payload.email,
      payload.role,
      payload.name,
    );

    return { success: true, data: tokens };
  }

  async logout(userId: string, token: string): Promise<Record<string, any>> {
    await this.tokenModel.deleteOne({ userId, token }).catch(() => {});
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<Record<string, any>> {
    console.log('userId::',userId);
    
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash')
      .lean<Record<string, any>>();

    if (!user) throw new UnauthorizedException('User not found');

    // Add student profile details for students
    if (user['role'] === 'STUDENT') {
      const student = await this.studentModel.findOne({ userId: user['_id'] }).populate('classId', 'name').lean();
      if (student) {
        user.studentId = student._id?.toString();
        user.classId = (student.classId as any)?._id?.toString() || '';
        user.className = (student.classId as any)?.name || '';
        user.rollNumber = student.rollNumber;
      }
    }

    return { success: true, data: user };
  }

  private async generateTokens(
    userId: string,
    email:  string,
    role:   string,
    name:   string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email, role, name };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret:    this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret:    this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    await this.tokenModel.create({
      token:     refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }
}
