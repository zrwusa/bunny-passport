// src/user.controller.ts
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseUserDto } from './dto/response-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';
import { createControllerResponseHandlers } from '../common';
import { UserMapper } from './mapper/user.mapper';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: [ResponseUserDto],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const res = await this.userService.findAllUsers();
    const { success, data } = res;
    const { buildSuccessResponse } =
      createControllerResponseHandlers('findAll');
    const users = data.map((user) => UserMapper.toResponseDto(user));
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
  async delete(@Param() { id }: DeleteUserDto) {
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
}
