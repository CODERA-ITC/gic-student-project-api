import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './handlers/project/project.module';
import { UserModule } from './handlers/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './config/database.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './handlers/user/jwt/jwt.strategy';
import { DepartmentModule } from './handlers/department/department.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES') },
      }),
    }),
    ProjectModule,
    UserModule,
    DatabaseModule,
    DepartmentModule, 
  ],

  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
