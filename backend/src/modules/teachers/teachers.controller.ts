import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResult } from '../classes/classes.service';

@ApiTags('Teachers') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('teachers')
export class TeachersController {
  constructor(private readonly svc: TeachersService) {}
  @Get()    async findAll(@Query() q: any): Promise<ApiResult>                            { return this.svc.findAll(q); }
  @Get(':id') async findOne(@Param('id') id: string): Promise<ApiResult>                 { return this.svc.findOne(id); }
  @Post()   async create(@Body() dto: any): Promise<ApiResult>                           { return this.svc.create(dto); }
  @Put(':id') async update(@Param('id') id: string, @Body() dto: any): Promise<ApiResult>{ return this.svc.update(id,dto); }
  @Delete(':id') @HttpCode(HttpStatus.OK) async remove(@Param('id') id: string): Promise<ApiResult> { return this.svc.remove(id); }
}
