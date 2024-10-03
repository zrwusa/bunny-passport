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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UserMapper } from './mapper/user.mapper';
import { controllerResponseCreator } from '../../common';

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
    const { buildSuccess } =
      controllerResponseCreator.createBuilders('findAll');
    const users = data.map((user) => UserMapper.toResponseDto(user));
    if (success) return buildSuccess('FIND_USERS_SUCCESSFULLY', users);
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
    const { success, code, data } = res;
    const { buildSuccess } =
      controllerResponseCreator.createBuilders('deleteUser');
    if (success) return buildSuccess('USER_DELETED_SUCCESSFULLY', data);

    switch (code) {
      case 'USER_NOT_FOUND':
        throw new NotFoundException('USER_NOT_FOUND');
    }
  }
}
