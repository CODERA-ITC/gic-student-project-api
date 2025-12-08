import { Exclude } from 'class-transformer'

import { BaseEntity } from 'src/database/base.entity'
import { Department } from 'src/handlers/department/entitites/department.entity'
import { Notification } from 'src/handlers/notification/entities/notification.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { ProjectMember } from 'src/handlers/project/entities/project_members.entity'
import { Role } from 'src/handlers/role/entities/role.entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ nullable: true })
  avatar_url: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  phone: string

  @Exclude()
  @Column()
  password: string

  @ManyToOne(() => Department, dept => dept.users)
  department: Department

  @Column({ nullable: true })
  year: number

  @Column('simple-array', { nullable: true })
  skill: string[]

  @Column({ nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true })
  hashedRefreshToken: string | null

  @OneToOne(() => Role, role => role.user)
  @JoinColumn()
  role: Role

  @OneToMany(() => ProjectMember, pm => pm.member)
  projects: Project[]

  @ManyToMany(() => Notification, notification => notification.users)
  notifications: Notification[]
}
