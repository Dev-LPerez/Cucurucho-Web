// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { RecipeItem } from './recipe-item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Modifier)
    private modifiersRepository: Repository<Modifier>,
    @InjectRepository(RecipeItem)
    private recipeItemsRepository: Repository<RecipeItem>,
  ) {}

  // --- Métodos para Productos ---
  findAllProducts(): Promise<Product[]> {
    return this.productsRepository.find({ relations: ['category', 'modifiers', 'recipeItems', 'recipeItems.ingredient'] });
  }

  // --- MÉTODO ACTUALIZADO ---
  async createProduct(productData: CreateProductDto): Promise<Product> {
    const { name, price, categoryId, recipeItems } = productData;

    const category = await this.categoriesRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
    }

    // Crea la entidad del producto principal.
    const product = this.productsRepository.create({
      name,
      price,
      category,
    });

    // Guarda el producto para obtener su ID.
    const savedProduct = await this.productsRepository.save(product);

    // Crea y asocia los items de la receta.
    if (recipeItems && recipeItems.length > 0) {
      const items = recipeItems.map(itemDto =>
        this.recipeItemsRepository.create({
          quantity: itemDto.quantity,
          product: savedProduct,
          ingredient: { id: itemDto.ingredientId }, // Asocia por ID
        }),
      );
      await this.recipeItemsRepository.save(items);
    }
    
    // --- CORRECCIÓN ---
    // Vuelve a buscar el producto con todas sus relaciones para devolverlo completo.
    const fullProduct = await this.productsRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'recipeItems', 'recipeItems.ingredient'],
    });

    // Añadimos una comprobación por si el producto no se encontrara.
    if (!fullProduct) {
        throw new NotFoundException(`Error al recuperar el producto recién creado con ID ${savedProduct.id}`);
    }

    return fullProduct;
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

