import {
  Column,
  PrimaryGeneratedColumn
} from "typeorm";

export abstract class Staff {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  baseSalary: number

  @Column()
  joinDate: string

  @Column({ nullable: true })
  supervisor_id?: number

  @Column({ nullable: true })
  subordinates_id?: string
}