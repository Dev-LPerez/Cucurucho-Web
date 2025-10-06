import { Module, forwardRef } from '@nestjs/common';
import { QueueGateway } from './queue.gateway';
import { SalesModule } from '../sales/sales.module';
import { QueueController } from './queue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../sales/sale.entity';

@Module({
  imports: [forwardRef(() => SalesModule), TypeOrmModule.forFeature([Sale])],
  providers: [QueueGateway],
  controllers: [QueueController],
  exports: [QueueGateway],
})
export class QueueModule {}
