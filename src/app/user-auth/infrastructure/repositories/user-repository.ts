import {
  PrismaClient,
  UserRole as PrismaUserRole,
  User as PrismaUser,
} from "../../../../../generated/prisma/index";
import { User, UserRole } from "../../domain/User";
import { UserRepository } from "../../domain/UserRepository";

export class PrismaUserRepository implements UserRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const userData = {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: this.mapRoleToPrisma(user.role),
      isActive: user.isActive,
      updatedAt: new Date(),
    };

    const savedUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: userData,
      create: {
        id: user.id,
        ...userData,
      },
    });

    return this.mapToDomain(savedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return users.map((user: PrismaUser) => this.mapToDomain(user));
  }

  async findByRole(role: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: this.mapRoleToPrisma(role as UserRole) },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user: PrismaUser) => this.mapToDomain(user));
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }

  async updateProfile(
    id: string,
    firstName: string,
    lastName: string
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        updatedAt: new Date(),
      },
    });

    return this.mapToDomain(user);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return this.mapToDomain(user);
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    return this.mapToDomain(user);
  }

  // Private mapping methods
  private mapToDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: this.mapRoleFromPrisma(prismaUser.role),
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private mapRoleToPrisma(role: UserRole): PrismaUserRole {
    switch (role) {
      case UserRole.ADMIN:
        return PrismaUserRole.ADMIN;
      case UserRole.MANAGER:
        return PrismaUserRole.MANAGER;
      case UserRole.USER:
      default:
        return PrismaUserRole.USER;
    }
  }

  private mapRoleFromPrisma(role: PrismaUserRole): UserRole {
    switch (role) {
      case PrismaUserRole.ADMIN:
        return UserRole.ADMIN;
      case PrismaUserRole.MANAGER:
        return UserRole.MANAGER;
      case PrismaUserRole.USER:
      default:
        return UserRole.USER;
    }
  }
}
