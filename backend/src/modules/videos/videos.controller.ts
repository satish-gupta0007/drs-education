import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResult } from '../classes/classes.service';

// Multer options for video upload
const videoUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type. Only video files are allowed.'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
};

@ApiTags('Videos') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('videos')
export class VideosController {
  constructor(private readonly svc: VideosService) {}
  @Get()           async findAll(@Query() q: any): Promise<ApiResult>                     { return this.svc.findAll(q); }
  @Get('featured') async getFeatured(): Promise<ApiResult>                                { return this.svc.getFeatured(); }
  @Get(':id')      async findOne(@Param('id') id: string): Promise<ApiResult>             { return this.svc.findOne(id); }
  @Post()          async create(@Body() dto: any): Promise<ApiResult>                     { return this.svc.create(dto); }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: any): Promise<ApiResult> {
    return this.svc.uploadVideo(file, dto);
  }
  @Put(':id')      async update(@Param('id') id: string, @Body() dto: any): Promise<ApiResult> { return this.svc.update(id,dto); }
  @Patch(':id/publish')  async togglePublish(@Param('id') id: string, @Body('isPublished') v: boolean): Promise<ApiResult>  { return this.svc.togglePublish(id,v); }
  @Patch(':id/featured') async toggleFeatured(@Param('id') id: string, @Body('isFeatured') v: boolean): Promise<ApiResult>  { return this.svc.toggleFeatured(id,v); }
  @Post(':id/watch')     async recordWatch(@Param('id') id: string, @Body() body: any): Promise<ApiResult>                  { return this.svc.recordWatch(id,body); }
  @Get(':id/watch')      async getWatchProgress(@Param('id') id: string, @Query('studentId') s: string): Promise<ApiResult> { return this.svc.getWatchProgress(id,s); }
  @Delete(':id')  @HttpCode(HttpStatus.OK) async remove(@Param('id') id: string): Promise<ApiResult> { return this.svc.remove(id); }
}
