import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  // A minimal mock of the Mongoose model constructor + static methods we use.
  const mockUserModel: any = jest.fn();

  const mockUserDoc = {
    _id: 'user-id-123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashed-password',
    role: Role.USER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUserModel.findOne = jest.fn();
    mockUserModel.mockImplementation((doc: any) => ({
      ...doc,
      _id: 'user-id-123',
      save: jest.fn().mockResolvedValue({ ...doc, _id: 'user-id-123' }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('throws a ConflictException when the email is already registered', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserDoc);

      await expect(
        service.register({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password and returns an access token on success', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const hashSpy = (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', 10);
      expect(result).toHaveProperty('access_token', 'signed.jwt.token');
      expect(result.user.email).toBe('jane@example.com');
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserDoc);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns an access token when credentials are valid', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserDoc);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUserDoc._id,
        email: mockUserDoc.email,
        role: mockUserDoc.role,
      });
      expect(result.access_token).toBe('signed.jwt.token');
    });
  });
});
