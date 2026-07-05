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
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AnnouncementsService } from "./announcements.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ApiResult } from "../classes/classes.service";

@ApiTags("Announcements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("announcements")
export class AnnouncementsController {
  constructor(private readonly svc: AnnouncementsService) {}
  @Get() async findAll(@Query() q: any): Promise<ApiResult> {
    return this.svc.findAll(q);
  }
  @Get(":id") async findOne(@Param("id") id: string): Promise<ApiResult> {
    return this.svc.findOne(id);
  }
  @Post() async create(
    @Body() dto: any,
    @Request() req: any,
  ): Promise<ApiResult> {
    return this.svc.create(dto, req.user.id);
  }
  @Put(":id") async update(
    @Param("id") id: string,
    @Body() dto: any,
  ): Promise<ApiResult> {
    return this.svc.update(id, dto);
  }
  @Patch(":id/publish") async togglePublish(
    @Param("id") id: string,
    @Body("isPublished") v: boolean,
  ): Promise<ApiResult> {
    return this.svc.togglePublish(id, v);
  }
  @Delete(":id") @HttpCode(HttpStatus.OK) async remove(
    @Param("id") id: string,
  ): Promise<ApiResult> {
    return this.svc.remove(id);
  }
}
