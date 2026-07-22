import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('Vehicles (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'e2e-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    const admin = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass1',
      role: 'admin',
    });
    adminToken = admin.body.access_token;

    const user = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'userpass1',
    });
    userToken = user.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('GET /api/vehicles requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/vehicles').expect(401);
  });

  it('POST /api/vehicles is rejected for a non-admin user', async () => {
    await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 })
      .expect(403);
  });

  it('POST /api/vehicles creates a vehicle for an admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 })
      .expect(201);

    expect(res.body.make).toBe('Honda');
    vehicleId = res.body._id;
  });

  it('GET /api/vehicles lists vehicles for any authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/vehicles/search filters by make and price range', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/vehicles/search?make=Honda&minPrice=10000&maxPrice=30000')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.some((v: any) => v.make === 'Honda')).toBe(true);
  });

  it('POST /api/vehicles/:id/purchase decrements quantity', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);

    expect(res.body.quantity).toBe(2);
  });

  it('POST /api/vehicles/:id/restock is rejected for a non-admin user', async () => {
    await request(app.getHttpServer())
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5 })
      .expect(403);
  });

  it('POST /api/vehicles/:id/restock increments quantity for an admin', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 })
      .expect(201);

    expect(res.body.quantity).toBe(7);
  });

  it('DELETE /api/vehicles/:id is rejected for a non-admin user', async () => {
    await request(app.getHttpServer())
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('DELETE /api/vehicles/:id removes the vehicle for an admin', async () => {
    await request(app.getHttpServer())
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
