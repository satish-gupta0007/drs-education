import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { StudentsService } from "./students.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ApiResult } from "../classes/classes.service";

@ApiTags("Students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly svc: StudentsService) {}

  @Get()
  async findAll(@Query() q: any): Promise<ApiResult> {
    return this.svc.findAll(q);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.findOne(id);
  }

  @Get(":id/progress")
  async getProgress(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.getProgress(id);
  }

  @Post()
  async create(@Body() dto: any): Promise<ApiResult> {
    return this.svc.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any): Promise<ApiResult> {
    return this.svc.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.remove(id);
  }

  @Post(":id/enroll/:subjectId")
  async enrollSubject(
    @Param("id") studentId: string,
    @Param("subjectId") subjectId: string,
  ): Promise<ApiResult> {
    console.log('id::',studentId);
    console.log('subjectId::',subjectId);

    
    return this.svc.enrollSubject(studentId, subjectId);
  }

  @Post(":id/unenroll/:subjectId")
  async unenrollSubject(
    @Param("id") studentId: string,
    @Param("subjectId") subjectId: string,
  ): Promise<ApiResult> {
    return this.svc.unenrollSubject(studentId, subjectId);
  }

  @Get(":id/enrolled-subjects")
  async getEnrolledSubjects(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.getEnrolledSubjects(id);
  }
}
