import { ProductRepository } from '@infrastructure/repositories/ProductRepository';
import { CreateProductUseCase } from '@application/use-cases/product/CreateProductUseCase';
import { ShopRepository } from '@infrastructure/repositories/ShopRepository';

export class ProductController {
  private productRepository = new ProductRepository();
  private shopRepository = new ShopRepository();

  async create(data: any, vendorId: string) {
    const useCase = new CreateProductUseCase(this.productRepository, this.shopRepository);
    return await useCase.execute({ ...data, vendorId });
  }

  async list(filters?: any) {
    return await this.productRepository.list(filters);
  }

  async getById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getByShop(shopId: string) {
    return await this.productRepository.findByShopId(shopId);
  }

  async update(id: string, data: any, vendorId: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const shop = await this.shopRepository.findById(product.shopId);
    if (!shop || shop.ownerId !== vendorId) {
      throw new Error('Unauthorized to update this product');
    }

    return await this.productRepository.update(id, data);
  }

  async delete(id: string, vendorId: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const shop = await this.shopRepository.findById(product.shopId);
    if (!shop || shop.ownerId !== vendorId) {
      throw new Error('Unauthorized to delete this product');
    }

    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async search(query: string) {
    return await this.productRepository.search(query);
  }
}
