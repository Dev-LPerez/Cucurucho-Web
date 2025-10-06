import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Column,
  ManyToOne,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { Table } from '../tables/table.entity';
import { Payment } from './payment.entity'; // <-- 1. Importar Payment

export enum SaleStatus {
  PENDING = 'pending', // Abierta, ej. en una mesa
  PAID = 'paid', // Pagada completamente
  CANCELED = 'canceled', // Anulada
}

export enum QueueStatus {
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
}

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  // --- NUEVOS CAMPOS PARA FACTURACIÓN ---
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  // --- RELACIÓN CON PAGOS ---
  @OneToMany(() => Payment, (payment) => payment.sale, { cascade: true })
  payments: Payment[];

  // --- RELACIÓN CON MESA ---
  @ManyToOne(() => Table, (table) => table.sales, { nullable: true })
  table: Table;

  // --- CAMPOS PARA COLA DE MOSTRADOR ---
  @Column({ nullable: true })
  turnNumber: number;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    nullable: true,
  })
  queueStatus: QueueStatus;
}

