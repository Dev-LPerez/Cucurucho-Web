import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { Product } from '../products/product.entity';
import { Ingredient } from '../inventory/ingredient.entity';
import { Table } from '../tables/table.entity';
import { Payment } from './payment.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      Product,
      Ingredient,
      Table,
      Payment,
    ]),
    forwardRef(() => QueueModule),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
