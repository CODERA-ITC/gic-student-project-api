import { Exclude } from 'class-transformer'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'
import { BaseEntity } from 'src/database/base.entity'

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true })
  name: string

  @OneToMany(() => Project, project => project.category)
  projects: Project[]
}
