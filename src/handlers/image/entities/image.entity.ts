import { BaseEntity } from "src/database/base.entity";
import { Project } from "src/handlers/project/entities/project.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('images')
export class Image extends BaseEntity {
    @Column()
    original_url: string;

    @Column()
    thumbnail_url: string;

    @ManyToOne(() => Project, project => project.images, {
        onDelete: 'CASCADE',
    })
    project: Project
}
 