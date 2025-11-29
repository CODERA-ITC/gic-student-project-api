import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './config/database.config'
import { DepartmentModule } from './handlers/department/department.module'
import { ProjectModule } from './handlers/project/project.module'
import { RoleModule } from './handlers/role/role.module'
import { JwtStrategy } from './handlers/user/strategies/jwt.strategy'
import { UserModule } from './handlers/user/user.module'

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
    DatabaseModule,
    ProjectModule,
    UserModule,
    DepartmentModule,
    RoleModule,
  ],

  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
