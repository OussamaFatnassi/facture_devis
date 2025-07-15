/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, UserRole } from "./User";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class UserService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
  }

  /**
   * Creates a new user with hashed password
   */
  public async createUser(data: RegisterData): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    if (!this.isValidPassword(data.password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user with default role if not specified
    const userRole = data.role || UserRole.USER;

    return new User({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: userRole,
      isActive: true,
    });
  }

  /**
   * Authenticates a user and returns JWT token
   */
  public async authenticateUser(
    credentials: LoginCredentials,
    user: User
  ): Promise<AuthResult> {
    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is deactivated");
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Verifies JWT token and returns user payload
   */
  public verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Refreshes JWT token
   */
  public refreshToken(user: User): string {
    return this.generateToken(user);
  }

  /**
   * Validates user permissions for specific actions
   */
  public validatePermissions(user: User, requiredRole: UserRole): boolean {
    if (user.role === UserRole.ADMIN) {
      return true; // Admin has all permissions
    }

    if (requiredRole === UserRole.USER) {
      return true; // All authenticated users have basic permissions
    }

    return user.role === requiredRole;
  }

  /**
   * Checks if user can access specific resource
   */
  public canAccessResource(user: User, resourceOwnerId?: string): boolean {
    // Admin can access everything
    if (user.isAdmin()) {
      return true;
    }

    // If resource has owner, user must be the owner or have manager role
    if (resourceOwnerId) {
      return user.id === resourceOwnerId || user.canManageUsers();
    }

    return true;
  }

  // Private helper methods
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
      expiresIn: this.JWT_EXPIRES_IN as string,
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
