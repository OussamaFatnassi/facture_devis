"use server";

import { CreateProductUseCase, CreateProductRequest, CreateProductResponse } from "../application/use-cases/create-product";
import { SearchProductsUseCase, SearchProductsRequest, SearchProductsResponse } from "../application/use-cases/search-products";
import { GetAllProductsUseCase, GetAllProductsRequest, GetAllProductsResponse } from "../application/use-cases/get-all-products";
import { PrismaProductRepository } from "../infrastructure/repositories/product-repository";

export async function createProduct(formData: FormData): Promise<CreateProductResponse> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    const request: CreateProductRequest = {
      name,
      description,
      price
    };

    const productRepository = new PrismaProductRepository();
    const createProductUseCase = new CreateProductUseCase(productRepository);

    return await createProductUseCase.execute(request);
  } catch (error) {
    return {
      success: false,
      message: "Failed to create product",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}

export async function searchProducts(query: string, limit?: number, offset?: number): Promise<SearchProductsResponse> {
  try {
    const request: SearchProductsRequest = {
      query,
      limit,
      offset
    };

    const productRepository = new PrismaProductRepository();
    const searchProductsUseCase = new SearchProductsUseCase(productRepository);

    return await searchProductsUseCase.execute(request);
  } catch (error) {
    return {
      success: false,
      products: [],
      total: 0,
      message: "Failed to search products",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}

export async function getAllProducts(limit?: number, offset?: number, activeOnly?: boolean): Promise<GetAllProductsResponse> {
  try {
    const request: GetAllProductsRequest = {
      limit,
      offset,
      activeOnly
    };

    const productRepository = new PrismaProductRepository();
    const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);

    return await getAllProductsUseCase.execute(request);
  } catch (error) {
    return {
      success: false,
      products: [],
      total: 0,
      message: "Failed to get products",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
} 