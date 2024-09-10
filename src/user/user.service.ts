// src/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dot/user-create.dto';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly users = [];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(userData: UserCreateDto): Promise<string> {
    const errors = await validate(userData);
    if (errors.length > 0) {
      return 'Validation failed';
    }

    const existingUser = await this.userRepository.findOneBy({
      email: userData.email,
    });
    if (existingUser) {
      return 'Email already exists';
    }

    const user = new User();
    Object.assign(user, userData);
    user.password = await bcrypt.hash(userData.password, 10);

    await this.userRepository.save(user);
    return 'User created successfully';
  }

  async updateUser(id: number, userData: UserCreateDto): Promise<string> {
    const errors = await validate(userData);
    if (errors.length > 0) {
      return 'Validation failed';
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return 'User not found';
    }

    if (userData.username && userData.username !== user.username) {
      user.username = userData.username;
    }

    if (userData.password) {
      if (
        !userData.oldPassword ||
        !(await this.comparePasswords(userData.oldPassword, user.password))
      ) {
        return 'Original password is incorrect';
      }
      user.password = await bcrypt.hash(userData.password, 10);
    }

    if (userData.email && userData.email !== user.email) {
      if (
        !userData.password ||
        !(await this.comparePasswords(userData.password, user.password))
      ) {
        return 'Password is incorrect';
      }
      await this.sendEmailVerificationLink(userData.email);
      return 'Email verification sent';
    }

    await this.userRepository.save(user);
    return 'User updated successfully';
  }

  async deleteUser(id: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return 'User not found';
    }

    await this.userRepository.remove(user);
    return 'User deleted successfully';
  }

  // Find users based on username (for Local login)
  async findOneByUsername(email: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ email });
  }

  // Find users based on OAuth ID and provider (for Google, Github OAuth2 login)
  async findOneByOAuthProvider(
    oauthId: string,
    provider: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { oauthId, provider } });
  }

  // Create O Auth User (for creating new users when first logging in via Google or Github)
  async createOAuthUser(profile: any, provider: string): Promise<User> {
    const newUser = this.userRepository.create({
      username: profile.displayName || profile.username,
      email: profile.email,
      oauthId: profile.oauthid,
      provider,
      createdAt: new Date(),
    });
    return this.userRepository.save(newUser);
  }

  private async comparePasswords(
    inputPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  private async sendEmailVerificationLink(newEmail: string): Promise<void> {
    console.log(`sending link to newEmail${newEmail}`);
    // TODO Implement email verification logic
  }
}
