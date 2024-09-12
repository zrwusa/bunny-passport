// src/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { CreateOAuthUserProfile } from '../types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(userData: RegisterDto): Promise<string> {
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

  async deleteUser(id: string): Promise<string> {
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
  async createOAuthUser(
    profile: CreateOAuthUserProfile,
    provider: string,
  ): Promise<User> {
    const { username, email, oauthId } = profile;
    const newUser = this.userRepository.create({
      username,
      email,
      oauthId,
      provider,
      createdAt: new Date(),
    });
    return this.userRepository.save(newUser);
  }

  async comparePasswords(
    inputPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  async sendEmailVerificationLink(newEmail: string): Promise<void> {
    console.log(`sending link to newEmail${newEmail}`);
    // TODO Implement email verification logic
  }
}
