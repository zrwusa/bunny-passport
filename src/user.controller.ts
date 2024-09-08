// src/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserCreateDto } from './user-create.dto';
import { UserResponseDto } from './user-response.dto';
import { UserService } from './user.service';
import { User } from './user.module';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAllUsers();
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
    return this.userService.createUser(userData);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('google')) // Add the Google AuthGuard here
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
    return this.userService.updateUser(id, userData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('google')) // Add the Google AuthGuard here
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: number): Promise<string> {
    return this.userService.deleteUser(id);
  }

  // Convert User entity to UserResponseDto
  private toDto(user: User): UserResponseDto {
    const { id, name, email, createdAt, updatedAt } = user;
    return { id, name, email, createdAt, updatedAt };
  }
}
