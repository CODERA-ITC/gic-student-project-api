import { BaseEntity } from 'src/database/base.entity'
import { Course } from 'src/handlers/course/entities/course.entity'
import { Department } from 'src/handlers/department/entitites/department.entity'
import { Image } from 'src/handlers/image/entities/image.entity'
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
import { ProjectLike } from './project-like.entity'
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
  visibility: string

  // pending, ongoing, done (for tracking project progression)
  @Column({ default: 'pending' })
  status: string

  // handle notification
  @Column({ nullable: true })
  notificationId: string

  @Column({ nullable: true })
  reviewedBy: string

  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  likeCount: number

  @OneToMany(
    () => Feature,
    feature => feature.project,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  features: Feature[]

  @ManyToOne(() => Category, category => category.projects)
  category: Category

  @ManyToMany(() => Tag, tag => tag.projects)
  @JoinTable()
  tags: Tag[]

  @ManyToOne(() => Department, department => department.projects)
  department: Department

  @OneToMany(() => Image, image => image.project, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  images: Image[]

  @OneToMany(
    () => ProjectLike,
    like => like.project,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  likes: ProjectLike[]

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date

  @OneToMany(() => ProjectMember, pm => pm.project, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  members: ProjectMember[]

  @Column({ nullable: true })
  academicYear: string

  @Column({ type: 'simple-array', default: [] })
  technologies: string[]

  @Column({ default: false })
  isFeatured: boolean

  @Column({ nullable: true })
  repoUrl: string

  @Column({ nullable: true })
  demoUrl: string

  @ManyToOne(
    () => Course,
    course => course.projects,
    { onDelete: 'SET NULL' },
  )
  course: Course
}
