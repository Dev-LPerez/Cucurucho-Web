import { Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Column, ManyToOne } from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { Table } from '../tables/table.entity'; // <-- Importar Table

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  // Nueva relación con la mesa (puede ser nula para ventas de mostrador)
  @ManyToOne(() => Table, (table) => table.sales, { nullable: true })
  table: Table;
}
