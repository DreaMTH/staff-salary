import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query
} from '@nestjs/common';
import { StaffService } from "./staff.service";
import { StaffDto } from "./staff.dto";

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {
  }

  @Get()
  async getAllStaff() {
    return await this.staffService.getStaff();
  }

  @Get('/employee')
  async getEmployees() {
    return await this.staffService.getEmployees();
  }

  @Get('/managers')
  async getManagers() {
    return await this.staffService.getManagers();
  }

  @Get('/sales')
  async getSales() {
    return await this.staffService.getSales();
  }

  @Post('/employee/new')
  async addEmployee(@Body() body: StaffDto) {
    return await this.staffService.addEmployee(body);
  }

  @Post('/manager/new')
  async addManager(@Body() body: StaffDto) {
    return await this.staffService.addManager(body);
  }

  @Post('/sales/new')
  async addSales(@Body() body: StaffDto) {
    return await this.staffService.addSales(body);
  }

  @Get('/employee/:id')
  async findEmployeeById(@Param('id') id: number) {
    return await this.staffService.getEmployeeById(id);
  }

  @Get('/manager/:id')
  async findManagerById(@Param('id') id: number) {
    return await this.staffService.getManagerById(id);
  }

  @Get('/sales/:id')
  async findSalesById(@Param('id') id: number) {
    return await this.staffService.getSalesById(id);
  }

  @Delete('/employee/:id')
  async removeEmployeeById(@Param('id') id: number) {
    return await this.staffService.removeEmployee(id);
  }

  @Delete('/manager/:id')
  async removeManagerById(@Param('id') id: number) {
    return await this.staffService.removeManager(id);
  }

  @Delete('/sales/:id')
  async removeSalesById(@Param('id') id: number) {
    return await this.staffService.removeSales(id);
  }

  @Get('/salary/employee/:id')
  async calculateEmployeeSalary(@Param('id') id: number, @Query(
    'date') date: string) {
    if (!date) {
      return {
        salary: await this.staffService.calculateEmployeeSalary(id, new Date())
      };
    }
    return {
      salary: await this.staffService.calculateEmployeeSalary(id,
        new Date(date))
    };
  }

  @Get('/salary/manager/:id')
  async calculateManagerSalary(@Param('id') id: number, @Query(
    'date') date: string) {
    if (!date) {
      return {
        salary: await this.staffService.calculateManagerSalary(id, new Date())
      };
    }
    return {
      salary: await this.staffService.calculateManagerSalary(id, new Date(date))
    };
  }

  @Get('/salary/sales/:id')
  async calculateSalesSalary(@Param('id') id: number, @Query(
    'date') date: string) {
    if (!date) {
      return {
        salary: await this.staffService.calculateSalesSalary(id, new Date())
      };
    }
    return {
      salary: await this.staffService.calculateSalesSalary(id, new Date(date))
    };
  }

  @Get('/salary/all')
  async calculateAllSalaries(@Query('data') date: string) {
    if (!date) {
      return {
        salary: await this.staffService.calculateSumSalaries(new Date())
      };
    }
    return {
      salary: await this.staffService.calculateSumSalaries(new Date(date))
    };
  }
}
