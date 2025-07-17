import { Product } from './Product';

export interface ProductRepository {
  /**
   * Save product (create or update)
   */
  save(product: Product): Promise<Product>;

  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find product by name for a specific user
   */
  findByName(name: string, userId: string): Promise<Product | null>;

  /**
   * Find all products for a specific user with optional pagination
   */
  findByUser(userId: string, limit?: number, offset?: number): Promise<Product[]>;

  /**
   * Find active products only for a specific user
   */
  findActiveProductsByUser(userId: string): Promise<Product[]>;

  /**
   * Search products by name or description for a specific user
   */
  searchProductsByUser(query: string, userId: string): Promise<Product[]>;

  /**
   * Check if product exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete product by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find products by price range for a specific user
   */
  findByPriceRangeByUser(minPrice: number, maxPrice: number, userId: string): Promise<Product[]>;
} 