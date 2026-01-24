import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Project } from './project.entity'

export type FeatureStatus = 'pending' | 'ongoing' | 'done'

@Entity('features')
export class Feature extends BaseEntity {
  @Column()
  name: string

  @Column()
  description: string

  // pending, ongoing, done
  @Column({ default: 'pending', type: 'enum', enum: ['pending', 'ongoing', 'done'] })
  status: FeatureStatus

  @Column({ nullable: true })
  icon: string

  @ManyToOne(
    () => Project,
    project => project.features,
    { onDelete: 'SET NULL' },
  )
  project: Project

  @Column({ nullable: true, type: 'timestamptz' })
  doneAt: Date | null
}
