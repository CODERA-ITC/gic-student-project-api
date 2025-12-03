import { Exclude } from 'class-transformer'

import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { ProjectMember } from 'src/handlers/project/entities/project_members.entity'
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
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

  @OneToMany(() => ProjectMember, pm => pm.member)
  projects: Project[]
}
