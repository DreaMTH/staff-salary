import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "../entity/employee.enity";
import { DataSource, In, Repository } from "typeorm";
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
  readonly millisecondsPerMonth = 3.15576e+10;

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

  async removeEmployee(id: number) {
    await this.removeStaffMember(id, StaffType.Employee);
  }

  async removeManager(id: number) {
    await this.removeStaffMember(id, StaffType.Manager);
  }

  async removeSales(id: number) {
    await this.removeStaffMember(id, StaffType.Sales);
  }

  async calculateEmployeeSalary(id: number, date: Date) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    return this.calculateYearsSalary(employee, date, StaffType.Employee);
  }

  async calculateManagerSalary(id: number, date: Date) {
    const manager = await this.managerRepository.findOne({ where: { id } });
    let resultSalary = this.calculateYearsSalary(manager, date,
      StaffType.Manager);
    if (!!manager.subordinates_id) {
      const managers = await this.managerRepository.find({
        where: {
          id: In<number>(
            manager.subordinates_id.split(',').map(item => parseInt(item)))
        }
      })
      let sumOfSalaries: number = 0;
      managers.forEach(item => sumOfSalaries += item.baseSalary);
      return resultSalary + 0.005 * sumOfSalaries;
    }
    return resultSalary;
  }

  async calculateSalesSalary(id: number, date: Date) {
    const sales = await this.salesRepository.findOne({ where: { id } });
    let resultSalary = this.calculateYearsSalary(sales, date,
      StaffType.Sales);
    if (!!sales.subordinates_id) {
      const counter = { salary: 0 };
      await this.calculateSubordinatesSalaries(counter, sales);
      counter.salary -= sales.baseSalary;
      return resultSalary + 0.003 * counter.salary;
    }
    return resultSalary;
  }

  async calculateSumSalaries(date: Date) {
    const employees = await this.employeeRepository.find({});
    const managers = await this.managerRepository.find({});
    const sales = await this.salesRepository.find({});
    let counter = 0;
    for (const employee of employees) {
      counter += await this.calculateEmployeeSalary(employee.id, date);
    }
    for (const manager of managers) {
      counter += await this.calculateManagerSalary(manager.id, date);
    }
    for (const sale of sales) {
      counter += await this.calculateSalesSalary(sale.id, date);
    }
    return counter;
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

  private async removeStaffMember(id: number, staffType: StaffType) {
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
      const removedMember = await currentRepository.findOne({ where: { id } });
      if (removedMember.subordinates_id) {
        const removingSupersRecord = removedMember.subordinates_id
          .split(',')
          .map(item => new Promise(async (resolve) => {
            resolve(
              await currentRepository.update(item, { supervisor_id: null }));
          }));
        await Promise.all(removingSupersRecord);
      }
      if (removedMember.supervisor_id) {
        const supervisor = await currentRepository.findOne(
          { where: { id: removedMember.supervisor_id } });
        await currentRepository.update(supervisor.id, {
          subordinates_id: supervisor.subordinates_id.split(',')
            .filter(item => item !== removedMember.id.toString()).join(',')
        });
      }
      await currentRepository.remove(removedMember);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private getFullYears(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const passedTime = end.getTime() - start.getTime();
    const fullYears = Math.floor(passedTime / this.millisecondsPerMonth);
    if (fullYears < 0) {
      return 0;
    }
    return fullYears;
  }

  private calculateYearsSalary(staffMember: Staff, date: Date, staffType: StaffType) {
    let yearCoefficient: number;
    let yearBorder: number;
    switch (staffType) {
      case StaffType.Employee:
        yearCoefficient = 0.03;
        yearBorder = 0.3;
        break;
      case StaffType.Manager:
        yearCoefficient = 0.05;
        yearBorder = 0.4;
        break;
      case StaffType.Sales:
        yearCoefficient = 0.01;
        yearBorder = 0.35;
        break;
    }
    const yearDiff = this.getFullYears(new Date(staffMember.joinDate), date);
    let finalSalary: number;
    if ((yearDiff * yearCoefficient * staffMember.baseSalary) > (yearBorder * staffMember.baseSalary)) {
      finalSalary = staffMember.baseSalary + yearBorder * staffMember.baseSalary;
    } else {
      finalSalary = staffMember.baseSalary + yearDiff * yearCoefficient * staffMember.baseSalary;
    }
    return finalSalary;
  }

  private async calculateSubordinatesSalaries(counter: {
    salary: number
  }, nextMember: Staff) {
    counter.salary += nextMember.baseSalary;
    if (nextMember.subordinates_id === null) {
      return;
    }
    const subordinates = await this.salesRepository.find(
      {
        where: {
          id: In<number>(
            nextMember.subordinates_id.split(',').map(item => parseInt(item)))
        }
      })
    for (const subordinate of subordinates) {
      await this.calculateSubordinatesSalaries(counter, subordinate);
    }
  }
}
