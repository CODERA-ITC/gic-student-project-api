import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Project } from './project.entity'

@Entity('project_has_members')
export class ProjectMember extends BaseEntity {
  @ManyToOne(() => Project, project => project.members)
  project: Project

  @ManyToOne(() => User, user => user.projects)
  member: User

  // author, member
  @Column({ default: 'member' })
  role: string
}
