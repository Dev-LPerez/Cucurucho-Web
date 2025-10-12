// Ruta: cucurucho-web/cucurucho-backend/src/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
        const product = await this.productsRepository.findOne({
            where: {id},
            relations: ['recipeItems', 'recipeItems.ingredient']
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

        // Manejo de recipeItems - actualizar si está presente, incluso si es un array vacío
        if (productData.recipeItems !== undefined) {
            // Eliminar TODOS los items existentes usando delete para asegurar la eliminación
            if (product.recipeItems && product.recipeItems.length > 0) {
                const recipeItemIds = product.recipeItems.map(item => item.id);
                await this.recipeItemsRepository.delete(recipeItemIds);
            }

            // Limpiar la relación en el producto
            product.recipeItems = [];
            await this.productsRepository.save(product);

            // Solo crear nuevos items si hay alguno
            if (productData.recipeItems.length > 0) {
                const items = productData.recipeItems.map(itemDto =>
                    this.recipeItemsRepository.create({
                        quantity: itemDto.quantity,
                        product: { id },
                        ingredient: { id: itemDto.ingredientId },
                    }),
                );
                await this.recipeItemsRepository.save(items);
            }
        } else {
            // Si no se envió recipeItems, solo guardar los cambios del producto
            await this.productsRepository.save(product);
        }

        // Recargar el producto con todas sus relaciones actualizadas
        const updatedProduct = await this.productsRepository.findOne({
            where: { id },
            relations: ['category', 'recipeItems', 'recipeItems.ingredient']
        });

        if (!updatedProduct) {
            throw new NotFoundException(`No se pudo encontrar el producto con ID ${id} después de actualizarlo.`);
        }

        return updatedProduct;
    }

    async deleteProduct(id: number): Promise<void> {
        // Primero buscar el producto con sus relaciones
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['recipeItems']
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }

        // Verificar si el producto tiene ventas asociadas
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

        // Eliminar los recipeItems relacionados primero
        if (product.recipeItems && product.recipeItems.length > 0) {
            const recipeItemIds = product.recipeItems.map(item => item.id);
            await this.recipeItemsRepository.delete(recipeItemIds);
        }

        // Ahora eliminar el producto
        await this.productsRepository.delete(id);
    }

    // --- Métodos para Categorías ---
    findAllCategories(): Promise<Category[]> {
        return this.categoriesRepository.find({ relations: ['products'] });
    }

    createCategory(categoryData: Partial<Category>): Promise<Category> {
        const category = this.categoriesRepository.create(categoryData);
        return this.categoriesRepository.save(category);
    }

    async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
        const category = await this.categoriesRepository.findOneBy({ id });
        if (!category) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
        Object.assign(category, categoryData);
        return this.categoriesRepository.save(category);
    }

    async deleteCategory(id: number): Promise<void> {
        const result = await this.categoriesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
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
