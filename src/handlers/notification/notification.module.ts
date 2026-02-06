import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../user/user.module'
import { Notification } from './entities/notification.entity'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
