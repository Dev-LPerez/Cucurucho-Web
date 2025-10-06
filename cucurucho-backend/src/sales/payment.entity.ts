import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  OTHER = 'other',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (sale) => sale.payments)
  sale: Sale;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;
}

