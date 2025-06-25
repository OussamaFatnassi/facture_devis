import { User } from '../../domain/User';
import { UserService, LoginCredentials, AuthResult, JwtPayload } from '../../domain/UserService';
import { UserRepository } from '../../domain/UserRepository';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  isValid: boolean;
  user?: User;
  payload?: JwtPayload;
  message: string;
}

export interface RefreshTokenRequest {
  userId: string;
}

export interface RefreshTokenResponse {
  token: string;
  message: string;
}

export class AuthService {
  private readonly userService: UserService;
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userService = new UserService();
    this.userRepository = userRepository;
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Authenticate user with domain service
      const credentials: LoginCredentials = {
        email: request.email,
        password: request.password
      };

      const authResult: AuthResult = await this.userService.authenticateUser(credentials, user);

      return {
        user: authResult.user,
        token: authResult.token,
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateToken(request: TokenValidationRequest): Promise<TokenValidationResponse> {
    try {
      // Verify token with domain service
      const payload = this.userService.verifyToken(request.token);

      // Find user by ID from token
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        return {
          isValid: false,
          message: 'User not found'
        };
      }

      // Check if user is still active
      if (!user.isActive) {
        return {
          isValid: false,
          message: 'User account is deactivated'
        };
      }

      return {
        isValid: true,
        user,
        payload,
        message: 'Token is valid'
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      // Find user by ID
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      // Generate new token with domain service
      const token = this.userService.refreshToken(user);

      return {
        token,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<{ message: string }> {
    return {
      message: 'Logout successful'
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.userService['verifyPassword'](currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.userService['hashPassword'](newPassword);

      // Update password in repository
      await this.userRepository.updatePassword(userId, hashedNewPassword);

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw new Error(`Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 