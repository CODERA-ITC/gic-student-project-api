import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm'
import { Project } from './project.entity'

@Entity('project_views')
@Unique(['userId', 'projectId'])
export class ProjectView extends BaseEntity {
  @Column()
  userId: string

  @Column()
  projectId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project
}
