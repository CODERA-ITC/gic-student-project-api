import { BaseEntity } from "src/database/base.entity";
import { Project } from "src/handlers/project/entities/project.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('images')
export class Image extends BaseEntity {
    @Column()
    originalUrl: string;

    @Column()
    thumbnailUrl: string;

    @ManyToOne(() => Project, project => project.images, {
        onDelete: 'CASCADE',
    })
    project: Project
}
 