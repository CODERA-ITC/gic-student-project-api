import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm'
import { Project } from './project.entity'

@Entity()
@Unique(['project', 'userId']) // prevent duplicates
@Index(['project', 'userId']) // fast lookup
export class ProjectMember extends BaseEntity {
  @ManyToOne(() => Project, project => project.members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  project: Project

  @Column({ type: 'uuid' })
  userId: string

  // author, member
  @Column({ default: 'member' })
  role: string
}
