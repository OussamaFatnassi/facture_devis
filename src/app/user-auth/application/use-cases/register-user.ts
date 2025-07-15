import { UserRole } from "../../domain/User";
import {
  SignupService,
  SignupRequest,
  SignupResponse,
} from "../services/signup-service";

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
  };
  message: string;
  errors?: string[];
}

export class RegisterUserUseCase {
  private signupService: SignupService;

  constructor(signupService: SignupService) {
    this.signupService = signupService;
  }

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      // Validate input
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        };
      }

      // Execute signup
      const signupRequest: SignupRequest = {
        email: request.email.trim().toLowerCase(),
        password: request.password,
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        role: request.role,
      };

      const signupResponse: SignupResponse = await this.signupService.signup(
        signupRequest
      );

      return {
        success: true,
        user: {
          id: signupResponse.user.id,
          email: signupResponse.user.email,
          firstName: signupResponse.user.firstName,
          lastName: signupResponse.user.lastName,
          fullName: signupResponse.user.fullName,
          role: signupResponse.user.role,
        },
        message: signupResponse.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  private validateRequest(request: RegisterUserRequest): string[] {
    const errors: string[] = [];

    // Email validation
    if (!request.email || !request.email.trim()) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(request.email)) {
      errors.push("Invalid email format");
    }

    // Password validation
    if (!request.password) {
      errors.push("Password is required");
    } else if (request.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Name validation
    if (!request.firstName || !request.firstName.trim()) {
      errors.push("First name is required");
    }

    if (!request.lastName || !request.lastName.trim()) {
      errors.push("Last name is required");
    }

    // Role validation
    if (request.role && !Object.values(UserRole).includes(request.role)) {
      errors.push("Invalid role specified");
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
