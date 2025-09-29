// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/inventory/inventory.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  // Devuelve todos los ingredientes.
  findAllIngredients(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find();
  }

  // Crea un nuevo ingrediente en la base de datos.
  createIngredient(ingredientData: Partial<Ingredient>): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create(ingredientData);
    return this.ingredientsRepository.save(ingredient);
  }
}
