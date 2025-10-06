import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale, SaleStatus, QueueStatus } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { Product } from '../products/product.entity';
import { Ingredient } from '../inventory/ingredient.entity';
import { Table, TableStatus } from '../tables/table.entity';
import { ConfigService } from '@nestjs/config';
import { QueueGateway } from '../queue/queue.gateway';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private dataSource: DataSource,
    private configService: ConfigService,
    @Inject(forwardRef(() => QueueGateway))
    private queueGateway: QueueGateway,
  ) {}

  async createSale(createSaleDto: CreateSaleDto): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const saleItems: SaleItem[] = [];
      const taxRate = this.configService.get<number>('TAX_RATE') || 0;

      // 1. Procesar items y calcular subtotal
      for (const itemDto of createSaleDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          relations: ['recipeItems', 'recipeItems.ingredient'],
        });
        if (!product) throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado.`);

        if (product.recipeItems) {
          for (const recipeItem of product.recipeItems) {
            const ingredient = recipeItem.ingredient;
            const requiredStock = recipeItem.quantity * itemDto.quantity;
            if (ingredient.stock < requiredStock) {
              throw new BadRequestException(`Stock insuficiente para el ingrediente: ${ingredient.name}`);
            }
            ingredient.stock -= requiredStock;
            await queryRunner.manager.save(ingredient);
          }
        }
        const saleItem = new SaleItem();
        saleItem.product = product;
        saleItem.quantity = itemDto.quantity;
        saleItem.price = product.price;
        saleItems.push(saleItem);
        subtotal += product.price * itemDto.quantity;
      }

      // 2. Calcular descuento
      let discountAmount = 0;
      if (createSaleDto.discount) {
        if (createSaleDto.discount.type === 'percentage') {
          discountAmount = subtotal * (createSaleDto.discount.value / 100);
        } else {
          discountAmount = createSaleDto.discount.value;
        }
      }

      // 3. Calcular impuestos y total
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * taxRate;
      const total = taxableAmount + taxAmount;

      // 4. Crear la venta
      const sale = new Sale();
      sale.items = saleItems;
      sale.subtotal = subtotal;
      sale.discountAmount = discountAmount;
      sale.taxAmount = taxAmount;
      sale.total = total;

      // 5. Lógica para mesas vs mostrador
      if (createSaleDto.tableId) {
        const table = await queryRunner.manager.findOneBy(Table, { id: createSaleDto.tableId });
        if (!table) throw new NotFoundException(`Mesa con ID ${createSaleDto.tableId} no encontrada.`);
        sale.table = table;
        table.status = TableStatus.OCCUPIED;
        await queryRunner.manager.save(table);
      } else {
        // Lógica de cola para mostrador
        const turnNumber = await this.getNextTurnNumber();
        sale.turnNumber = turnNumber;
        sale.queueStatus = QueueStatus.PREPARING;
      }

      // 6. Procesar pagos inmediatos (si existen)
      if (createSaleDto.payments && createSaleDto.payments.length > 0) {
        const totalPaid = createSaleDto.payments.reduce((acc, p) => acc + p.amount, 0);
        if (Math.abs(totalPaid - total) > 0.01) { // Tolerancia para decimales
          throw new BadRequestException('El monto pagado no coincide con el total de la venta.');
        }
        sale.status = SaleStatus.PAID;
      }

      const savedSale = await queryRunner.manager.save(sale);

      // Emitir evento WebSocket si es una venta de mostrador
      if (!savedSale.table) {
          this.queueGateway.server.emit('newOrder', savedSale);
      }

      await queryRunner.commitTransaction();

      const result = await this.salesRepository.findOne({ where: { id: savedSale.id }, relations: ['items', 'table', 'payments'] });

      if (!result) {
        // This should not happen in normal circumstances
        throw new NotFoundException(`Failed to retrieve the created sale with id ${savedSale.id}`);
      }

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getNextTurnNumber(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSale = await this.salesRepository
        .createQueryBuilder("sale")
        .where("sale.createdAt >= :today", { today })
        .andWhere("sale.turnNumber IS NOT NULL")
        .orderBy("sale.turnNumber", "DESC")
        .getOne();

    return (lastSale?.turnNumber || 0) + 1;
  }
}
