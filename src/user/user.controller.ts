// src/user.controller.ts
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from './dto/response.dto';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DeleteDto } from './dto/delete.dto';
import { ServiceResponse } from '../interfaces';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: [ResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<ResponseDto[]> {
    const users = await this.userService.findAllUsers();
    return users.map((user) => this.toResponseDto(user));
  }

  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param() { id }: DeleteDto): Promise<ServiceResponse<User>> {
    return this.userService.deleteUser(id);
  }

  // Convert User entity to ResponseDto
  private toResponseDto(user: User): ResponseDto {
    const { id, username, email, createdAt, updatedAt } = user;
    return { id, username, email, createdAt, updatedAt };
  }
}
