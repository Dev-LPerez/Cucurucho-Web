import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Modifier)
    private modifiersRepository: Repository<Modifier>,
  ) {}

  // --- Métodos para Productos ---
  findAllProducts(): Promise<Product[]> {
    return this.productsRepository.find({ relations: ['category', 'modifiers'] });
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  // --- Métodos para Categorías ---
  findAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({ relations: ['products'] });
  }

  createCategory(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create(categoryData);
    return this.categoriesRepository.save(category);
  }

  // --- Métodos para Modificadores ---
  findAllModifiers(): Promise<Modifier[]> {
    return this.modifiersRepository.find();
  }

  createModifier(modifierData: Partial<Modifier>): Promise<Modifier> {
    const modifier = this.modifiersRepository.create(modifierData);
    return this.modifiersRepository.save(modifier);
  }
}