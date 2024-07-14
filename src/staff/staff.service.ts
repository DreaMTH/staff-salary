import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "../entity/employee.enity";
import { DataSource, Repository } from "typeorm";
import { Manager } from "../entity/manager.entity";
import { Sales } from "../entity/sales.entity";
import { Staff } from "../entity/staff.entity";
import { StaffDto } from "./staff.dto";

enum StaffType {
  Employee,
  Manager,
  Sales
}

@Injectable()
export class StaffService {

  constructor(@InjectRepository(
                Employee) private readonly employeeRepository: Repository<Employee>,
              @InjectRepository(
                Manager) private readonly managerRepository: Repository<Manager>,
              @InjectRepository(
                Sales) private readonly salesRepository: Repository<Sales>,
              private dataSource: DataSource) {
  }

  async getStaff(): Promise<Staff[]> {
    const employees = await this.employeeRepository.find({});
    const managers = await this.managerRepository.find({});
    const sales = await this.salesRepository.find({});
    return [...employees, ...managers, ...sales];
  }

  async getEmployees(): Promise<Staff[]> {
    return await this.employeeRepository.find({});
  }

  async getManagers(): Promise<Staff[]> {
    return await this.managerRepository.find({});
  }

  async getSales(): Promise<Staff[]> {
    return await this.salesRepository.find({});
  }

  async addEmployee(employee: StaffDto): Promise<Staff> {
    return await this.addStaffMember(employee, StaffType.Employee);
  }

  async addManager(manager: StaffDto): Promise<Staff> {
    return await this.addStaffMember(manager, StaffType.Manager);
  }

  async addSales(sales: StaffDto): Promise<Staff> {
    return await this.addStaffMember(sales, StaffType.Sales);
  }

  async getEmployeeById(id: number): Promise<Staff> {
    return await this.employeeRepository.findOne({ where: { id } });
  }

  async getManagerById(id: number): Promise<Staff> {
    return await this.managerRepository.findOne({ where: { id } });
  }

  async getSalesById(id: number): Promise<Staff> {
    return await this.salesRepository.findOne({ where: { id } });
  }

  private async addStaffMember(staffMember: StaffDto, staffType: StaffType): Promise<Staff> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let currentRepository: Repository<Staff>;
    switch (staffType) {
      case StaffType.Employee:
        currentRepository = this.employeeRepository;
        break;
      case StaffType.Manager:
        currentRepository = this.managerRepository;
        break;
      case StaffType.Sales:
        currentRepository = this.salesRepository;
        break;
    }
    try {
      const savedEmployee = await currentRepository.save(staffMember as Staff);
      if (staffMember.supervisor_id) {
        const supervisorsSubs = await currentRepository.findOne({
          select: { subordinates_id: true },
          where: { id: staffMember.supervisor_id }
        },);
        await currentRepository.update({ id: staffMember.supervisor_id }, {
          subordinates_id: supervisorsSubs ? supervisorsSubs.subordinates_id.concat(
            `,${ savedEmployee.id }`) : `${ savedEmployee.id }`
        })
      }
      if (staffMember.subordinates_id) {
        const subordinates: string[] = staffMember.subordinates_id.split(',');
        const updatingAllSubs = subordinates.map(
          id => new Promise(async (resolve) => {
            resolve(
              await currentRepository.update({ id: Number.parseInt(id) },
                { supervisor_id: savedEmployee.id }));
          }));
        await Promise.all(updatingAllSubs);
      }
      await queryRunner.commitTransaction();
      return savedEmployee;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
