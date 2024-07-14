import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}
