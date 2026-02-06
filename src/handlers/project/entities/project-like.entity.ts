import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm'
import { Project } from './project.entity'

@Entity()
@Unique(['project', 'userId']) // prevent duplicates
@Index(['project', 'userId']) // fast lookup
export class ProjectLike extends BaseEntity {
  @Column()
  userId: string

  @ManyToOne(() => Project, project => project.likes, { onDelete: 'CASCADE' })
  project: Project
}
