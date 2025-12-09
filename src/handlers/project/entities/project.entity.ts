import { BaseEntity } from 'src/database/base.entity'
import { Department } from 'src/handlers/department/entitites/department.entity'
import { User } from 'src/handlers/user/entities/user.entity'

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Category } from './category.entity'
import { Feature } from './feature.entity'
import { Image } from './image.entity'
import { ProjectMember } from './project_members.entity'
import { Tag } from './tag.entity'

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  thumbnailUrl: string

  // draft, reviewing, rejected, accepted
  @Column({ default: 'draft' })
  visiblity: string

  // pending, ongoing, done (for tracking project progression)
  @Column({ default: 'pending' })
  status: string

  // handle notification
  @Column({ nullable: true })
  notificationId: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @OneToMany(() => Feature, feature => feature.project)
  features: Feature[]

  @OneToMany(() => Image, image => image.project, {
    cascade: true,
    eager: true, // auto-load when fetching project
  })
  images: Image[]

  @ManyToOne(() => Category, category => category.projects)
  category: Category

  @ManyToMany(() => Tag, tag => tag.projects)
  @JoinTable()
  tags: Tag[]

  @ManyToMany(() => Department, department => department.projects)
  @JoinTable()
  department: Department

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date

  @OneToMany(() => ProjectMember, pm => pm.project)
  members: ProjectMember[]
}
