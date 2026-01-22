import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity()
export class Course extends BaseEntity {
  @Column()
  name: string

  @Column()
  description: string

  @OneToMany(() => Project, project => project.course)
  projects: Project[]
}
