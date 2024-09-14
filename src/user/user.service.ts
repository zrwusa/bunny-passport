// src/user.helpers.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateOAuthUserProfile } from '../types';
import { createServiceResponseHandlers } from '../common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAllUsers() {
    const allUsers = await this.userRepository.find();
    const { buildSuccessResponse } =
      createServiceResponseHandlers('findAllUsers');
    return buildSuccessResponse('FIND_USERS_SUCCESSFULLY', allUsers);
  }

  async createUser(registerData: RegisterDto) {
    const { email, password } = registerData;
    const existingUser = await this.userRepository.findOneBy({ email });

    const { buildFailureResponse, buildSuccessResponse } =
      createServiceResponseHandlers('createUser');

    if (existingUser) return buildFailureResponse('EMAIL_ALREADY_EXISTS');

    const user = new User();
    Object.assign(user, registerData);
    user.password = await bcrypt.hash(password, 10);

    const savedUser = await this.userRepository.save(user);
    return buildSuccessResponse('USER_CREATED_SUCCESSFULLY', savedUser);
  }

  async deleteUser(id: string) {
    const { buildFailureResponse, buildSuccessResponse } =
      createServiceResponseHandlers('deleteUser');
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return buildFailureResponse('USER_NOT_FOUND');
    }

    const deletedUser = await this.userRepository.remove(user);
    return buildSuccessResponse('USER_DELETED_SUCCESSFULLY', deletedUser);
  }

  // Find users based on username (for Local login)
  async findOneByUsername(email: string) {
    const { buildSuccessResponse } =
      createServiceResponseHandlers('findOneByUsername');
    const user = await this.userRepository.findOneBy({ email });
    return buildSuccessResponse('FIND_ONE_BY_USERNAME_SUCCESSFULLY', user);
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
