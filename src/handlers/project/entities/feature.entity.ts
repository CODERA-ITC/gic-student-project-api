import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'

export type FeatureStatus = 'pending' | 'ongoing' | 'done'

@Entity('features')
export class Feature {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    // pending, ongoing, done
    @Column({ default: 'pending', type: 'enum', enum: ['pending', 'ongoing', 'done'] })
    status: FeatureStatus

    @Column({ nullable: true })
    icon: string

    @ManyToOne(() => Project, project => project.features)
    project: Project

    @Column({ nullable: true, type: 'timestamptz' })
    doneAt: Date | null

    @CreateDateColumn({ type: 'timestamptz' })
    readonly createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    readonly updatedAt!: Date

    // nestjs built-in soft delete
    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date
}
