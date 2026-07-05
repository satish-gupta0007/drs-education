import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResult } from '../classes/classes.service';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform-wide KPI statistics' })
  async getDashboardStats(): Promise<ApiResult> {
    return this.svc.getDashboardStats();
  }

  @Get('top-videos')
  @ApiOperation({ summary: 'Top performing videos by view count' })
  async getTopVideos(@Query('limit') limit?: number): Promise<ApiResult> {
    return this.svc.getTopVideos(limit);
  }

  @Get('top-students')
  @ApiOperation({ summary: 'Top students leaderboard by quiz score' })
  async getTopStudents(@Query('limit') limit?: number): Promise<ApiResult> {
    return this.svc.getTopStudents(limit);
  }

  @Get('subject-engagement')
  @ApiOperation({ summary: 'Engagement metrics per subject' })
  async getSubjectEngagement(): Promise<ApiResult> {
    return this.svc.getSubjectEngagement();
  }

  @Get('enrollment-trend')
  @ApiOperation({ summary: 'Monthly student enrollment trend' })
  async getEnrollmentTrend(@Query('months') months?: number): Promise<ApiResult> {
    return this.svc.getEnrollmentTrend(months);
  }
}
