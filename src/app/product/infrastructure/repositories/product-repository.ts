import { PrismaClient } from '../../../../../generated/prisma/index';
import { Product } from '../../domain/Product';
import { ProductRepository } from '../../domain/ProductRepository';

export class PrismaProductRepository implements ProductRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async save(product: Product): Promise<Product> {
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      isActive: product.isActive,
      updatedAt: new Date()
    };

    const result = await this.prisma.product.upsert({
      where: { id: product.id },
      create: productData,
      update: productData
    });

    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.prisma.product.findUnique({
      where: { id }
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const result = await this.prisma.product.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findAll(limit?: number, offset?: number): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async findActiveProducts(): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.prisma.product.findUnique({
      where: { id }
    });
    return result !== null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id }
    });
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { price: { gte: minPrice } },
          { price: { lte: maxPrice } }
        ]
      },
      orderBy: { price: 'asc' }
    });

    return results.map(result => this.mapToDomain(result));
  }

  private mapToDomain(prismaProduct: any): Product {
    return new Product({
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: prismaProduct.price,
      isActive: prismaProduct.isActive,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt
    });
  }
} 