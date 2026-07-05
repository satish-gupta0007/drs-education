import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SubjectsService } from "./subjects.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ApiResult } from "../classes/classes.service";

@ApiTags("Subjects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("subjects")
export class SubjectsController {
  constructor(private readonly svc: SubjectsService) {}
  @Get() async findAll(@Query() q: any): Promise<ApiResult> {
    return this.svc.findAll(q);
  }
  @Get(":id") async findOne(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.findOne(id);
  }
  @Post() async create(@Body() dto: any): Promise<ApiResult> {
    return this.svc.create(dto);
  }
  @Put(":id") async update(
    @Param("id") id: string,
    @Body() dto: any,
  ): Promise<ApiResult> {
    return this.svc.update(id, dto);
  }
  @Patch(":id/status") async toggleStatus(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean,
  ): Promise<ApiResult> {
    return this.svc.toggleStatus(id, isActive);
  }
  //  @Patch(":id/enrolled") async enrolledCourses(
  //   @Param("id") id: string,
  //   @Body("enrolled") enrolled: boolean,
  //   @Body("studentId") studentId?: string,
  // ): Promise<ApiResult> {
  //   return this.svc.toggleEnrollment(id, studentId, enrolled);
  // }
//   @Post(':courseId/enroll')
// enrollCourse(
//   @Param('courseId') courseId: string,
//   @Body() dto: any,
// ) {
//   return this.svc.enrollCourse(courseId, dto);
// }

  @Delete(":id") @HttpCode(HttpStatus.OK) async remove(
    @Param("id") id: string,
  ): Promise<ApiResult> {
    return this.svc.remove(id);
  }
}
