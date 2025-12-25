import { User } from "src/handlers/user/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Project } from "./project.entity";

@Entity('Project_likes')
@Unique(['user', 'project'])
export class ProjectLike {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.projectLikes, { onDelete: 'CASCADE' })
    user: User

    @ManyToOne(() => Project, project => project.likes, { onDelete: 'CASCADE' })
    project: Project

    @CreateDateColumn()
    create_at: Date
}