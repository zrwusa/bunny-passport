import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            userService: {
              createUser: jest.fn(),
            },
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should return success response when user is registered successfully', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password123!',
      };

      jest.spyOn(authService.userService, 'createUser').mockResolvedValueOnce({
        success: true,
        serviceBusinessLogicCode: 'USER_CREATED_SUCCESSFULLY',
        message: 'User created successfully',
        data: {
          username: 'John Doe',
          email: 'john.doe@example.com',
          password:
            '$2b$10$VQLHcUEbaiENc7IqDpPPEue88N97KRXEEbaYYX1QrTPXAljvG.OSS',
          id: '411304409112728737',
          oauthId: null,
          provider: null,
          createdAt: new Date('2024-09-14T21:50:25.196Z'),
          updatedAt: new Date('2024-09-14T21:50:25.196Z'),
          setId: jest.fn().mockResolvedValueOnce(undefined),
        },
      });

      const response = await authController.register(registerDto);
      expect(response).toEqual({
        success: true,
        message: 'Registered successfully',
        controllerBusinessLogicCode: 'REGISTERED_SUCCESSFULLY',
        data: {
          username: 'John Doe',
          email: 'john.doe@example.com',
          password:
            '$2b$10$VQLHcUEbaiENc7IqDpPPEue88N97KRXEEbaYYX1QrTPXAljvG.OSS',
          id: '411304409112728737',
          oauthId: null,
          provider: null,
          createdAt: new Date('2024-09-14T21:50:25.196Z'),
          updatedAt: new Date('2024-09-14T21:50:25.196Z'),
          setId: expect.any(Function),
        },
      });
    });
  });
});
