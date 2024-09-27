// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateOAuthUserProfile, ServiceResponse } from '../types';
import { createServiceResponseHandlers } from '../common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAllUsers(): Promise<ServiceResponse<'findAllUsers', User[]>> {
    const allUsers = await this.userRepository.find();
    const { buildSuccessResponse } =
      createServiceResponseHandlers('findAllUsers');
    return buildSuccessResponse('FIND_USERS_SUCCESSFULLY', allUsers);
  }

  async createUser(
    registerData: RegisterDto,
  ): Promise<ServiceResponse<'createUser', User>> {
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

  async deleteUser(id: string): Promise<ServiceResponse<'deleteUser', User>> {
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
  async findOneByUsername(
    email: string,
  ): Promise<ServiceResponse<'findOneByUsername', User>> {
    const { buildSuccessResponse } =
      createServiceResponseHandlers('findOneByUsername');
    const user = await this.userRepository.findOneBy({ email });
    return buildSuccessResponse('FIND_ONE_BY_USERNAME_SUCCESSFULLY', user);
  }

  // Find users based on OAuth ID and provider (for Google, Github OAuth2 login)
  async findOneByOAuthProvider(
    oauthId: string,
    provider: string,
  ): Promise<ServiceResponse<'findOneByOAuthProvider', User>> {
    const { buildSuccessResponse, buildFailureResponse } =
      createServiceResponseHandlers('findOneByOAuthProvider');

    const user = await this.userRepository.findOne({
      where: { oauthId, provider },
    });

    if (!user) {
      return buildFailureResponse('FIND_ONE_USER_FAILED');
    }

    return buildSuccessResponse('FIND_ONE_USER_SUCCESSFULLY', user);
  }

  // Create O Auth User (for creating new users when first logging in via Google or Github)
  async createOAuthUser(
    profile: CreateOAuthUserProfile,
    provider: string,
  ): Promise<ServiceResponse<'createOAuthUser', User>> {
    const { username, email, oauthId } = profile;
    const newUser = this.userRepository.create({
      username,
      email,
      oauthId,
      provider,
      createdAt: new Date(),
    });
    const user = await this.userRepository.save(newUser);
    const { buildSuccessResponse, buildFailureResponse } =
      createServiceResponseHandlers('createOAuthUser');
    if (!user) return buildFailureResponse('CREATE_OAUTH_USER_FAILED');

    return buildSuccessResponse('CREATE_OAUTH_USER_SUCCESSFULLY', user);
  }

  async comparePasswords(
    inputPassword: string,
    storedPassword: string,
  ): Promise<ServiceResponse<'comparePasswords'>> {
    const result = bcrypt.compare(inputPassword, storedPassword);
    const { buildSuccessResponse, buildFailureResponse } =
      createServiceResponseHandlers('comparePasswords');
    if (!result) return buildFailureResponse('PASSWORDS_DIFFERENT');
    return buildSuccessResponse('PASSWORDS_EQUAL');
  }

  async sendEmailVerificationLink(newEmail: string): Promise<void> {
    console.log(`sending link to newEmail${newEmail}`);
    // TODO Implement email verification logic
  }
}
