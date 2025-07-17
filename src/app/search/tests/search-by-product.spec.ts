import { byProductController } from '../infrastructure/controllers/by-product-controller'; 

import { PrismaQuotationRepository } from '../../quotation/infrastructure/repositories/quotation-repository';
import { PrismaInvoiceRepository } from '../../invoice/infrastructure/repositories/invoice-repository';
import { searchByProduct } from './../application/SearchByProduct'

jest.mock('./../application/SearchByProduct');
jest.mock('../../quotation/infrastructure/repositories/quotation-repository');
jest.mock('../../invoice/infrastructure/repositories/invoice-repository');

describe('byProductController', () => {
  const mockProductName = 'Test Product';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call searchByProduct with correct arguments and return the result', async () => {
    const mockResult = [{ id: 'q1', type: 'quotation' }];
    (searchByProduct as jest.Mock).mockResolvedValue(mockResult);

    const result = await byProductController(mockProductName, mockUserId);

    expect(searchByProduct).toHaveBeenCalledWith(
      mockProductName,
      mockUserId,
      expect.any(PrismaQuotationRepository),
      expect.any(PrismaInvoiceRepository)
    );
    expect(result).toBe(mockResult);
  });

  it('should throw if searchByProduct throws', async () => {
    (searchByProduct as jest.Mock).mockRejectedValue(new Error('Something failed'));

    await expect(byProductController(mockProductName, mockUserId)).rejects.toThrow('Something failed');
  });
});
