import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'
import { Project } from './project.entity'
import { BaseEntity } from 'src/database/base.entity'

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string

  @OneToMany(() => Project, project => project.category)
  projects: Project[]
}
