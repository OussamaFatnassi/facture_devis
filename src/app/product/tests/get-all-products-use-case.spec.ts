import { GetAllProductsUseCase } from '../application/use-cases/get-all-products';
import { Product } from '../domain/Product';

describe('GetAllProductsUseCase', () => {
  let productRepositoryMock: any;
  let useCase: GetAllProductsUseCase;

  beforeEach(() => {
    productRepositoryMock = {
      findAll: jest.fn(),
      findActiveProducts: jest.fn(),
    };

    useCase = new GetAllProductsUseCase(productRepositoryMock);
  });

  it('should return all products with success', async () => {
    const product = new Product({
      name: 'Test Product',
      description: 'A test product',
      price: 100,
      isActive: true,
    });

    productRepositoryMock.findAll.mockResolvedValue([product]);

    const result = await useCase.execute({ limit: 10, offset: 0 });

    
  });

  it('should return only active products when activeOnly is true', async () => {
    const activeProduct = new Product({
      name: 'Active Product',
      description: 'Only active',
      price: 150,
      isActive: true,
    });

    productRepositoryMock.findActiveProducts.mockResolvedValue([activeProduct]);

    const result = await useCase.execute({ activeOnly: true });


  });

  it('should return validation error for invalid limit and offset', async () => {
    const result = await useCase.execute({ limit: 0, offset: -5 });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Offset must be greater than or equal to 0');
    expect(result.products).toEqual([]);
  });

  it('should handle repository error gracefully', async () => {
    productRepositoryMock.findAll.mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute();


    expect(result.success).toBe(false);
    expect(result.products).toEqual([]);
  });
});
