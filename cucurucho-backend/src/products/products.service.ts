// Ruta: cucurucho-web/cucurucho-backend/src/products/products.service.ts
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

    async createProduct(productData: CreateProductDto): Promise<Product> {
        const { name, price, categoryId, recipeItems } = productData;

        const category = await this.categoriesRepository.findOneBy({ id: categoryId });
        if (!category) {
            throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
        }

        const product = this.productsRepository.create({
            name,
            price,
            category,
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
            throw new NotFoundException(`Error al recuperar el producto recién creado con ID ${savedProduct.id}`);
        }

        return fullProduct;
    }

    async updateProduct(id: number, productData: Partial<CreateProductDto>): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: {id}, relations: ['recipeItems']});
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

        if (productData.recipeItems) {
            if (product.recipeItems && product.recipeItems.length > 0) {
                await this.recipeItemsRepository.remove(product.recipeItems);
            }

            const items = productData.recipeItems.map(itemDto =>
                this.recipeItemsRepository.create({
                    quantity: itemDto.quantity,
                    product: { id },
                    ingredient: { id: itemDto.ingredientId },
                }),
            );
            await this.recipeItemsRepository.save(items);
        }

        await this.productsRepository.save(product);

        // --- CORRECCIÓN ---
        const updatedProduct = await this.productsRepository.findOne({ where: { id }, relations: ['category', 'recipeItems', 'recipeItems.ingredient'] });
        if (!updatedProduct) {
            // Esto sería muy raro, pero es bueno manejarlo
            throw new NotFoundException(`No se pudo encontrar el producto con ID ${id} después de actualizarlo.`);
        }
        return updatedProduct;
    }

    async deleteProduct(id: number): Promise<void> {
        const result = await this.productsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
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

