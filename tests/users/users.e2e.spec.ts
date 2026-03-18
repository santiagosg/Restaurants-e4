import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockAdmin = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'ADMIN',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCustomer = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    email: 'customer@example.com',
    full_name: 'Customer User',
    role: 'CUSTOMER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOwner = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    email: 'owner@example.com',
    full_name: 'Restaurant Owner',
    role: 'RESTAURANT_OWNER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  let adminToken: string;
  let customerToken: string;
  let ownerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = {
      imports: [AppModule],
      providers: [PrismaService],
    };

    app = await Test.createTestingModule(moduleFixture).compile();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    // Create test users
    await prisma.user.create({ data: mockAdmin });
    await prisma.user.create({ data: mockCustomer });
    await prisma.user.create({ data: mockOwner });

    // Get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });

    const ownerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password123' });

    adminToken = adminLogin.body.data.tokens.access_token;
    customerToken = customerLogin.body.data.tokens.access_token;
    ownerToken = ownerLogin.body.data.tokens.access_token;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean reservations and extra users after each test
    await prisma.reservation.deleteMany();
  });

  describe('GET /users/:id', () => {
    describe('Casos exitosos', () => {
      it('debería obtener perfil del usuario actual', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(mockCustomer.id);
        expect(body.data.email).toBe('customer@example.com');
        expect(body.data).not.toHaveProperty('password_hash');
      });

      it('debería permitir al admin ver cualquier usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockOwner.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.id).toBe(mockOwner.id);
        expect(response.body.data.role).toBe('RESTAURANT_OWNER');
      });

      it('debería incluir estadísticas de reservas', async () => {
        // Create a reservation for the customer
        const restaurant = await prisma.restaurant.create({
          data: {
            id: '880e8400-e29b-41d4-a716-446655440003',
            owner_id: mockOwner.id,
            name: 'Test Restaurant',
            cuisine_type: 'Italian',
            address: '123 Main St',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28001',
            phone: '+34912345678',
            email: 'test@restaurant.com',
          },
        });

        const table = await prisma.table.create({
          data: {
            id: '990e8400-e29b-41d4-a716-446655440004',
            restaurant_id: restaurant.id,
            table_number: 1,
            capacity: 4,
          },
        });

        await prisma.reservation.create({
          data: {
            id: 'aa0e8400-e29b-41d4-a716-446655440005',
            restaurant_id: restaurant.id,
            user_id: mockCustomer.id,
            table_id: table.id,
            reservation_date: new Date('2024-12-25'),
            reservation_time: '19:30',
            party_size: 4,
            status: 'CONFIRMED',
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.statistics).toBeDefined();
        expect(response.body.data.statistics.total_reservations).toBe(1);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta ver otro usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockOwner.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });

      it('debería retornar 401 con token inválido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}`)
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si usuario no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('PATCH /users/:id', () => {
    describe('Casos exitosos', () => {
      it('debería actualizar nombre del usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            full_name: 'Updated Name',
          })
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.full_name).toBe('Updated Name');
        expect(body.data.email).toBe('customer@example.com');
      });

      it('debería actualizar teléfono del usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            phone: '+34987654321',
          })
          .expect(200);

        expect(response.body.data.phone).toBe('+34987654321');
      });

      it('debería permitir al admin actualizar cualquier usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            full_name: 'Admin Updated Name',
          })
          .expect(200);

        expect(response.body.data.full_name).toBe('Admin Updated Name');
      });

      it('debería permitir al admin desactivar usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            is_active: false,
          })
          .expect(200);

        expect(response.body.data.is_active).toBe(false);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta actualizar otro usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockOwner.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            full_name: 'Attempted Update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 403 si customer intenta cambiar rol', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            role: 'ADMIN',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .send({
            full_name: 'No Auth',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            full_name: 'Test',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si full_name excede 100 caracteres', async () => {
        const longName = 'A'.repeat(101);
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            full_name: longName,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si phone tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            phone: 'invalid-phone',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 422 si rol no es válido', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${mockCustomer.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            role: 'INVALID_ROLE',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /users/:id/reservations', () => {
    describe('Casos exitosos', () => {
      it('debería obtener reservas del usuario con paginación', async () => {
        // Create restaurant and table
        const restaurant = await prisma.restaurant.create({
          data: {
            id: 'bb0e8400-e29b-41d4-a716-446655440006',
            owner_id: mockOwner.id,
            name: 'Test Restaurant 2',
            cuisine_type: 'Italian',
            address: '456 Main St',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28002',
            phone: '+34912345679',
            email: 'test2@restaurant.com',
          },
        });

        const table = await prisma.table.create({
          data: {
            id: 'cc0e8400-e29b-41d4-a716-446655440007',
            restaurant_id: restaurant.id,
            table_number: 1,
            capacity: 4,
          },
        });

        // Create multiple reservations
        for (let i = 0; i < 3; i++) {
          await prisma.reservation.create({
            data: {
              id: `dd0e8400-e29b-41d4-a716-44665544000${i + 8}`,
              restaurant_id: restaurant.id,
              user_id: mockCustomer.id,
              table_id: table.id,
              reservation_date: new Date(`2024-12-${25 + i}`),
              reservation_time: '19:30',
              party_size: 4,
              status: i === 0 ? 'CONFIRMED' : 'PENDING',
            },
          });
        }

        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations?page=1&per_page=2`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.per_page).toBe(2);
        expect(body.pagination.total).toBe(3);
      });

      it('debería filtrar por estado de reserva', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations?status=CONFIRMED`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.data).toBeDefined();
        body.data.forEach((reservation: any) => {
          expect(reservation.status).toBe('CONFIRMED');
        });
      });

      it('debería incluir información del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        if (response.body.data.length > 0) {
          expect(response.body.data[0].restaurant).toBeDefined();
          expect(response.body.data[0].restaurant.name).toBeDefined();
        }
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta ver reservas de otro', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockOwner.id}/reservations`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si page no es número positivo', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations?page=-1`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si per_page excede 100', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations?per_page=101`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 422 si status no es válido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/reservations?status=INVALID`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /users/:id/statistics', () => {
    describe('Casos exitosos', () => {
      it('debería obtener estadísticas del usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/statistics`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.total_reservations).toBeDefined();
        expect(body.data.completed_reservations).toBeDefined();
        expect(body.data.cancelled_reservations).toBeDefined();
        expect(body.data.total_orders).toBeDefined();
        expect(body.data.total_reviews).toBeDefined();
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta ver estadísticas de otro', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockOwner.id}/statistics`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${mockCustomer.id}/statistics`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
  });
});
