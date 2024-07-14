import { Module } from '@nestjs/common';
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "../entity/employee.enity";
import { Manager } from "../entity/manager.entity";
import { Sales } from "../entity/sales.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Manager, Sales])],
  controllers: [StaffController],
  providers: [StaffService]
})
export class StaffModule {
}
