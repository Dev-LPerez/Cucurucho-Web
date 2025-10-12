// Ruta: cucurucho-backend/src/tables/table.entity.ts
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

  // --- CAMPO AÑADIDO ---
  @Column({ type: 'int', default: 1 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.FREE,
  })
  status: TableStatus;

  @OneToMany(() => Sale, (sale) => sale.table)
  sales: Sale[];
}