import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { User } from './user.module';
import { UserCreateDto } from './user-create.dto';
import { UserResponseDto } from './user-response.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.toDto(user));
  }

  @Post()
  @ApiBody({
    type: UserCreateDto,
    examples: {
      default: {
        summary: 'Default example',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'string',
      example: 'User created successfully',
    },
  })
  async create(@Body() userData: UserCreateDto): Promise<string> {
    const errors = await validate(userData);
    if (errors.length > 0) {
      return 'Validation failed';
    }

    const user = new User();
    Object.assign(user, userData);

    await this.userRepository.save(user);
    return 'User created successfully';
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: number): Promise<string> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      return 'User not found';
    }
    return 'User deleted successfully';
  }

  @Patch(':id')
  @ApiBody({
    type: UserCreateDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id') id: number,
    @Body() userData: UserCreateDto,
  ): Promise<string> {
    const errors = await validate(userData);
    if (errors.length > 0) {
      return 'Validation failed';
    }

    // Using findOneBy method
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return 'User not found';
    }

    Object.assign(user, userData);

    await this.userRepository.save(user);
    return 'User updated successfully';
  }

  private toDto(user: User): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userDto } = user;
    return userDto;
  }
}
