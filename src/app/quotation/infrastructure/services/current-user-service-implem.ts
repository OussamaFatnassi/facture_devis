import {
  CurrentUserService,
  CurrentUserFromQuotationDomain,
} from "@/src/app/quotation/domain/services/CurrentUserService";
import { getCurrentUser } from "@/src/app/user-auth/actions/login-actions";
import { ValidateTokenResponse } from "@/src/app/user-auth/application/use-cases/login-user";

export class CurrentUserServiceImpl implements CurrentUserService {
  async getCurrentUser(): Promise<CurrentUserFromQuotationDomain> {
    const user: ValidateTokenResponse = await getCurrentUser();
    if (!user.user) {
      throw new Error("User information is missing in token response.");
    }
    return {
      user: {
        id: user.user.id,
        email: user.user.email,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
      },
    };
  }
}
