import { BaseEntity } from 'src/database/base.entity'
import { User } from 'src/handlers/user/entities/user.entity'
import { Column, Entity, ManyToMany } from 'typeorm'

@Entity()
export class Course extends BaseEntity {
  @Column()
  name: string

  @Column({ default: '' })
  description: string

  @Column({ unique: true })
  code: string

  @ManyToMany(() => User, user => user.courses)
  users: User[]
}
