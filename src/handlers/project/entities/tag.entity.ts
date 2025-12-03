import { Exclude } from 'class-transformer'
import { BaseEntity } from 'src/database/base.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @ManyToMany(() => Project, project => project.tags)
  projects: Project[]

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date

  // nestjs built-in soft delete
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date
}
