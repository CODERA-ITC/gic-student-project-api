import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, ManyToMany } from 'typeorm'
import { Project } from './project.entity'

@Entity('tags')
export class Tag extends BaseEntity {
  @Column()
  name: string

  @ManyToMany(() => Project, project => project.tags)
  projects: Project[]
}
