// src/user.controller-business-logics.ts
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from './dto/response.dto';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DeleteDto } from './dto/delete.dto';
import { createControllerResponseHandlers } from '../common';

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
  async findAll() {
    const res = await this.userService.findAllUsers();
    const { success, data } = res;
    const { buildSuccessResponse } =
      createControllerResponseHandlers('findAll');
    const users = data.map((user) => this.toResponseDto(user));
    if (success) return buildSuccessResponse('FIND_USERS_SUCCESSFULLY', users);
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
  async delete(@Param() { id }: DeleteDto) {
    const res = await this.userService.deleteUser(id);
    const { success, serviceBusinessLogicCode, data } = res;
    const { buildSuccessResponse } =
      createControllerResponseHandlers('deleteUser');
    if (success) return buildSuccessResponse('USER_DELETED_SUCCESSFULLY', data);

    switch (serviceBusinessLogicCode) {
      case 'USER_NOT_FOUND':
        throw new NotFoundException('USER_NOT_FOUND');
    }
  }

  // Convert User entity to ResponseDto
  private toResponseDto(user: User): ResponseDto {
    const { id, username, email, createdAt, updatedAt } = user;
    return { id, username, email, createdAt, updatedAt };
  }
}
