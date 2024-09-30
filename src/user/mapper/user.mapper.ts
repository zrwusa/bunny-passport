import { User } from '../user.entity';
import { ResponseUserDto } from '../dto/response-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

export class UserMapper {
  static toResponseDto(user: User): ResponseUserDto {
    const { id, username, email, createdAt, updatedAt } = user;
    return { id, username, email, createdAt, updatedAt };
  }

  static toEntity(createUserDto: CreateUserDto): User {
    const { username, email } = createUserDto;
    const user = new User();
    user.username = username;
    user.email = email;
    // other fields...
    return user;
  }
}