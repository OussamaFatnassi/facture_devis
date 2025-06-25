import { User, UserRole } from '../../domain/User';
import { UserService } from '../../domain/UserService';
import { UserRepository } from '../../domain/UserRepository';

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface SignupResponse {
  user: User;
  message: string;
}

export class SignupService {
  private userService: UserService;
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userService = new UserService();
    this.userRepository = userRepository;
  }

  async signup(request: SignupRequest): Promise<SignupResponse> {
    try {
      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(request.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Create user with domain service
      const user = await this.userService.createUser({
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName,
        role: request.role
      });

      // Save user to repository
      const savedUser = await this.userRepository.save(user);

      return {
        user: savedUser,
        message: 'User registered successfully'
      };
    } catch (error) {
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createAdminUser(request: SignupRequest): Promise<SignupResponse> {
    // Ensure admin role is set
    const adminRequest = {
      ...request,
      role: UserRole.ADMIN
    };

    return this.signup(adminRequest);
  }

  async createManagerUser(request: SignupRequest): Promise<SignupResponse> {
    // Ensure manager role is set
    const managerRequest = {
      ...request,
      role: UserRole.MANAGER
    };

    return this.signup(managerRequest);
  }
}
