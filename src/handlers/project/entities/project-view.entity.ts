import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    ManyToOne,
    JoinColumn,
} from 'typeorm'
import { Project } from './project.entity'
import { User } from 'src/handlers/user/entities/user.entity'

@Entity('project_views')
@Unique(['userId', 'projectId'])
export class ProjectView {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: string

    @Column()
    projectId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'projectId' })
    project: Project

    @CreateDateColumn()
    viewedAt: Date
}
