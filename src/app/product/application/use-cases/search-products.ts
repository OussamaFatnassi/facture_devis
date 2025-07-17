import { ProductRepository } from '../../domain/ProductRepository';

export interface SearchProductsRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SerializedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchProductsResponse {
  success: boolean;
  products: SerializedProduct[];
  total: number;
  message: string;
  errors?: string[];
}

export class SearchProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: SearchProductsRequest): Promise<SearchProductsResponse> {
    try {
      // Input validation
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          products: [],
          total: 0,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Search products
      const products = await this.productRepository.searchProducts(request.query);
      
      // Apply pagination if specified
      let paginatedProducts = products;
      if (request.limit || request.offset) {
        const start = request.offset || 0;
        const end = request.limit ? start + request.limit : products.length;
        paginatedProducts = products.slice(start, end);
      }

      // Serialize products to plain objects
      const serializedProducts: SerializedProduct[] = paginatedProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return {
        success: true,
        products: serializedProducts,
        total: products.length,
        message: `Found ${products.length} products`
      };

    } catch (error) {
      return {
        success: false,
        products: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Search failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: SearchProductsRequest): string[] {
    const errors: string[] = [];

    if (!request.query || !request.query.trim()) {
      errors.push('Search query is required');
    }

    if (request.query.trim().length < 2) {
      errors.push('Search query must be at least 2 characters long');
    }

    if (request.limit && request.limit < 1) {
      errors.push('Limit must be greater than 0');
    }

    if (request.offset && request.offset < 0) {
      errors.push('Offset must be greater than or equal to 0');
    }

    return errors;
  }
} 