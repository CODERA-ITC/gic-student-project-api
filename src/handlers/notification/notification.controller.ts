import { Body, Controller, Get, Param, Patch, Post, Req, Sse } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { finalize, map, Observable } from "rxjs";
import { CreateNotificationDto } from "./dto/create-notification.dto";

interface MessageEvent {
    data: string | object;
    id?: string;
    type?: string;
    retry?: number;
}

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Sse('stream/teacher')
    teacherNotificationStream(): Observable<MessageEvent> {
        return this.notificationService.getTeacherStream().pipe(
            map(notification => ({
                data: notification,
                type: 'notification'
            })),
            finalize(() => this.notificationService.removeTeacherConnection())
        )
    }

    @Sse('stream/student/:id')
    studentNotificationStream(@Param('id') studentId: string): Observable<MessageEvent> {
        return this.notificationService.getStudentStream(studentId).pipe(
            map(notification => ({
                data: notification,
                type: 'notification'
            })),
            finalize(() => this.notificationService.removeStudentConnection(studentId))
        )
    }

    @Get('me')
    async getNotification(@Req() req: any) {
        const userId = req.user.id
        const notification = await this.notificationService.getUserNotification(userId)
        return notification;
    }

    @Get('me/unread')
    async getMyUnreadNotification(@Req() req: any) {
        const userId = req.user.id;
        const notification = await this.notificationService.getUnreadNotification(userId);
        return notification;
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.notificationService.markAsRead(id);
        return {
            message: 'All notification marked as read'
        }
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: 'accepted' | 'rejected'
    ){
        await this.notificationService.updateStatus(id, status);
        return{
            message: `Notification status updated to ${status}`
        }
    }
}