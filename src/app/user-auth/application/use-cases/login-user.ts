import { AuthService, LoginRequest, LoginResponse, TokenValidationRequest, TokenValidationResponse } from '../services/auth-service';

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
  };
  token?: string;
  message: string;
  errors?: string[];
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
  };
  message: string;
  errors?: string[];
}

export class LoginUserUseCase {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    try {
      // Validate input
      const validationErrors = this.validateLoginRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Execute login
      const loginRequest: LoginRequest = {
        email: request.email.trim().toLowerCase(),
        password: request.password
      };

      const loginResponse: LoginResponse = await this.authService.login(loginRequest);

      return {
        success: true,
        user: {
          id: loginResponse.user.id,
          email: loginResponse.user.email,
          firstName: loginResponse.user.firstName,
          lastName: loginResponse.user.lastName,
          fullName: loginResponse.user.fullName,
          role: loginResponse.user.role
        },
        token: loginResponse.token,
        message: loginResponse.message
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      // Validate input
      if (!request.token || !request.token.trim()) {
        return {
          success: false,
          message: 'Token is required',
          errors: ['Token is required']
        };
      }

      // Execute token validation
      const tokenRequest: TokenValidationRequest = {
        token: request.token.trim()
      };

      const tokenResponse: TokenValidationResponse = await this.authService.validateToken(tokenRequest);

      if (!tokenResponse.isValid) {
        return {
          success: false,
          message: tokenResponse.message,
          errors: [tokenResponse.message]
        };
      }

      return {
        success: true,
        user: tokenResponse.user ? {
          id: tokenResponse.user.id,
          email: tokenResponse.user.email,
          firstName: tokenResponse.user.firstName,
          lastName: tokenResponse.user.lastName,
          fullName: tokenResponse.user.fullName,
          role: tokenResponse.user.role
        } : undefined,
        message: tokenResponse.message
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateLoginRequest(request: LoginUserRequest): string[] {
    const errors: string[] = [];

    // Email validation
    if (!request.email || !request.email.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(request.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!request.password) {
      errors.push('Password is required');
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 