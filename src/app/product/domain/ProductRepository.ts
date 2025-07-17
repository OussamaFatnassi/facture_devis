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
   * Find product by name
   */
  findByName(name: string): Promise<Product | null>;

  /**
   * Find all products with optional pagination
   */
  findAll(limit?: number, offset?: number): Promise<Product[]>;

  /**
   * Find active products only
   */
  findActiveProducts(): Promise<Product[]>;

  /**
   * Search products by name or description
   */
  searchProducts(query: string): Promise<Product[]>;

  /**
   * Check if product exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete product by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find products by price range
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
} 