"use server";

import {
  LoginUserUseCase,
  LoginUserRequest,
  LoginUserResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from "../application/use-cases/login-user";
import { AuthService } from "../application/services/auth-service";
import { PrismaUserRepository } from "../infrastructure/repositories/user-repository";
import { cookies } from "next/headers";

export async function loginUser(
  formData: FormData
): Promise<LoginUserResponse> {
  try {
    // Extract form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Create request object
    const request: LoginUserRequest = {
      email,
      password,
    };

    // Initialize dependencies
    const userRepository = new PrismaUserRepository();
    const authService = new AuthService(userRepository);
    const loginUserUseCase = new LoginUserUseCase(authService);

    // Execute use case
    const response = await loginUserUseCase.execute(request);

    // If login successful, set cookie
    if (response.success && response.token) {
      const cookieStore = await cookies();
      cookieStore.set("auth-token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
      });
    }

    return response;
  } catch (error) {
    return {
      success: false,
      message: "Login failed due to server error",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function loginUserWithCredentials(
  email: string,
  password: string
): Promise<LoginUserResponse> {
  try {
    // Create request object
    const request: LoginUserRequest = {
      email,
      password,
    };

    // Initialize dependencies
    const userRepository = new PrismaUserRepository();
    const authService = new AuthService(userRepository);
    const loginUserUseCase = new LoginUserUseCase(authService);

    // Execute use case
    const response = await loginUserUseCase.execute(request);

    // If login successful, set cookie
    if (response.success && response.token) {
      const cookieStore = await cookies();
      cookieStore.set("auth-token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
      });
    }

    return response;
  } catch (error) {
    return {
      success: false,
      message: "Login failed due to server error",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function validateToken(
  token: string
): Promise<ValidateTokenResponse> {
  try {
    // Create request object
    const request: ValidateTokenRequest = {
      token,
    };

    // Initialize dependencies
    const userRepository = new PrismaUserRepository();
    const authService = new AuthService(userRepository);
    const loginUserUseCase = new LoginUserUseCase(authService);

    // Execute use case
    const response = await loginUserUseCase.validateToken(request);

    return response;
  } catch (error) {
    return {
      success: false,
      message: "Token validation failed due to server error",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Clear auth cookie
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");

    return {
      success: true,
      message: "Logout successful",
    };
  } catch {
    return {
      success: false,
      message: "Logout failed due to server error",
    };
  }
}

export async function getCurrentUser(): Promise<ValidateTokenResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
      };
    }

    return await validateToken(token);
  } catch (error) {
    return {
      success: false,
      message: "Failed to get current user",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
