import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { PdfsController } from './pdfs.controller';
import { PdfsService } from './pdfs.service';
import { R2Service } from '../../common/r2.service';
import { Pdf, PdfSchema } from '../../schemas/pdf.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pdf.name, schema: PdfSchema }]),
    MulterModule.register({
      dest: 'uploads/pdfs',
    }),
  ],
  controllers: [PdfsController],
  providers: [PdfsService, R2Service],
  exports: [PdfsService],
})
export class PdfsModule {}
