import { Controller, Post, Body, UseGuards, ValidationPipe, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddPaymentDto } from './dto/add-payment.dto'; // <-- Importar el nuevo DTO

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body(new ValidationPipe()) createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  // --- NUEVO ENDPOINT PARA REGISTRAR PAGOS ---
  @Post(':id/payments')
  addPayments(
    @Param('id') id: string,
    @Body(new ValidationPipe()) addPaymentDto: AddPaymentDto,
  ) {
    return this.salesService.addPayments(+id, addPaymentDto);
  }
}