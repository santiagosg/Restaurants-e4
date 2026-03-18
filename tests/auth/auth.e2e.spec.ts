import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'CUSTOMER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = {
      imports: [AppModule],
      providers: [PrismaService],
    };

    app = await Test.createTestingModule(moduleFixture).compile();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Clean database
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean tables after each test
    await prisma.user.deleteMany();
  });

  describe('POST /auth/login', () => {
    describe('Casos exitosos', () => {
      it('debería autenticar un usuario válido', async () => {
        // Arrange
        await prisma.user.create({
          data: {
            ...mockUser,
          },
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
          .expect(200);

        // Assert
        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.user).not.toHaveProperty('password_hash');
        expect(body.data.tokens).toBeDefined();
        expect(body.data.tokens.access_token).toBeDefined();
        expect(body.data.tokens.refresh_token).toBeDefined();
      });

      it('debería guardar el token en variable de colección', async () => {
        // Arrange
        await prisma.user.create({
          data: {
            ...mockUser,
          },
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
          .expect(200);

        // Assert
        expect(response.body.data.tokens.access_token).toMatch(/^eyJ/);
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si email no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            password: 'password123',
          })
          .expect(400);

        const body = response.body;
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si contraseña no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si email tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'invalid-email',
            password: 'password123',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si contraseña tiene menos de 8 caracteres', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'short',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('Casos de error - Credenciales', () => {
      it('debería retornar 401 si email no existe', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });

      it('debería retornar 401 si contraseña es incorrecta', async () => {
        // Arrange
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.create({
          data: {
            ...mockUser,
            password_hash: hashedPassword,
          },
        });

        // Act
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('POST /auth/register', () => {
    describe('Casos exitosos', () => {
      it('debería registrar un nuevo usuario', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'SecurePass123!',
            full_name: 'Jane Doe',
            phone: '+1234567890',
            role: 'CUSTOMER',
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.user.id).toBeDefined();
        expect(body.data.user.email).toBe('newuser@example.com');
        expect(body.data.tokens.access_token).toBeDefined();
        expect(body.data.user.is_active).toBe(true);
      });

      it('debería asignar rol CUSTOMER por defecto', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'defaultrole@example.com',
            password: 'SecurePass123!',
            full_name: 'Default User',
          })
          .expect(201);

        expect(response.body.data.user.role).toBe('CUSTOMER');
      });

      it('debería hashear la contraseña antes de guardar', async () => {
        const spy = jest.spyOn(bcrypt, 'hash');

        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'hashed@example.com',
            password: 'Password123!',
            full_name: 'Hashed User',
          })
          .expect(201);

        expect(spy).toHaveBeenCalledWith('Password123!', 10);
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si email ya existe', async () => {
        await prisma.user.create({ data: mockUser });

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'SecurePass123!',
            full_name: 'Duplicate User',
          })
          .expect(409);

        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
        expect(response.body.error.message).toContain('ya registrado');
      });

      it('debería retornar 400 si email tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'invalid-email',
            password: 'SecurePass123!',
            full_name: 'Invalid Email User',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 422 si contraseña no cumple requisitos', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'weak@example.com',
            password: 'weak',
            full_name: 'Weak Password User',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si rol no es válido', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'invalidrole@example.com',
            password: 'SecurePass123!',
            full_name: 'Invalid Role User',
            role: 'INVALID_ROLE',
          })
          .expect(422);
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('debería renovar el token con un refresh válido', async () => {
      // Arrange
      const user = await prisma.user.create({ data: mockUser });
      const refreshToken = 'valid_refresh_token';

      // Mock JWT service
      jest.spyOn(jwtService, 'decode').mockImplementation(() => ({ sub: user.id, exp: Date.now() + 3600000 }));

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const body = response.body;
      expect(body.success).toBe(true);
      expect(body.data.access_token).toBeDefined();
    });

    it('debería retornar 401 con refresh token inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid_refresh_token' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /auth/logout', () => {
    it('debería cerrar sesión exitosamente con token válido', async () => {
      // Arrange
      await prisma.user.create({ data: mockUser });

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid_token')
        .send({})
        .expect(200);

      expect(response.body.data.message).toContain('Sesión cerrada');
    });

    it('debería retornar 401 con token inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid_token')
        .send({})
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
