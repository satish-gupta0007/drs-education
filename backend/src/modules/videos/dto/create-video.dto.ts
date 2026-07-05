import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() subjectId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() teacherId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chapter?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() topic?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
}
