export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _price: number;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    this._id = props.id || this.generateId();
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public updateDetails(name: string, description: string, price: number): void {
    if (!name.trim()) {
      throw new Error("Product name cannot be empty");
    }
    if (price < 0) {
      throw new Error("Product price cannot be negative");
    }

    this._name = name.trim();
    this._description = description.trim();
    this._price = price;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public isValid(): boolean {
    return this._name.trim().length > 0 && this._price >= 0;
  }

  // Private methods
  private generateId(): string {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
} 