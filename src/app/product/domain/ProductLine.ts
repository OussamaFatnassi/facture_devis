export interface ProductLine {
  productId: string;
  productName: string;
  productDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateProductLineRequest {
  productId: string;
  quantity: number;
}

export class ProductLineService {
  static createProductLine(
    product: { id: string; name: string; description: string; price: number },
    quantity: number
  ): ProductLine {
    return {
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity
    };
  }

  static calculateTotal(productLines: ProductLine[]): number {
    return productLines.reduce((sum, line) => sum + line.totalPrice, 0);
  }

  static validateProductLine(productLine: ProductLine): string[] {
    const errors: string[] = [];

    if (!productLine.productId) {
      errors.push('Product ID is required');
    }

    if (!productLine.productName) {
      errors.push('Product name is required');
    }

    if (productLine.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (productLine.unitPrice < 0) {
      errors.push('Unit price cannot be negative');
    }

    return errors;
  }
} 