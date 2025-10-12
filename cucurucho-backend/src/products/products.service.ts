// Ruta: cucurucho-backend/src/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { RecipeItem } from './recipe-item.entity';
import { Ingredient } from '../inventory/ingredient.entity';

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
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  private async calculateRecipeCost(recipeItemsDto: { ingredientId: number, quantity: number }[]): Promise<number> {
    if (!recipeItemsDto || recipeItemsDto.length === 0) {
      return 0;
    }

    const ingredientIds = recipeItemsDto.map(item => item.ingredientId);
    const ingredients = await this.ingredientsRepository.findBy({ id: In(ingredientIds) });

    const ingredientCostMap = new Map(ingredients.map(ing => [ing.id, ing.cost]));

    let totalCost = 0;
    for (const item of recipeItemsDto) {
      const cost = ingredientCostMap.get(item.ingredientId);
      if (cost === undefined) {
        throw new NotFoundException(`Ingrediente con ID ${item.ingredientId} no encontrado.`);
      }
      totalCost += Number(cost) * item.quantity;
    }

    return totalCost;
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const { name, price, categoryId, recipeItems } = productData;

    const category = await this.categoriesRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
    }

    // --- LÓGICA MODIFICADA ---
    let cost = 0;
    if (productData.cost !== undefined && productData.cost !== null) {
      cost = productData.cost;
    } else {
      cost = await this.calculateRecipeCost(recipeItems || []);
    }

    const product = this.productsRepository.create({
      name,
      price,
      category,
      cost, // Guardar el costo final
    });

    const savedProduct = await this.productsRepository.save(product);

    if (recipeItems && recipeItems.length > 0) {
      const items = recipeItems.map(itemDto =>
        this.recipeItemsRepository.create({
          quantity: itemDto.quantity,
          product: savedProduct,
          ingredient: { id: itemDto.ingredientId },
        }),
      );
      await this.recipeItemsRepository.save(items);
    }

    const fullProduct = await this.productsRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'recipeItems', 'recipeItems.ingredient'],
    });

    if (!fullProduct) {
      throw new NotFoundException(`No se pudo encontrar el producto con ID ${savedProduct.id} después de crearlo.`);
    }
    return fullProduct;
  }

  async updateProduct(id: number, productData: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: {id},
      relations: ['recipeItems']
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (productData.name) product.name = productData.name;
    if (productData.price) product.price = productData.price;
    if (productData.categoryId) {
      const category = await this.categoriesRepository.findOneBy({ id: productData.categoryId });
      if (!category) throw new NotFoundException(`Categoría con ID ${productData.categoryId} no encontrada`);
      product.category = category;
    }

    if (productData.recipeItems !== undefined) {
      product.cost = await this.calculateRecipeCost(productData.recipeItems);

      if (product.recipeItems && product.recipeItems.length > 0) {
        await this.recipeItemsRepository.remove(product.recipeItems);
      }

      if (productData.recipeItems.length > 0) {
        const newItems = productData.recipeItems.map(itemDto =>
          this.recipeItemsRepository.create({
            quantity: itemDto.quantity,
            product: { id },
            ingredient: { id: itemDto.ingredientId },
          }),
        );
        await this.recipeItemsRepository.save(newItems);
      }
    }

    await this.productsRepository.save(product);

    const updatedProduct = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'recipeItems', 'recipeItems.ingredient']
    });

    if (!updatedProduct) {
      throw new NotFoundException(`No se pudo encontrar el producto con ID ${id} después de actualizarlo.`);
    }
    return updatedProduct;
  }

  // --- MÉTODO RESTAURADO ---
  findAllProducts(): Promise<Product[]> {
    return this.productsRepository.find({ relations: ['category', 'modifiers', 'recipeItems', 'recipeItems.ingredient'] });
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['recipeItems']
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    const salesCount = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('sale_item', 'sale_item', 'sale_item.productId = product.id')
      .where('product.id = :id', { id })
      .andWhere('sale_item.id IS NOT NULL')
      .getCount();

    if (salesCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el producto "${product.name}" porque tiene ventas registradas. ` +
        `Para mantener la integridad del historial de ventas, este producto no puede ser eliminado.`
      );
    }

    if (product.recipeItems && product.recipeItems.length > 0) {
      await this.recipeItemsRepository.remove(product.recipeItems);
    }

    await this.productsRepository.delete(id);
  }

  // --- MÉTODOS DE CATEGORÍAS Y MODIFICADORES RESTAURADOS ---
  findAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({ relations: ['products'] });
  }

  createCategory(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create(categoryData);
    return this.categoriesRepository.save(category);
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    await this.categoriesRepository.update(id, categoryData);
    const updatedCategory = await this.categoriesRepository.findOneBy({ id });
    if (!updatedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    const result = await this.categoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
  }

  findAllModifiers(): Promise<Modifier[]> {
    return this.modifiersRepository.find();
  }

  createModifier(modifierData: Partial<Modifier>): Promise<Modifier> {
    const modifier = this.modifiersRepository.create(modifierData);
    return this.modifiersRepository.save(modifier);
  }
}