import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Project } from './project.entity'

@Entity('images')
export class Image {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(() => Project, project => project.images, {
        onDelete: 'CASCADE',
    })
    project: Project
}
