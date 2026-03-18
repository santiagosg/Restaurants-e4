import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AvailabilityController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockOwner = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'owner@example.com',
    full_name: 'Restaurant Owner',
    role: 'RESTAURANT_OWNER',
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

  let customerToken: string;
  let testRestaurantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = {
      imports: [AppModule],
      providers: [PrismaService],
    };

    app = await Test.createTestingModule(moduleFixture).compile();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    // Create test users
    await prisma.user.create({ data: mockOwner });
    await prisma.user.create({ data: mockCustomer });

    // Get customer token
    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });

    customerToken = customerLogin.body.data.tokens.access_token;

    // Create test restaurant
    testRestaurantId = '770e8400-e29b-41d4-a716-446655440002';
    await prisma.restaurant.create({
      data: {
        id: testRestaurantId,
        owner_id: mockOwner.id,
        name: 'Test Restaurant',
        cuisine_type: 'Italian',
        address: '123 Test St',
        city: 'Madrid',
        country: 'Spain',
        zip_code: '28001',
        phone: '+34912345678',
        email: 'test@restaurant.com',
      },
    });

    // Create test tables
    await prisma.table.create({
      data: {
        id: '880e8400-e29b-41d4-a716-446655440003',
        restaurant_id: testRestaurantId,
        table_number: 1,
        capacity: 2,
        location: 'Window Side',
      },
    });

    await prisma.table.create({
      data: {
        id: '990e8400-e29b-41d4-a716-446655440004',
        restaurant_id: testRestaurantId,
        table_number: 2,
        capacity: 4,
        location: 'Main Hall',
      },
    });

    await prisma.table.create({
      data: {
        id: 'aa0e8400-e29b-41d4-a716-446655440005',
        restaurant_id: testRestaurantId,
        table_number: 3,
        capacity: 6,
        location: 'Terrace',
      },
    });

    // Create restaurant hours
    const hours = [];
    for (let day = 1; day <= 7; day++) {
      hours.push({
        id: `bb0e8400-e29b-41d4-a716-446655440${day + 5}`,
        restaurant_id: testRestaurantId,
        day_of_week: day,
        open_time: '12:00',
        close_time: '15:00',
        is_closed: false,
      });
      hours.push({
        id: `cc0e8400-e29b-41d4-a716-446655440${day + 12}`,
        restaurant_id: testRestaurantId,
        day_of_week: day,
        open_time: '19:00',
        close_time: '23:00',
        is_closed: false,
      });
    }
    await prisma.restaurantHour.createMany({ data: hours });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean reservations after each test
    await prisma.reservation.deleteMany();
  });

  describe('GET /restaurants/:id/availability', () => {
    describe('Casos exitosos', () => {
      it('debería verificar disponibilidad sin autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.is_available).toBeDefined();
        expect(typeof body.data.is_available).toBe('boolean');
      });

      it('debería retornar mesas disponibles', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(200);

        expect(body.data.available_tables).toBeDefined();
        expect(Array.isArray(body.data.available_tables)).toBe(true);
      });

      it('debería sugerir horarios alternativos si no hay disponibilidad', async () => {
        // Create a reservation that blocks the table
        const table = await prisma.table.findFirst({
          where: { restaurant_id: testRestaurantId, capacity: { gte: 4 } },
        });

        await prisma.reservation.create({
          data: {
            id: 'dd0e8400-e29b-41d4-a716-446655440020',
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            table_id: table!.id,
            reservation_date: new Date('2024-12-25'),
            reservation_time: '19:30',
            party_size: 4,
            status: 'CONFIRMED',
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(200);

        expect(body.data.suggested_times).toBeDefined();
        expect(Array.isArray(body.data.suggested_times)).toBe(true);
      });

      it('debería asignar mesa según tamaño del grupo', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-26',
            time: '20:00',
            party_size: 4,
          })
          .expect(200);

        if (body.data.is_available && body.data.available_tables.length > 0) {
          const assignedTable = body.data.available_tables[0];
          expect(assignedTable.capacity).toBeGreaterThanOrEqual(4);
        }
      });

      it('debería manejar grupo pequeño (2 personas)', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-27',
            time: '19:00',
            party_size: 2,
          })
          .expect(200);

        expect(body.data.is_available).toBeDefined();
        // Should find table with capacity >= 2
        if (body.data.available_tables.length > 0) {
          expect(body.data.available_tables[0].capacity).toBeGreaterThanOrEqual(2);
        }
      });

      it('debería manejar grupo grande (6 personas)', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-28',
            time: '20:30',
            party_size: 6,
          })
          .expect(200);

        expect(body.data.is_available).toBeDefined();
        // Should find table with capacity >= 6 or return false
        if (body.data.available_tables.length > 0) {
          expect(body.data.available_tables[0].capacity).toBeGreaterThanOrEqual(6);
        }
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si date no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            time: '19:30',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si time no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si date tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: 'invalid-date',
            time: '19:30',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si time tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: 'invalid-time',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size es menor que 1', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 0,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size excede máximo permitido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 21,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/invalid-id/availability')
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/00000000-0000-0000-0000-000000000000/availability')
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 404 si restaurante está inactivo', async () => {
        const inactiveRestaurant = await prisma.restaurant.create({
          data: {
            id: 'ee0e8400-e29b-41d4-a716-446655440021',
            owner_id: mockOwner.id,
            name: 'Inactive Restaurant',
            cuisine_type: 'Italian',
            address: '123 Inactive St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'inactive@restaurant.com',
            is_active: false,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${inactiveRestaurant.id}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 422 si fecha es pasada', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2020-01-01',
            time: '19:30',
            party_size: 4,
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si restaurante está cerrado en esa fecha/hora', async () => {
        // Update hours to be closed
        await prisma.restaurantHour.updateMany({
          where: { restaurant_id: testRestaurantId },
          data: { is_closed: true },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 4,
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');

        // Restore hours
        await prisma.restaurantHour.updateMany({
          where: { restaurant_id: testRestaurantId },
          data: { is_closed: false },
        });
      });

      it('debería retornar 422 si no hay mesas con capacidad suficiente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability`)
          .query({
            date: '2024-12-25',
            time: '19:30',
            party_size: 20,
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /restaurants/:id/availability/dates', () => {
    describe('Casos exitosos', () => {
      it('debería listar fechas disponibles en el rango', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-25',
            end_date: '2024-12-31',
            party_size: 4,
          })
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data)).toBe(true);
      });

      it('debería incluir estado de disponibilidad por fecha', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-25',
            end_date: '2024-12-25',
            party_size: 4,
          })
          .expect(200);

        if (body.data.length > 0) {
          expect(body.data[0]).toHaveProperty('date');
          expect(body.data[0]).toHaveProperty('has_availability');
          expect(body.data[0]).toHaveProperty('available_time_slots');
        }
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si start_date no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            end_date: '2024-12-31',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si end_date no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-25',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-25',
            end_date: '2024-12-31',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si end_date es anterior a start_date', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-31',
            end_date: '2024-12-25',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si el rango excede 90 días', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/dates`)
          .query({
            start_date: '2024-12-25',
            end_date: '2025-12-25',
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('GET /restaurants/:id/availability/times', () => {
    describe('Casos exitosos', () => {
      it('debería listar horarios disponibles para una fecha', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/times`)
          .query({
            date: '2024-12-25',
            party_size: 4,
          })
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data)).toBe(true);
      });

      it('debería incluir intervalos de tiempo con disponibilidad', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/times`)
          .query({
            date: '2024-12-25',
            party_size: 4,
          })
          .expect(200);

        if (body.data.length > 0) {
          expect(body.data[0]).toHaveProperty('time');
          expect(body.data[0]).toHaveProperty('is_available');
          expect(body.data[0]).toHaveProperty('available_tables');
        }
      });

      it('debería respetar horarios del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/times`)
          .query({
            date: '2024-12-25',
            party_size: 2,
          })
          .expect(200);

        // Should only show times within open hours (12:00-15:00 and 19:00-23:00)
        body.data.forEach((slot: any) => {
          const time = parseInt(slot.time.substring(0, 2));
          expect(
            (time >= 12 && time < 15) || (time >= 19 && time < 23)
          ).toBe(true);
        });
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si date no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/times`)
          .query({
            party_size: 4,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size no está presente', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/availability/times`)
          .query({
            date: '2024-12-25',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });
});
