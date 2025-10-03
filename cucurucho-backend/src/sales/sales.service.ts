import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { Product } from '../products/product.entity';
import { Ingredient } from '../inventory/ingredient.entity';
import { Table, TableStatus } from '../tables/table.entity'; // Importar Table

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    private dataSource: DataSource,
  ) {}

  async createSale(createSaleDto: CreateSaleDto): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      const saleItems: SaleItem[] = [];

      // Validar si la venta es para una mesa
      let table: Table | null = null;
      if (createSaleDto.tableId) {
        table = await queryRunner.manager.findOneBy(Table, { id: createSaleDto.tableId });
        if (!table) {
          throw new NotFoundException(`Mesa con ID ${createSaleDto.tableId} no encontrada.`);
        }
      }

      for (const itemDto of createSaleDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          relations: ['recipeItems', 'recipeItems.ingredient'],
        });

        if (!product) {
          throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado.`);
        }

        // Descontar inventario
        if (product.recipeItems) {
          for (const recipeItem of product.recipeItems) {
            const ingredient = recipeItem.ingredient;
            if (ingredient.stock < recipeItem.quantity * itemDto.quantity) {
              throw new BadRequestException(`Stock insuficiente para el ingrediente: ${ingredient.name}`);
            }
            ingredient.stock -= recipeItem.quantity * itemDto.quantity;
            await queryRunner.manager.save(ingredient);
          }
        }

        const saleItem = new SaleItem();
        saleItem.product = product;
        saleItem.quantity = itemDto.quantity;
        saleItem.price = product.price;
        saleItems.push(saleItem);

        total += product.price * itemDto.quantity;
      }

      const sale = new Sale();
      sale.items = saleItems;
      sale.total = total;
      if (table) {
        sale.table = table;
        // Si es una venta para una mesa, la marcamos como ocupada
        table.status = TableStatus.OCCUPIED;
        await queryRunner.manager.save(table);
      }

      const savedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return savedSale;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
