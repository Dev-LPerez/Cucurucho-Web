import { Controller, Patch, Param, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, QueueStatus } from '../sales/sale.entity';
import { QueueGateway } from './queue.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UpdateQueueStatusDto {
    status: QueueStatus;
}

@UseGuards(JwtAuthGuard)
@Controller('queue')
export class QueueController {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private queueGateway: QueueGateway,
  ) {}

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateQueueStatusDto: UpdateQueueStatusDto,
  ): Promise<Sale> {
    const sale = await this.salesRepository.findOneBy({ id: +id });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada.`);
    }

    sale.queueStatus = updateQueueStatusDto.status;
    const updatedSale = await this.salesRepository.save(sale);

    // Emitir evento a todos los clientes conectados
    this.queueGateway.server.emit('orderUpdated', updatedSale);

    return updatedSale;
  }
}

