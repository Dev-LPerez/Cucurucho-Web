import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  findAllIngredients(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find();
  }

  createIngredient(ingredientData: Partial<Ingredient>): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create(ingredientData);
    return this.ingredientsRepository.save(ingredient);
  }

  async updateStock(id: number, change: number): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOneBy({ id });

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado.`);
    }

    const newStock = Number(ingredient.stock) + change;

    if (newStock < 0) {
      throw new BadRequestException('El stock no puede ser negativo.');
    }

    ingredient.stock = newStock;
    return this.ingredientsRepository.save(ingredient);
  }

  // --- NUEVO MÉTODO PARA ELIMINAR UN INGREDIENTE ---
  async deleteIngredient(id: number): Promise<void> {
    const result = await this.ingredientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado.`);
    }
  }
}