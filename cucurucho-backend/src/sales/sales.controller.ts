import { Controller, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body(new ValidationPipe()) createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }
}

