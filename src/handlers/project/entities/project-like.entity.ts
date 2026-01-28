import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Entity, ManyToOne } from 'typeorm'
import { Project } from './project.entity'

@Entity()
export class ProjectLike extends BaseEntity {
  @ManyToOne(() => User, user => user.projectLikes, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Project, project => project.likes, { onDelete: 'CASCADE' })
  project: Project
}
