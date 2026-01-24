import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

@Entity()
export class Course extends BaseEntity {
  @Column()
  name: string

  @Column({ default: '' })
  description: string

  @Column({ unique: true })
  code: string

  @OneToMany(() => Project, project => project.course)
  projects: Project[]

  @ManyToMany(() => User, user => user.courses)
  users: User[]
}
