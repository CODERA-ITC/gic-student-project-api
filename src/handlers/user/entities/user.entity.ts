import { Exclude } from 'class-transformer'

import { BaseEntity } from 'src/database/base.entity'
import { Course } from 'src/handlers/course/entities/course.entity'
import { Department } from 'src/handlers/department/entitites/department.entity'
import { Notification } from 'src/handlers/notification/entities/notification.entity'
import { ProjectLike } from 'src/handlers/project/entities/project-like.entity'
import { ProjectMember } from 'src/handlers/project/entities/project_members.entity'
import { Role } from 'src/handlers/role/entities/role.entity'
import { SecurityQuestion } from 'src/handlers/security_questions/entities/security_question.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstName: string

  @Column({ nullable: true })
  lastName: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  phone: string

  @Exclude()
  @Column({ select: false })
  password: string

  @ManyToOne(() => Department, dept => dept.users)
  department: Department

  @OneToMany(
    () => ProjectLike,
    like => like.user,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  projectLikes: ProjectLike[]

  @Column({ nullable: true })
  year: number

  @Column('simple-array', { nullable: true })
  skill: string[]

  @Column({ nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null

  @ManyToOne(() => Role, role => role.users)
  role: Role

  @OneToMany(
    () => ProjectMember,
    pm => pm.member,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  projects: ProjectMember[]

  @ManyToMany(() => Notification, notification => notification.users)
  @JoinTable()
  notifications: Notification[]

  @OneToMany(
    () => SecurityQuestion,
    secureQuestion => secureQuestion.user,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  secureQuestions: SecurityQuestion[]

  @ManyToMany(() => Course, course => course.users)
  @JoinTable()
  courses: Course[]
}
