import { Exclude } from 'class-transformer'

import { BaseEntity } from 'src/database/base.entity'
import { Notification } from 'src/handlers/notification/entities/notification.entity'
import { ProjectLike } from 'src/handlers/project/entities/project-like.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  @Column({ nullable: true })
  generation: number

  @Column('simple-array', { nullable: true })
  skill: string[]

  @Column({ nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null

  @Column({ nullable: true })
  studentId: string

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: SocialLink[]

  @ManyToMany(() => Notification, notification => notification.users)
  @JoinTable()
  notifications: Notification[]
}

export class SocialLink {
  name: string
  url: string
}
