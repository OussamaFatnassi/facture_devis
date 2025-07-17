"use server";

import { CreateProductUseCase, CreateProductRequest, CreateProductResponse } from "../application/use-cases/create-product";
import { SearchProductsUseCase, SearchProductsRequest, SearchProductsResponse } from "../application/use-cases/search-products";
import { GetAllProductsUseCase, GetAllProductsRequest, GetAllProductsResponse } from "../application/use-cases/get-all-products";
import { PrismaProductRepository } from "../infrastructure/repositories/product-repository";
import { getCurrentUser } from "../../user-auth/actions/login-actions";

export async function createProduct(formData: FormData): Promise<CreateProductResponse> {
  try {
    // Get current user
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return {
        success: false,
        message: "User not authenticated",
        errors: ["User not authenticated"]
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    const request: CreateProductRequest = {
      name,
      description,
      price,
      userId: userResponse.user.id
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
    // Get current user
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return {
        success: false,
        products: [],
        total: 0,
        message: "User not authenticated",
        errors: ["User not authenticated"]
      };
    }

    const request: SearchProductsRequest = {
      query,
      userId: userResponse.user.id,
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
    // Get current user
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return {
        success: false,
        products: [],
        total: 0,
        message: "User not authenticated",
        errors: ["User not authenticated"]
      };
    }

    const request: GetAllProductsRequest = {
      userId: userResponse.user.id,
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