import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PdfsService } from './pdfs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResult } from '../classes/classes.service';

// Multer options for PDF upload
const pdfUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type. Only PDF files are allowed.'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
};

@ApiTags('PDFs / Study Materials') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('pdfs')
export class PdfsController {
  constructor(private readonly svc: PdfsService) {}
  @Get()    async findAll(@Query() q: any): Promise<ApiResult>                            { return this.svc.findAll(q); }
  @Get(':id') async findOne(@Param('id') id: string): Promise<ApiResult>                 { return this.svc.findOne(id); }
  @Post()   async create(@Body() dto: any): Promise<ApiResult>                           { return this.svc.create(dto); }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: any): Promise<ApiResult> {
    return this.svc.uploadPdf(file, dto);
  }
  @Put(':id') async update(@Param('id') id: string, @Body() dto: any): Promise<ApiResult>{ return this.svc.update(id,dto); }
  @Patch(':id/publish') async togglePublish(@Param('id') id: string, @Body('isPublished') v: boolean): Promise<ApiResult> { return this.svc.togglePublish(id,v); }
  @Delete(':id') @HttpCode(HttpStatus.OK) async remove(@Param('id') id: string): Promise<ApiResult> { return this.svc.remove(id); }
}
