import { BaseEntity } from "src/database/base.entity";
import { User } from "src/handlers/user/entities/user.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('departments')
export class Department extends BaseEntity {
    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ nullable: true })
    description: String;

    @OneToMany(() => User, (user) => user.department)
    users: User[];
}