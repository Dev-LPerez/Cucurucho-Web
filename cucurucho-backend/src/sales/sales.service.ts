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
import { AddPaymentDto } from './dto/add-payment.dto'; // <-- 1. Importar el nuevo DTO
import { Payment } from './payment.entity'; // <-- 2. Importar la entidad Payment

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        @InjectRepository(Payment) // <-- 3. Inyectar el repositorio de Payment
        private paymentRepository: Repository<Payment>,
        private dataSource: DataSource,
        private configService: ConfigService,
        @Inject(forwardRef(() => QueueGateway))
        private queueGateway: QueueGateway,
    ) {}

    // --- El método createSale se mantiene como lo teníamos ---
    async createSale(createSaleDto: CreateSaleDto): Promise<Sale> {
        // ... (código existente sin cambios)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let subtotal = 0;
            const saleItems: SaleItem[] = [];

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

            let discountAmount = 0;
            if (createSaleDto.discount) {
                if (createSaleDto.discount.type === 'percentage') {
                    discountAmount = subtotal * (createSaleDto.discount.value / 100);
                } else {
                    discountAmount = createSaleDto.discount.value;
                }
            }

            const total = subtotal - discountAmount;

            const sale = new Sale();
            sale.items = saleItems;
            sale.subtotal = subtotal;
            sale.discountAmount = discountAmount;
            sale.total = total;

            if (createSaleDto.tableId) {
                const table = await queryRunner.manager.findOneBy(Table, { id: createSaleDto.tableId });
                if (!table) throw new NotFoundException(`Mesa con ID ${createSaleDto.tableId} no encontrada.`);
                sale.table = table;
                table.status = TableStatus.OCCUPIED;
                await queryRunner.manager.save(table);
            } else {
                const turnNumber = await this.getNextTurnNumber();
                sale.turnNumber = turnNumber;
                sale.queueStatus = QueueStatus.PREPARING;
            }

            if (createSaleDto.payments && createSaleDto.payments.length > 0) {
                const totalPaid = createSaleDto.payments.reduce((acc, p) => acc + p.amount, 0);
                if (Math.abs(totalPaid - total) > 0.01) {
                    throw new BadRequestException('El monto pagado no coincide con el total de la venta.');
                }
                sale.status = SaleStatus.PAID;
            }

            const savedSale = await queryRunner.manager.save(sale);

            if (!savedSale.table) {
                this.queueGateway.server.emit('newOrder', savedSale);
            }

            await queryRunner.commitTransaction();

            const result = await this.salesRepository.findOne({ where: { id: savedSale.id }, relations: ['items', 'table', 'payments'] });

            if (!result) {
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

    // --- NUEVO MÉTODO PARA AÑADIR PAGOS ---
    async addPayments(saleId: number, addPaymentDto: AddPaymentDto): Promise<Sale> {
        const sale = await this.salesRepository.findOne({
            where: { id: saleId },
            relations: ['payments', 'table'],
        });

        if (!sale) {
            throw new NotFoundException(`Venta con ID ${saleId} no encontrada.`);
        }
        if (sale.status === SaleStatus.PAID) {
            throw new BadRequestException('Esta venta ya ha sido pagada en su totalidad.');
        }

        const totalAlreadyPaid = sale.payments.reduce((acc, p) => acc + Number(p.amount), 0);
        const newPaymentsTotal = addPaymentDto.payments.reduce((acc, p) => acc + p.amount, 0);
        const newTotalPaid = totalAlreadyPaid + newPaymentsTotal;

        // Usamos una tolerancia para comparar números flotantes
        if (newTotalPaid > sale.total + 0.01) {
            throw new BadRequestException('El monto pagado excede el total de la venta.');
        }

        // Crear y guardar las nuevas entidades de pago
        const newPayments = addPaymentDto.payments.map(p => {
            const payment = new Payment();
            payment.sale = sale;
            payment.amount = p.amount;
            payment.method = p.method;
            return payment;
        });
        await this.paymentRepository.save(newPayments);

        // Si el pago es completo, actualizamos el estado de la venta y de la mesa
        if (Math.abs(newTotalPaid - sale.total) < 0.01) {
            sale.status = SaleStatus.PAID;
            if (sale.table) {
                sale.table.status = TableStatus.FREE; // La mesa se libera
                await this.dataSource.manager.save(sale.table);
            }
        }

        return this.salesRepository.save(sale);
    }

    private async getNextTurnNumber(): Promise<number> {
        // ... (código existente sin cambios)
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