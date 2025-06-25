import { User } from './User';

export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Save user (create or update)
   */
  save(user: User): Promise<User>;

  /**
   * Delete user by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find all users with optional pagination
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Find users by role
   */
  findByRole(role: string): Promise<User[]>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Update user profile
   */
  updateProfile(id: string, firstName: string, lastName: string): Promise<User>;

  /**
   * Update user password
   */
  updatePassword(id: string, hashedPassword: string): Promise<User>;

  /**
   * Activate/deactivate user
   */
  updateStatus(id: string, isActive: boolean): Promise<User>;
}
