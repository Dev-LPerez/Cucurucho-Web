import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Sale } from '../sales/sale.entity';

export enum TableStatus {
  FREE = 'free',
  OCCUPIED = 'occupied',
  PAYING = 'paying',
}

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.FREE,
  })
  status: TableStatus;

  @OneToMany(() => Sale, (sale) => sale.table)
  sales: Sale[];
}

