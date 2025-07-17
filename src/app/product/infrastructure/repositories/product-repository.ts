import { PrismaClient } from "../../../../../generated/prisma/index";
import { Product } from "../../domain/Product";
import { ProductRepository } from "../../domain/ProductRepository";

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
      userId: product.userId,
      updatedAt: new Date(),
    };

    const result = await this.prisma.product.upsert({
      where: { id: product.id },
      create: productData,
      update: productData,
    });

    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.prisma.product.findUnique({
      where: { id },
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByName(name: string, userId: string): Promise<Product | null> {
    const result = await this.prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        userId,
      },
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByUser(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return results.map((result) => this.mapToDomain(result));
  }

  async findActiveProductsByUser(userId: string): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        isActive: true,
        userId,
      },
      orderBy: { name: "asc" },
    });

    return results.map((result) => this.mapToDomain(result));
  }

  async searchProductsByUser(
    query: string,
    userId: string
  ): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { userId },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      orderBy: { name: "asc" },
    });

    return results.map((result) => this.mapToDomain(result));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.prisma.product.findUnique({
      where: { id },
    });
    return result !== null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByPriceRangeByUser(
    minPrice: number,
    maxPrice: number,
    userId: string
  ): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { userId },
          { price: { gte: minPrice } },
          { price: { lte: maxPrice } },
        ],
      },
      orderBy: { price: "asc" },
    });

    return results.map((result) => this.mapToDomain(result));
  }

  private mapToDomain(prismaProduct: any): Product {
    return new Product({
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: prismaProduct.price,
      isActive: prismaProduct.isActive,
      userId: prismaProduct.userId,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }
}
