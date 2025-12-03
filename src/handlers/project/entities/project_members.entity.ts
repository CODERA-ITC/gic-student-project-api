import { User } from 'src/handlers/user/entities/user.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'

@Entity('project_has_members')
export class ProjectMember {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Project, project => project.members)
    project: Project

    @ManyToOne(() => User, user => user.projects)
    member: User

    // author, member
    @Column({ default: 'member' })
    role: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
