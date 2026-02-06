import { BaseEntity } from 'src/database/base.entity'
import { Column, Entity } from 'typeorm'

@Entity()
export class Notification extends BaseEntity {
    @Column()
    name: string

    @Column()
    description: string

    @Column({ default: 'pending' })
    status: 'pending' | 'rejected' | 'accepted'

    @Column({ default: false })
    read: boolean

    @Column()
    userId: string
}
