import { Entity } from "typeorm";
import { Staff } from "./staff.entity";

@Entity()
export class Employee extends Staff {
}