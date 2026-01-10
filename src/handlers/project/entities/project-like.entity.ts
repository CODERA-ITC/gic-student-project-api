import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Entity, ManyToOne, Unique } from 'typeorm'
import { Project } from './project.entity'

@Entity('Project_likes')
@Unique(['user', 'project'])
export class ProjectLike extends BaseEntity {
  @ManyToOne(() => User, user => user.projectLikes, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Project, project => project.likes, { onDelete: 'CASCADE' })
  project: Project
}
