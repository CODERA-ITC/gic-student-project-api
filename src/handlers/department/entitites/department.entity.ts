import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  description: string

  @ManyToMany(() => Project, project => project.department)
  projects: Project[]
}
