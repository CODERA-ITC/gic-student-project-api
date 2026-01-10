import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  description: string

  @OneToMany(() => User, user => user.department)
  users: User[]

  @ManyToMany(() => Project, project => project.departments)
  projects: Project[]
}
