// Ruta: cucurucho-backend/src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
  ) {}

  async getSummary() {
    // Ya no necesitamos traer la receta completa, solo el producto
    const sales = await this.salesRepository.find({ relations: ['items', 'items.product'] });

    const totalIngresos = sales.reduce((acc, sale) => acc + Number(sale.total), 0);
    const totalOrdenes = sales.length;
    const ticketPromedio = totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0;

    let costosTotales = 0;
    const productSales = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        // --- CORRECCIÓN AQUÍ ---
        // Ahora podemos usar product.cost de forma segura
        const cost = item.product.cost || 0;
        costosTotales += Number(cost) * item.quantity;

        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            id: item.product.id,
            nombre: item.product.name,
            unidades: 0,
            precioVenta: Number(item.price),
            costo: Number(cost),
          };
        }
        productSales[item.product.id].unidades += item.quantity;
      }
    }

    const gananciaNeta = totalIngresos - costosTotales;
    const margenPromedio = totalIngresos > 0 ? (gananciaNeta / totalIngresos) * 100 : 0;

    return {
      ingresosTotales: totalIngresos,
      costosTotales,
      gananciaNeta,
      margenPromedio,
      ordenesTotales: totalOrdenes,
      ticketPromedio,
      productos: Object.values(productSales),
    };
  }
}