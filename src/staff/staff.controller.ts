import { Body, Controller, Get, Post } from '@nestjs/common';
import { StaffService } from "./staff.service";

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
  async addEmployee(@Body() body: any) {
    return await this.staffService.addEmployee(body);
  }

  @Post('/employee/new')
  async addManager(@Body() body: any) {
    return await this.staffService.addManager(body);
  }

  @Post('/employee/new')
  async addSales(@Body() body: any) {
    return await this.staffService.addSales(body);
  }
}
