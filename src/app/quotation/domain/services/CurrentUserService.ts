import { ValidateTokenResponse } from "@/src/app/user-auth/application/use-cases/login-user";

export interface CurrentUserService {
  getCurrentUser(): Promise<ValidateTokenResponse>;
}
