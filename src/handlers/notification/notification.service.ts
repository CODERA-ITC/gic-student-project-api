import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Observable, Subject } from 'rxjs'
import { Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { Notification } from './entities/notification.entity'

@Injectable()
export class NotificationService implements OnModuleDestroy {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Stream = where all of the notifications will get sent through
  private teacherStream = new Subject<CreateNotificationDto>()
  private studentStream = new Map<string, Subject<CreateNotificationDto>>()

  // Count the number of connections (user might open many tabs)
  private studentConnectionCount = new Map<string, number>()
  private teacherConnectionCount = 0

  // ========================== Handle Teacher Notification Stream ========================== //
  getTeacherStream(): Observable<CreateNotificationDto> {
    this.incrementTeacherConnection()
    return this.teacherStream.asObservable()
  }

  async notifyTeachers(event: CreateNotificationDto) {
    const teachers = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'Teacher' })
      .getMany()

    const notification = this.notificationRepo.create({
      ...event,
      users: teachers,
    })
    await this.notificationRepo.save(notification)
    this.teacherStream.next(event)

    console.log('NOTIFIED: ', notification)
    return notification
  }

  removeTeacherConnection() {
    this.teacherConnectionCount = Math.max(0, this.teacherConnectionCount - 1)
    if (this.teacherConnectionCount === 0) {
      this.teacherStream.complete()
      this.teacherStream = new Subject<CreateNotificationDto>()
    }
  }

  // ========================== Handle Student Notification Stream ========================== //
  getStudentStream(studentId: string): Observable<CreateNotificationDto> {
    this.incrementStudentConnection(studentId)
    return this.getOrCreateStudentSubject(studentId).asObservable()
  }

  async notifyStudent(studentId: string, event: CreateNotificationDto) {
    const student = await this.userRepo.findOne({ where: { id: studentId } })
    if (!student) {
      this.getOrCreateStudentSubject(studentId).next(event)
      throw new Error(`Student with id ${studentId} not found`)
    }

    const notification = this.notificationRepo.create({
      name: event.name,
      description: event.description,
      status: event.status,
      read: event.read ?? false,
    })

    // const savedNotification = await this.notificationRepo.save(notification);

    notification.users.push(student)
    await this.notificationRepo.save(notification)

    this.getOrCreateStudentSubject(studentId).next(event)
    return notification
  }

  removeStudentConnection(studentId: string) {
    const count = this.studentConnectionCount.get(studentId) || 0

    if (count <= 1) {
      const subject = this.studentStream.get(studentId)
      if (subject) {
        subject.complete()
        this.studentStream.delete(studentId)
      }
      this.studentConnectionCount.delete(studentId)
    }
    else {
      this.studentConnectionCount.set(studentId, count - 1)
    }
  }

  // ========================== Utitlity ========================== //
  async markAsRead(notificationId: string) {
    return this.notificationRepo.update(notificationId, { read: true })
  }

  // Will be mainly used by teacher or admin
  async notifyAllStudents(event: CreateNotificationDto) {
    const students = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'Student' })
      .getMany()

    if (students.length > 0) {
      const notification = this.notificationRepo.create({
        name: event.name,
        description: event.description,
        status: event.status,
        read: event.read ?? false,
      })

      const savedNotification = await this.notificationRepo.save(notification)
      await this.notificationRepo.save(savedNotification)
    }

    this.studentStream.forEach((subject) => {
      subject.next(event)
    })
  }

  async getUnreadNotification(userId: string) {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .innerJoin('notification.users', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('notification.read = :read', { read: false })
      .orderBy('notification.createdAt', 'DESC')
      .getMany()
  }

  async getUserNotification(userId: string, limit = 50) {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .innerJoin('notification.users', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .getMany()
  }

  async updateStatus(notificationId: string, status: 'rejected' | 'accepted') {
    return this.notificationRepo.update(notificationId, { status })
  }

  // ========================== Helper Functions ========================== //
  private incrementStudentConnection(studentId: string) {
    const count = this.studentConnectionCount.get(studentId) || 0
    this.studentConnectionCount.set(studentId, count + 1)
  }

  private getOrCreateStudentSubject(studentId: string): Subject<CreateNotificationDto> {
    if (!this.studentStream.has(studentId)) {
      this.studentStream.set(studentId, new Subject<CreateNotificationDto>())
    }
    return this.studentStream.get(studentId)!
  }

  private incrementTeacherConnection() {
    this.teacherConnectionCount++
  }

  onModuleDestroy() {
    this.teacherStream.complete()
    this.studentStream.forEach(subject => subject.complete())
    this.studentStream.clear()
    this.studentConnectionCount.clear()
  }
}
