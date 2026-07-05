import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClassesService, ApiResult } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly svc: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'List all classes with student & subject counts' })
  @ApiQuery({ name: 'page',     required: false })
  @ApiQuery({ name: 'limit',    required: false })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async findAll(@Query() q: any): Promise<ApiResult> {
    return this.svc.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID with subjects and student count' })
  async findOne(@Param('id') id: string): Promise<ApiResult> {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new class' })
  async create(@Body() dto: CreateClassDto): Promise<ApiResult> {
    return this.svc.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update class' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateClassDto>,
  ): Promise<ApiResult> {
    return this.svc.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle class active/inactive status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<ApiResult> {
    return this.svc.toggleStatus(id, isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete class' })
  async remove(@Param('id') id: string): Promise<ApiResult> {
    return this.svc.remove(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get all students in a class' })
  async getStudents(@Param('id') id: string): Promise<ApiResult> {
    return this.svc.getStudents(id);
  }
}
