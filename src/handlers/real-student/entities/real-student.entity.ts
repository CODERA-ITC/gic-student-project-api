import { IsIn } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RealStudent {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, unique: true })
    studentId: string

    @Column({ nullable: false })
    nameEn: string

    @Column({ nullable: false })
    nameKh: string

    @Column({ type: 'char', length: 1, nullable: false })
    gender: 'M' | 'F'

    @Column({ nullable: false })
    dob: String

    @Column({ nullable: false })
    phoneNumber: number

    @Column()
    class: string

    @Column({ type: 'char', length: 1 })
    group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

    @CreateDateColumn({ type: 'timestamptz' })
    readonly ingestedAt!: Date
}
