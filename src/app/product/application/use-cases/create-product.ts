import { Product } from '../../domain/Product';
import { ProductRepository } from '../../domain/ProductRepository';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  userId: string;
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

export interface CreateProductResponse {
  success: boolean;
  product?: SerializedProduct;
  message: string;
  errors?: string[];
}

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    try {
      // Input validation
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Check if product with same name already exists for this user
      const existingProduct = await this.productRepository.findByName(request.name, request.userId);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product with this name already exists',
          errors: ['Product name must be unique']
        };
      }

      // Create product
      const product = new Product({
        name: request.name.trim(),
        description: request.description.trim(),
        price: request.price,
        isActive: true,
        userId: request.userId
      });

      // Validate product
      if (!product.isValid()) {
        return {
          success: false,
          message: 'Product validation failed',
          errors: ['Product is not valid']
        };
      }

      // Save product
      const savedProduct = await this.productRepository.save(product);

      // Serialize the product to plain object
      const serializedProduct: SerializedProduct = {
        id: savedProduct.id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: savedProduct.price,
        isActive: savedProduct.isActive,
        createdAt: savedProduct.createdAt,
        updatedAt: savedProduct.updatedAt
      };

      return {
        success: true,
        product: serializedProduct,
        message: 'Product created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Product creation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: CreateProductRequest): string[] {
    const errors: string[] = [];

    if (!request.name || !request.name.trim()) {
      errors.push('Product name is required');
    }

    if (!request.description || !request.description.trim()) {
      errors.push('Product description is required');
    }

    if (request.price < 0) {
      errors.push('Product price cannot be negative');
    }

    if (request.price === 0) {
      errors.push('Product price cannot be zero');
    }

    return errors;
  }
} 