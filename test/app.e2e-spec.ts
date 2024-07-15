import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { StaffModule } from "./../src/staff/staff.module";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, StaffModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Test employee salary counter', () => {
    return request(app.getHttpServer())
      .get('/staff/salary/employee/1?date=2024-07-15')
      .expect(200)
      .expect({ salary: 1270 });
  });
  it('Test manager salary counter', () => {
    return request(app.getHttpServer())
      .get('/staff/salary/manager/1?date=2024-07-15')
      .expect(200)
      .expect({ salary: 1405 })
  });
  it('Test sales salary counter', () => {
    return request(app.getHttpServer())
      .get('/staff/salary/sales/1?date=2024-07-15')
      .expect(200)
      .expect({ salary: 548 })
  })
  it('Test all salary counter', () => {
    return request(app.getHttpServer())
      .get('/staff/salary/all?date=2024-07-15')
      .expect(200)
      .expect({ salary: 5714.5 })
  })
});
