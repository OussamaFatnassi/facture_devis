import { LoginUserUseCase } from "../application/use-cases/login-user";

describe("LoginUserUseCase", () => {
  let authServiceMock: any;
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn(),
      validateToken: jest.fn(),
    };
    useCase = new LoginUserUseCase(authServiceMock);
  });

  describe("execute (login)", () => {
    it("should return success with user and token on valid login", async () => {
      const mockResponse = {
        user: {
          id: "user1",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          fullName: "John Doe",
          role: "admin",
        },
        token: "jwt.token.here",
        message: "Login successful",
      };

      authServiceMock.login.mockResolvedValue(mockResponse);

      const result = await useCase.execute({
        email: "TEST@example.com",
        password: "password123",
      });

      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: "test@example.com", // lowercase trimmed email
        password: "password123",
      });
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockResponse.user);
      expect(result.token).toBe(mockResponse.token);
      expect(result.message).toBe("Login successful");
    });

    it("should return validation errors for missing email and password", async () => {
      const result = await useCase.execute({ email: " ", password: "" });
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Email is required");
      expect(result.errors).toContain("Password is required");
      expect(result.message).toBe("Validation failed");
    });

    it("should return validation error for invalid email format", async () => {
      const result = await useCase.execute({ email: "invalid-email", password: "pwd" });
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Invalid email format");
      expect(result.message).toBe("Validation failed");
    });

    it("should handle authService.login errors gracefully", async () => {
      authServiceMock.login.mockRejectedValue(new Error("Auth service error"));

      const result = await useCase.execute({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Auth service error");
      expect(result.errors).toContain("Auth service error");
    });
  });

  describe("validateToken", () => {
    it("should return success with user when token is valid", async () => {
      const mockTokenResponse = {
        isValid: true,
        user: {
          id: "user1",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          fullName: "John Doe",
          role: "user",
        },
        message: "Token valid",
      };

      authServiceMock.validateToken.mockResolvedValue(mockTokenResponse);

      const result = await useCase.validateToken({ token: "valid.token" });

      expect(authServiceMock.validateToken).toHaveBeenCalledWith({ token: "valid.token" });
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockTokenResponse.user);
      expect(result.message).toBe("Token valid");
    });

    it("should return failure when token is invalid", async () => {
      const mockTokenResponse = {
        isValid: false,
        message: "Invalid token",
      };

      authServiceMock.validateToken.mockResolvedValue(mockTokenResponse);

      const result = await useCase.validateToken({ token: "invalid.token" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid token");
      expect(result.errors).toContain("Invalid token");
    });

    it("should return validation error for missing token", async () => {
      const result = await useCase.validateToken({ token: " " });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Token is required");
      expect(result.errors).toContain("Token is required");
    });

    it("should handle errors thrown by authService.validateToken", async () => {
      authServiceMock.validateToken.mockRejectedValue(new Error("Validation error"));

      const result = await useCase.validateToken({ token: "some.token" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation error");
      expect(result.errors).toContain("Validation error");
    });
  });
});
