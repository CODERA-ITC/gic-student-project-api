import { Exclude } from 'class-transformer'

import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
} from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  phone: number

  @Exclude()
  @Column()
  password: string

  @Column()
  department: string

  @Column()
  year: number

  @Column('simple-array', { nullable: true })
  skill: string[]

  @Column({ nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true })
  hashedRefreshToken: string | null

  @ManyToMany(() => Project, project => project.members)
  memberProjects: Project[]

  @OneToMany(() => Project, project => project.author)
  authoredProjects: Project[]
}
