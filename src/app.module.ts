import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import awsConfig from './config/aws.config'
import { DatabaseModule } from './config/database.config'
import { CourseModule } from './handlers/course/course.module'
import { DepartmentModule } from './handlers/department/department.module'
import { ImageModule } from './handlers/image/image.module'
import { NotificationModule } from './handlers/notification/notification.module'
import { CategoryController } from './handlers/project/category.controller'
import { ProjectModule } from './handlers/project/project.module'
import { SeederModule } from './handlers/seeder/seeder.module'
import { JwtStrategy } from './handlers/user/strategies/jwt.strategy'
import { UserModule } from './handlers/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig],
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
    DatabaseModule,
    ProjectModule,
    UserModule,
    DepartmentModule,
    SeederModule,
    NotificationModule,
    ImageModule,
  ],

  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
