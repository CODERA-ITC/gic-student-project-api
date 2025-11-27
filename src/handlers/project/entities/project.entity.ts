import { BaseEntity } from 'src/database/base.entity'
import { Department } from 'src/handlers/department/entitites/department.entity'

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Category } from './category.entity'
import { Tag } from './tag.entity'

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  ownerId: string

  @ManyToOne(() => Category, category => category.projects)
  category: Category

  @ManyToMany(() => Tag, tag => tag.projects)
  @JoinTable()
  tags: Tag[]

  @ManyToMany(() => Department, department => department.projects)
  @JoinTable()
  department: Department
}
