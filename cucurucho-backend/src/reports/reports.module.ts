// Ruta: cucurucho-backend/src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}