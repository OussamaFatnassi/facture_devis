import { CurrentUserService } from "@/src/app/quotation/domain/services/CurrentUserService";
import { getCurrentUser } from "@/src/app/user-auth/actions/login-actions";

export class CurrentUserServiceImpl implements CurrentUserService {
  async getCurrentUser() {
    return await getCurrentUser();
  }
}
