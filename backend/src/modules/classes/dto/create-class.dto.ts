import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'Class 10' }) @IsString() name: string;
  @ApiPropertyOptional({ example: 'A' }) @IsOptional() @IsString() section?: string;
  @ApiProperty({ example: '2024-25' }) @IsString() academicYear: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
