import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResult } from '../classes/classes.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly svc: QuizzesService) { }

  @Get()
  async findAll(@Query() q: any): Promise<ApiResult> {
    return this.svc.findAll(q);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResult> {
    return this.svc.findOne(id);
  }

  @Post()
  async create(@Body() dto: any): Promise<ApiResult> {
    console.log('dto::',dto);
    
    return this.svc.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any): Promise<ApiResult> {
    return this.svc.update(id, dto);
  }

  @Patch(':id/publish')
  async togglePublish(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
  ): Promise<ApiResult> {
    return this.svc.togglePublish(id, isPublished);
  }

  @Post(':id/attempt')
  async submitAttempt(@Param('id') id: string, @Body() dto: any): Promise<ApiResult> {
    return this.svc.submitAttempt(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResult> {
    return this.svc.remove(id);
  }
  @Post(':id/start')
  async startQuiz(
    @Param('id') id: string,
    @Body('studentId') studentId: string,
  ): Promise<ApiResult> {
    return this.svc.startQuiz(id, studentId);
  }
  @Post(':id/answer')
  async saveAnswer(
    @Param('id') quizId: string,
    @Body() dto: { studentId: string; questionId: string; selectedAnswer: number },
  ): Promise<ApiResult> {
    return this.svc.saveAnswer(quizId, dto);
  }
  @Post(':id/progress')
async saveProgress(
  @Param('id') quizId: string,
  @Body() dto: {
    studentId: string;
    currentIndex: number;
    timeLeft: number;
  },
): Promise<ApiResult> {
  return this.svc.saveProgress(quizId, dto);
}
@Post(':id/retake')
async retakeQuiz(
  @Param('id') quizId: string,
  @Body('studentId') studentId: string,
): Promise<ApiResult> {
  return this.svc.retakeQuiz(quizId, studentId);
}
}
