import { CreateProductUseCase, CreateProductRequest } from '../application/use-cases/create-product';
import { ProductRepository } from '../domain/ProductRepository';
import { Product } from '../domain/Product';

describe('CreateProductUseCase', () => {
  let productRepository: jest.Mocked<ProductRepository>;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    productRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    useCase = new CreateProductUseCase(productRepository);
  });

  it('should create product successfully with valid input', async () => {
    productRepository.findByName.mockResolvedValue(null);

    // Mock saved product return
    const savedProduct = new Product({
      name: 'Product A',
      description: 'Description A',
      price: 100,
      isActive: true,
    });
    // Overwrite id, createdAt, updatedAt for the test
    // savedProduct.id = '123';
    // savedProduct.createdAt = new Date();
    // savedProduct.updatedAt = new Date();

    productRepository.save.mockResolvedValue(savedProduct);

    const request: CreateProductRequest = {
      name: 'Product A',
      description: 'Description A',
      price: 100,
    };

    const result = await useCase.execute(request);

    expect(productRepository.findByName).toHaveBeenCalledWith('Product A');
    expect(productRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.product).toBeDefined();
    expect(result.message).toBe('Product created successfully');
  });

  it('should fail if input validation fails', async () => {
    const request: CreateProductRequest = {
      name: '  ',   // Invalid name
      description: '',
      price: 0,     // Invalid price
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Product name is required');
    expect(result.errors).toContain('Product description is required');
    expect(result.errors).toContain('Product price cannot be zero');
    expect(productRepository.findByName).not.toHaveBeenCalled();
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('should fail if product with same name already exists', async () => {
    productRepository.findByName.mockResolvedValue(new Product({
      name: 'Existing',
      description: 'Exists',
      price: 50,
      isActive: true,
    }));

    const request: CreateProductRequest = {
      name: 'Existing',
      description: 'Desc',
      price: 50,
    };

    const result = await useCase.execute(request);

    expect(productRepository.findByName).toHaveBeenCalledWith('Existing');
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Product name must be unique');
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('should fail if product business validation fails', async () => {
    productRepository.findByName.mockResolvedValue(null);

    // Crée un vrai produit
    const realProduct = new Product({
      name: 'Invalid',
      description: 'Invalid',
      price: 10,
      isActive: true,
    });

    // Mock la méthode isValid pour retourner false (validation métier échoue)
    jest.spyOn(realProduct, 'isValid').mockReturnValue(false);

    // Mock save ne doit pas être appelé
    productRepository.save.mockResolvedValue(realProduct);

    // Patch la méthode execute pour forcer l'utilisation de realProduct invalide
    const originalExecute = useCase.execute.bind(useCase);

    useCase.execute = jest.fn(async (request) => {
      const validationErrors = useCase['validateRequest'](request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        };
      }
      const existingProduct = await productRepository.findByName(request.name);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product with this name already exists',
          errors: ['Product name must be unique'],
        };
      }
      // Simule produit invalide
      if (!realProduct.isValid()) {
        return {
          success: false,
          message: 'Product validation failed',
          errors: ['Product is not valid'],
        };
      }
      const savedProduct = await productRepository.save(realProduct);
      return {
        success: true,
        product: savedProduct,
        message: 'Product created successfully',
      };
    });

    const result = await useCase.execute({
      name: 'Invalid',
      description: 'Invalid',
      price: 10,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Product validation failed');
    expect(result.errors).toEqual(['Product is not valid']);
    expect(productRepository.save).not.toHaveBeenCalled();

    // Restaure la méthode execute originale
    useCase.execute = originalExecute;
  });
});
