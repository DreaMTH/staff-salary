import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaffModule } from './staff/staff.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "./entity/employee.enity";
import { Manager } from "./entity/manager.entity";
import { Sales } from "./entity/sales.entity";

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'sqlite',
      database: './data/db.sqlite',
      entities: [Employee, Manager, Sales],
      autoLoadEntities: true,
      synchronize: true
    })
  }), StaffModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
