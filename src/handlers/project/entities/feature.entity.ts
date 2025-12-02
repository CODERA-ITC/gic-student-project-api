import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Project } from './project.entity'

@Entity('features')
export class Feature extends BaseEntity {
    @Column()
    name: string

    // pending, ongoing, done
    @Column({ default: 'pending' })
    status: string

    @ManyToOne(() => Project, project => project.features)
    project: Project
}
