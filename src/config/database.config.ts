import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        ssl:
          configService.get<boolean>('DATABASE_SSL')
            ? {
              rejectUnauthorized: false,
            }
            : false,
        entities: [`${__dirname}/../handlers/**/*.entity.{js,ts}`],
        migrations: [`${__dirname}/../migrations/*.{ts,js}`],
        migrationsRun: true,
        synchronize: true, // Disable synchronization to use migrations only
        dropSchema: true, // Drop and recreate schema for development
        autoLoadEntities: true,
        // Disable all logging to reduce console noise
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
