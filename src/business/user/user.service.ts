// src/user/user.service-response.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateOAuthUserProfile } from '../../types';
import { serviceResponseCreator } from '../../common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAllUsers() {
    const allUsers = await this.userRepository.find();
    const { buildSuccess } =
      serviceResponseCreator.createBuilders('findAllUsers');
    return buildSuccess('FIND_USERS_SUCCESSFULLY', allUsers);
  }

  async createUser(registerData: RegisterDto) {
    const { email, password } = registerData;
    const existingUser = await this.userRepository.findOneBy({ email });

    const { buildFailure, buildSuccess } =
      serviceResponseCreator.createBuilders('createUser');

    if (existingUser) return buildFailure('EMAIL_ALREADY_EXISTS');

    const user = new User();
    Object.assign(user, registerData);
    user.password = await bcrypt.hash(password, 10);

    const savedUser = await this.userRepository.save(user);
    return buildSuccess('USER_CREATED_SUCCESSFULLY', savedUser);
  }

  async deleteUser(id: string) {
    const { buildFailure, buildSuccess } =
      serviceResponseCreator.createBuilders('deleteUser');
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return buildFailure('USER_NOT_FOUND');
    }

    const deletedUser = await this.userRepository.remove(user);
    return buildSuccess('USER_DELETED_SUCCESSFULLY', deletedUser);
  }

  // Find users based on username (for Local login)
  async findOneByUsername(email: string) {
    const { buildSuccess } =
      serviceResponseCreator.createBuilders('findOneByUsername');
    const user = await this.userRepository.findOneBy({ email });
    return buildSuccess('FIND_ONE_BY_USERNAME_SUCCESSFULLY', user);
  }

  // Find users based on OAuth ID and provider (for Google, Github OAuth2 login)
  async findOneByOAuthProvider(oauthId: string, provider: string) {
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('findOneByOAuthProvider');

    const user = await this.userRepository.findOne({
      where: { oauthId, provider },
    });

    if (!user) {
      return buildFailure('FIND_ONE_USER_FAILED');
    }

    return buildSuccess('FIND_ONE_USER_SUCCESSFULLY', user);
  }

  // Create O Auth User (for creating new users when first logging in via Google or Github)
  async createOAuthUser(profile: CreateOAuthUserProfile, provider: string) {
    const { username, email, oauthId } = profile;
    const newUser = this.userRepository.create({
      username,
      email,
      oauthId,
      provider,
      createdAt: new Date(),
    });
    const user = await this.userRepository.save(newUser);
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('createOAuthUser');
    if (!user) return buildFailure('CREATE_OAUTH_USER_FAILED');

    return buildSuccess('CREATE_OAUTH_USER_SUCCESSFULLY', user);
  }

  async comparePasswords(inputPassword: string, storedPassword: string) {
    const result = bcrypt.compare(inputPassword, storedPassword);
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('comparePasswords');
    if (!result) return buildFailure('PASSWORDS_DIFFERENT');
    return buildSuccess('PASSWORDS_EQUAL');
  }

  async sendEmailVerificationLink(newEmail: string): Promise<void> {
    console.log(`sending link to newEmail${newEmail}`);
    // TODO Implement email verification logic
  }
}
