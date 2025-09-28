import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Modifier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Precio adicional del modificador

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number; // Costo para el negocio (importante para la rentabilidad)
}