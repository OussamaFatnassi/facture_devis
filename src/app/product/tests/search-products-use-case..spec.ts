import { SearchProductsUseCase } from '../application/use-cases/search-products';
import { Product } from '../domain/Product';

describe('SearchProductsUseCase', () => {
  let productRepositoryMock: any;
  let useCase: SearchProductsUseCase;

  beforeEach(() => {
    productRepositoryMock = {
      searchProducts: jest.fn(),
    };

    useCase = new SearchProductsUseCase(productRepositoryMock);
  });

  it('should return matching products without pagination', async () => {
    const product1 = new Product({
      name: 'Test Product A',
      description: 'Description A',
      price: 50,
      isActive: true,
    });

    const product2 = new Product({
      name: 'Test Product B',
      description: 'Description B',
      price: 100,
      isActive: true,
    });

    productRepositoryMock.searchProducts.mockResolvedValue([product1, product2]);

    const result = await useCase.execute({ query: 'Test' });

   
  });

  it('should return paginated results', async () => {
    const products = Array.from({ length: 10 }, (_, i) => new Product({
      name: `Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: 10 + i,
      isActive: true,
    }));

    productRepositoryMock.searchProducts.mockResolvedValue(products);

    const result = await useCase.execute({
      query: 'Product',
      limit: 3,
      offset: 2,
    });

    
  });

  it('should fail validation with empty query', async () => {
    const result = await useCase.execute({ query: '   ' });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Search query is required');
  });

  it('should return validation errors for invalid limit/offset', async () => {
    const result = await useCase.execute({
      query: 'Test',
      limit: 0,
      offset: -1,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Offset must be greater than or equal to 0');
  });

  it('should handle repository error gracefully', async () => {
    productRepositoryMock.searchProducts.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute({ query: 'error' });

    expect(result.success).toBe(false);
    
  });
});
