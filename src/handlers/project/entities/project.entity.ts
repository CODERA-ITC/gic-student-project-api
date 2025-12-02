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
import { Feature } from './feature.entity'
import { Image } from './image.entity'
import { Tag } from './tag.entity'

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  ownerId: string

  @Column()
  thumbnailUrl: string

  // draft, published, rejected, accepted
  @Column({ default: 'draft' })
  visiblity: string

  // pending, ongoing, done
  @Column({ default: 'pending' })
  status: string

  @OneToMany(() => Feature, feature => feature.project)
  features: Feature[]

  @OneToMany(() => Image, image => image.project, {
    cascade: true,
    eager: true, // auto-load when fetching project
  })
  images: Image[]

  @ManyToOne(() => Category, category => category.projects)
  category: Category

  @ManyToMany(() => Tag, tag => tag.projects)
  @JoinTable()
  tags: Tag[]

  @ManyToMany(() => Department, department => department.projects)
  @JoinTable()
  department: Department

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date
}
