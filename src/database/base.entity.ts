import { Exclude } from 'class-transformer'
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date

  // nestjs built-in soft delete
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date
}
