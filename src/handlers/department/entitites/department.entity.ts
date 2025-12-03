import { Exclude } from 'class-transformer'
import { BaseEntity } from 'src/database/base.entity'
import { Project } from 'src/handlers/project/entities/project.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  description: string

  @OneToMany(() => User, user => user.department)
  users: User[]

  @ManyToMany(() => Project, project => project.department)
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
