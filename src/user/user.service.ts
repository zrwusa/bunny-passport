// src/user.helpers.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateOAuthUserProfile } from '../types';
import { ServiceResponse } from '../interfaces';
import { serviceProtocolResFactory } from '../common';

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

  async createUser(registerData: RegisterDto): Promise<ServiceResponse<User>> {
    const { email, password } = registerData;
    const existingUser = await this.userRepository.findOneBy({ email });

    const { createFailedRes, createSuccessRes } =
      serviceProtocolResFactory('createUser');

    if (existingUser) return createFailedRes('EMAIL_ALREADY_EXISTS');

    const user = new User();
    Object.assign(user, registerData);
    user.password = await bcrypt.hash(password, 10);

    const savedUser = await this.userRepository.save(user);
    return createSuccessRes('USER_CREATED_SUCCESSFULLY', savedUser);
  }

  async deleteUser(id: string): Promise<ServiceResponse<User>> {
    const { createFailedRes, createSuccessRes } =
      serviceProtocolResFactory('deleteUser');
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return createFailedRes('USER_NOT_FOUND');
    }

    const deletedUser = await this.userRepository.remove(user);
    return createSuccessRes('USER_DELETED_SUCCESSFULLY', deletedUser);
  }

  // Find users based on username (for Local login)
  async findOneByUsername(email: string): Promise<ServiceResponse<User>> {
    const { createSuccessRes } = serviceProtocolResFactory('findOneByUsername');
    const user = await this.userRepository.findOneBy({ email });
    return createSuccessRes('FIND_ONE_BY_USERNAME_SUCCESSFULLY', user);
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
