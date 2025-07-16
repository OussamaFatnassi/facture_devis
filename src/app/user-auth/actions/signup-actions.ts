"use server";

import {
  RegisterUserUseCase,
  RegisterUserRequest,
  RegisterUserResponse,
} from "../application/use-cases/register-user";
import { SignupService } from "../application/services/signup-service";
import { PrismaUserRepository } from "../infrastructure/repositories/user-repository";
import { UserRole } from "../domain/User";

export async function registerUser(
  formData: FormData
): Promise<RegisterUserResponse> {
  try {
    // Extract form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as string;

    // Create request object
    const request: RegisterUserRequest = {
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole | undefined,
    };

    // Initialize dependencies
    const userRepository = new PrismaUserRepository();
    const signupService = new SignupService(userRepository);
    const registerUserUseCase = new RegisterUserUseCase(signupService);

    // Execute use case
    const response = await registerUserUseCase.execute(request);

    return response;
  } catch (error) {
    return {
      success: false,
      message: "Registration failed due to server error",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function registerUserWithRole(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role?: string
): Promise<RegisterUserResponse> {
  try {
    // Create request object
    const request: RegisterUserRequest = {
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole | undefined,
    };

    // Initialize dependencies
    const userRepository = new PrismaUserRepository();
    const signupService = new SignupService(userRepository);
    const registerUserUseCase = new RegisterUserUseCase(signupService);

    // Execute use case
    const response = await registerUserUseCase.execute(request);

    return response;
  } catch (error) {
    return {
      success: false,
      message: "Registration failed due to server error",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
