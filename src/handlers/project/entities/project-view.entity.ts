import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm'
import { Project } from './project.entity'

@Entity('project_views')
export class ProjectView extends BaseEntity {
  @Column()
  userId: string

  @Column()
  projectId: string

  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => Project)
  project: Project
}
