import { IsIn } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('real-students')
export class RealStudent {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    studentId: string

    @Column({ nullable: false })
    nameEn: string

    @Column({ nullable: false })
    nameKh: string

    @Column({ type: 'char', length: 1, nullable: false })
    @IsIn(['M', 'F'])
    gender: string

    @Column({ type: 'date' })
    dob: Date

    @Column()
    phoneNumber: string

    @Column()
    class: string

    @Column({ type: 'char', length: 1 })
    @IsIn(['A', 'B', 'C', 'D', 'E', 'F'])
    group: string

    @CreateDateColumn({ type: 'timestamptz' })
    readonly ingestedAt!: Date
}
