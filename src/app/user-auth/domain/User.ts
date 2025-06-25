export interface UserProps {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER'
}

export class User {
  private readonly _id: string;
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _role: UserRole;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id || this.generateId();
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._role = props.role;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get role(): UserRole {
    return this._role;
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
  public updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._updatedAt = new Date();
  }

  public changePassword(newPassword: string): void {
    this._password = newPassword;
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

  public hasRole(role: UserRole): boolean {
    return this._role === role;
  }

  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  public canManageUsers(): boolean {
    return this._role === UserRole.ADMIN || this._role === UserRole.MANAGER;
  }

  // Private methods
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Domain events could be added here
  public toJSON() {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      role: this._role,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
