import { BaseEntity } from "src/database/base.entity";
import { User } from "src/handlers/user/entities/user.entity";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity("notifications")
export class Notification extends BaseEntity {
    @Column()
    name: string

    @Column()
    description: string

    @Column({ default: "pending" })
    status: 'pending' | 'rejected' | 'accepted'

    @Column({ default: false })
    read: boolean

    @ManyToMany(() => User, user => user.notifications)
    users: User[]
}
