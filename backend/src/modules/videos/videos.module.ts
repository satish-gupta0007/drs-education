import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { R2Service } from '../../common/r2.service';
import { Video, VideoSchema } from '../../schemas/video.schema';
import { VideoWatch, VideoWatchSchema } from '../../schemas/video-watch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name,      schema: VideoSchema },
      { name: VideoWatch.name, schema: VideoWatchSchema },
    ]),
    MulterModule.register({
      dest: 'uploads/videos',
    }),
  ],
  controllers: [VideosController],
  providers:   [VideosService, R2Service],
  exports:     [VideosService],
})
export class VideosModule {}
