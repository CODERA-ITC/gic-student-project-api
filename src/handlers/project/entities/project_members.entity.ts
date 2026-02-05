import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Project } from './project.entity'

@Entity()
export class ProjectMember extends BaseEntity {
  @ManyToOne(() => Project, project => project.members, {
    onDelete: 'CASCADE',
  })
  project: Project

  @Column()
  userId: string

  // author, member
  @Column({ default: 'member' })
  role: string
}
