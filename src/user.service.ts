// src/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.module';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './user-create.dto';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 获取所有用户
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

    if (userData.name && userData.name !== user.name) {
      user.name = userData.name;
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
