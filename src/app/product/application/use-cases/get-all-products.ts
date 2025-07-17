import { Product } from '../../domain/Product';
import { ProductRepository } from '../../domain/ProductRepository';

export interface GetAllProductsRequest {
  userId: string;
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
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

export interface GetAllProductsResponse {
  success: boolean;
  products: SerializedProduct[];
  total: number;
  message: string;
  errors?: string[];
}

export class GetAllProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: GetAllProductsRequest): Promise<GetAllProductsResponse> {
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

      // Get products based on filters
      let products: Product[];
      if (request.activeOnly) {
        products = await this.productRepository.findActiveProductsByUser(request.userId);
      } else {
        products = await this.productRepository.findByUser(request.userId, request.limit, request.offset);
      }

      // Serialize products to plain objects
      const serializedProducts: SerializedProduct[] = products.map(product => ({
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
        total: serializedProducts.length,
        message: `Found ${serializedProducts.length} products`
      };

    } catch (error) {
      return {
        success: false,
        products: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Failed to get products',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: GetAllProductsRequest): string[] {
    const errors: string[] = [];

    if (request.limit && request.limit < 1) {
      errors.push('Limit must be greater than 0');
    }

    if (request.offset && request.offset < 0) {
      errors.push('Offset must be greater than or equal to 0');
    }

    return errors;
  }
} 