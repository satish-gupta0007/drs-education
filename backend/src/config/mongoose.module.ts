import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('✅ MongoDB connected'));
          connection.on('error', (err) => console.error('❌ MongoDB error:', err));
          connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class MongooseConfigModule {}
